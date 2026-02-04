/**
 * ERC-8004 Reputation Registry Client
 * 
 * Post feedback, query reputation, and manage trust levels.
 */

import { ethers } from 'ethers';
import {
  CHAIN_CONFIG,
  REPUTATION_REGISTRY_ABI,
  SupportedChain,
  Feedback,
  ReputationSummary,
  TRUST_LEVELS,
} from './constants';

export interface ReputationClientConfig {
  chain: SupportedChain;
  privateKey?: string;
  provider?: ethers.Provider;
}

export interface FeedbackInput {
  agentId: number;
  score: number; // -100 to 100
  context: string;
  taskHash?: string; // Hash of the task/transaction being rated
}

export class ReputationClient {
  private chain: SupportedChain;
  private provider: ethers.Provider;
  private signer?: ethers.Wallet;
  private contract: ethers.Contract;
  private readOnlyContract: ethers.Contract;

  constructor(config: ReputationClientConfig) {
    this.chain = config.chain;
    const chainConfig = CHAIN_CONFIG[config.chain];
    
    this.provider = config.provider || new ethers.JsonRpcProvider(chainConfig.rpcUrl);
    
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
      this.contract = new ethers.Contract(
        chainConfig.contracts.reputationRegistry,
        REPUTATION_REGISTRY_ABI,
        this.signer
      );
    }
    
    this.readOnlyContract = new ethers.Contract(
      chainConfig.contracts.reputationRegistry,
      REPUTATION_REGISTRY_ABI,
      this.provider
    );
  }

  /**
   * Post feedback for an agent
   * 
   * @param feedback Feedback to post
   * @returns The feedbackId
   */
  async postFeedback(feedback: FeedbackInput): Promise<number> {
    if (!this.contract || !this.signer) {
      throw new Error('Signer required to post feedback');
    }

    // Validate score range
    if (feedback.score < -100 || feedback.score > 100) {
      throw new Error('Score must be between -100 and 100');
    }

    // Create task hash if not provided
    const taskHash = feedback.taskHash 
      ? ethers.id(feedback.taskHash)
      : ethers.id(`feedback-${Date.now()}-${Math.random()}`);

    console.log(`Posting feedback for agent ${feedback.agentId}: score=${feedback.score}`);
    
    const tx = await this.contract.postFeedback(
      feedback.agentId,
      feedback.score,
      feedback.context,
      taskHash
    );
    const receipt = await tx.wait();
    
    // Extract feedbackId from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.contract.interface.parseLog(log);
        return parsed?.name === 'FeedbackPosted';
      } catch {
        return false;
      }
    });
    
    if (!event) {
      throw new Error('FeedbackPosted event not found');
    }
    
    const parsed = this.contract.interface.parseLog(event);
    const feedbackId = Number(parsed?.args?.feedbackId);
    
    console.log(`Feedback posted with ID: ${feedbackId}`);
    
    return feedbackId;
  }

  /**
   * Post feedback after a successful x402 payment
   * 
   * Links the feedback to the payment transaction for verification
   */
  async postPaymentFeedback(options: {
    agentId: number;
    score: number;
    context: string;
    paymentTxHash: string;
    paymentAmount: string;
    serviceUsed: string;
  }): Promise<number> {
    const enrichedContext = JSON.stringify({
      type: 'x402-payment-feedback',
      context: options.context,
      payment: {
        txHash: options.paymentTxHash,
        amount: options.paymentAmount,
        service: options.serviceUsed,
      },
      timestamp: new Date().toISOString(),
    });

    return this.postFeedback({
      agentId: options.agentId,
      score: options.score,
      context: enrichedContext,
      taskHash: options.paymentTxHash,
    });
  }

  /**
   * Get a specific feedback entry
   */
  async getFeedback(feedbackId: number): Promise<Feedback | null> {
    try {
      const result = await this.readOnlyContract.getFeedback(feedbackId);
      
      return {
        feedbackId,
        agentId: Number(result.agentId),
        author: result.author,
        score: Number(result.score),
        context: result.context,
        taskHash: result.taskHash,
        timestamp: Number(result.timestamp),
      };
    } catch {
      return null;
    }
  }

  /**
   * Get feedback count for an agent
   */
  async getFeedbackCount(agentId: number): Promise<number> {
    const count = await this.readOnlyContract.getFeedbackCount(agentId);
    return Number(count);
  }

  /**
   * Get recent feedback for an agent
   */
  async getRecentFeedback(agentId: number, limit: number = 10): Promise<Feedback[]> {
    const feedbackIds: bigint[] = await this.readOnlyContract.getFeedbackByAgent(
      agentId,
      0,
      limit
    );
    
    const feedbacks = await Promise.all(
      feedbackIds.map(id => this.getFeedback(Number(id)))
    );
    
    return feedbacks.filter((f): f is Feedback => f !== null);
  }

  /**
   * Get average score for an agent
   */
  async getAverageScore(agentId: number): Promise<{ average: number; count: number }> {
    const [average, count] = await this.readOnlyContract.getAverageScore(agentId);
    return {
      average: Number(average),
      count: Number(count),
    };
  }

  /**
   * Get comprehensive reputation summary for an agent
   */
  async getReputationSummary(agentId: number): Promise<ReputationSummary> {
    const [{ average, count }, recentFeedback] = await Promise.all([
      this.getAverageScore(agentId),
      this.getRecentFeedback(agentId, 5),
    ]);

    // Determine trust level based on score and feedback count
    let trustLevel: ReputationSummary['trustLevel'] = 'untrusted';
    
    if (count >= TRUST_LEVELS.verified.minFeedback && average >= TRUST_LEVELS.verified.minScore) {
      trustLevel = 'verified';
    } else if (count >= TRUST_LEVELS.trusted.minFeedback && average >= TRUST_LEVELS.trusted.minScore) {
      trustLevel = 'trusted';
    } else if (count >= TRUST_LEVELS.established.minFeedback && average >= TRUST_LEVELS.established.minScore) {
      trustLevel = 'established';
    } else if (count >= TRUST_LEVELS.emerging.minFeedback && average >= TRUST_LEVELS.emerging.minScore) {
      trustLevel = 'emerging';
    } else if (count >= TRUST_LEVELS.new.minFeedback && average >= TRUST_LEVELS.new.minScore) {
      trustLevel = 'new';
    }

    return {
      agentId,
      averageScore: average,
      totalFeedback: count,
      recentFeedback,
      trustLevel,
    };
  }

  /**
   * Authorize an address to post feedback for your agent
   */
  async authorizeFeedbackAuthor(agentId: number, author: string): Promise<void> {
    if (!this.contract) {
      throw new Error('Signer required');
    }
    
    const tx = await this.contract.authorizeFeedback(agentId, author);
    await tx.wait();
    
    console.log(`Authorized ${author} to post feedback for agent ${agentId}`);
  }

  /**
   * Revoke feedback authorization
   */
  async revokeFeedbackAuthorization(agentId: number, author: string): Promise<void> {
    if (!this.contract) {
      throw new Error('Signer required');
    }
    
    const tx = await this.contract.revokeFeedbackAuthorization(agentId, author);
    await tx.wait();
    
    console.log(`Revoked feedback authorization for ${author} on agent ${agentId}`);
  }

  /**
   * Check if an address is authorized to post feedback
   */
  async isAuthorizedFeedbackAuthor(agentId: number, author: string): Promise<boolean> {
    return this.readOnlyContract.isAuthorizedFeedbackAuthor(agentId, author);
  }

  /**
   * Check if an agent meets minimum trust requirements
   */
  async meetsMinimumTrust(agentId: number, minLevel: ReputationSummary['trustLevel']): Promise<boolean> {
    const summary = await this.getReputationSummary(agentId);
    
    const levelOrder: ReputationSummary['trustLevel'][] = [
      'untrusted', 'new', 'emerging', 'established', 'trusted', 'verified'
    ];
    
    return levelOrder.indexOf(summary.trustLevel) >= levelOrder.indexOf(minLevel);
  }

  /**
   * Calculate trust score for payment decisions
   * 
   * Returns a 0-100 score combining reputation and feedback volume
   */
  async calculateTrustScore(agentId: number): Promise<number> {
    const summary = await this.getReputationSummary(agentId);
    
    // Weight: 70% average score, 30% volume bonus
    const scoreComponent = Math.max(0, (summary.averageScore + 100) / 2); // Normalize -100..100 to 0..100
    const volumeBonus = Math.min(30, summary.totalFeedback * 0.3); // Max 30 points from volume
    
    return Math.round(scoreComponent * 0.7 + volumeBonus);
  }
}

/**
 * Standard feedback templates for common scenarios
 */
export const FeedbackTemplates = {
  // Positive feedback
  excellentService: (details?: string) => ({
    score: 95,
    context: `Excellent service. ${details || 'Highly recommended.'}`,
  }),
  
  goodService: (details?: string) => ({
    score: 75,
    context: `Good service. ${details || 'Would use again.'}`,
  }),
  
  satisfactory: (details?: string) => ({
    score: 50,
    context: `Satisfactory service. ${details || 'Met expectations.'}`,
  }),
  
  // Negative feedback
  poorService: (details?: string) => ({
    score: -50,
    context: `Poor service. ${details || 'Did not meet expectations.'}`,
  }),
  
  failed: (details?: string) => ({
    score: -90,
    context: `Service failed. ${details || 'Would not recommend.'}`,
  }),
  
  // Payment-specific
  paymentSuccessful: (txHash: string, amount: string) => ({
    score: 80,
    context: JSON.stringify({
      type: 'payment-feedback',
      result: 'success',
      txHash,
      amount,
    }),
  }),
  
  paymentFailed: (reason: string) => ({
    score: -70,
    context: JSON.stringify({
      type: 'payment-feedback',
      result: 'failed',
      reason,
    }),
  }),
  
  // Escrow-specific
  escrowCompleted: (escrowId: string, outcome: 'released' | 'refunded') => ({
    score: outcome === 'released' ? 85 : 40,
    context: JSON.stringify({
      type: 'escrow-feedback',
      escrowId,
      outcome,
    }),
  }),
  
  escrowDisputed: (escrowId: string, reason: string) => ({
    score: -30,
    context: JSON.stringify({
      type: 'escrow-feedback',
      escrowId,
      outcome: 'disputed',
      reason,
    }),
  }),
};
