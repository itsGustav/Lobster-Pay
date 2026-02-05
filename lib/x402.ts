/**
 * x402 Protocol Client - Multi-Chain Support
 * Handles HTTP 402 Payment Required responses
 * Supports Base and Solana payments
 */

import { ChainProvider, ChainName } from './chains';

export interface X402PaymentChallenge {
  version: '1';
  chains: Array<{
    chain: 'base' | 'solana' | 'ethereum';
    network: string;
    receiver: string;
    asset: string;
    amount: string;
  }>;
  description: string;
  expires: number;
  nonce: string;
}

export interface X402PaymentProof {
  chain: ChainName;
  txHash: string;
  amount: string;
  receiver: string;
  nonce: string;
  timestamp: number;
}

export interface X402Config {
  providers: Map<ChainName, ChainProvider>;
  maxAutoPayUSDC?: number;
  preferredChain?: ChainName;
  onPayment?: (proof: X402PaymentProof) => void;
  onChallenge?: (challenge: X402PaymentChallenge) => void;
}

/**
 * X402 Client - Handles automatic payments
 */
export class X402Client {
  private providers: Map<ChainName, ChainProvider>;
  private maxAutoPayUSDC?: number;
  private preferredChain?: ChainName;
  private onPayment?: (proof: X402PaymentProof) => void;
  private onChallenge?: (challenge: X402PaymentChallenge) => void;
  
  // Receipt cache (in-memory for now)
  private receiptCache: Map<string, X402PaymentProof> = new Map();

  constructor(config: X402Config) {
    this.providers = config.providers;
    this.maxAutoPayUSDC = config.maxAutoPayUSDC;
    this.preferredChain = config.preferredChain;
    this.onPayment = config.onPayment;
    this.onChallenge = config.onChallenge;
  }

  /**
   * Enhanced fetch with x402 support
   */
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    // Check cache first
    const cachedProof = this.receiptCache.get(url);
    if (cachedProof && cachedProof.timestamp + 3600 > Date.now() / 1000) {
      // Use cached payment proof
      return this.fetchWithProof(url, cachedProof, options);
    }

    // Try without payment first
    let response = await fetch(url, options);

    // Handle 402 Payment Required
    if (response.status === 402) {
      const challenge = await this.parseChallenge(response);
      
      if (!challenge) {
        throw new Error('Invalid 402 response: missing payment challenge');
      }

      this.onChallenge?.(challenge);

      // Execute payment
      const proof = await this.pay(challenge);
      
      this.onPayment?.(proof);

      // Cache proof
      this.receiptCache.set(url, proof);

      // Retry with proof
      response = await this.fetchWithProof(url, proof, options);
    }

    return response;
  }

  /**
   * Parse payment challenge from 402 response
   */
  private async parseChallenge(response: Response): Promise<X402PaymentChallenge | null> {
    try {
      const body = await response.json();
      
      if (body['x-payment-required']) {
        return body['x-payment-required'] as X402PaymentChallenge;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Execute payment for challenge
   */
  private async pay(challenge: X402PaymentChallenge): Promise<X402PaymentProof> {
    // Check expiration
    if (challenge.expires < Date.now() / 1000) {
      throw new Error('Payment challenge expired');
    }

    // Select chain to pay with
    const paymentOption = this.selectPaymentOption(challenge);
    
    if (!paymentOption) {
      const chains = challenge.chains.map(c => c.chain).join(', ');
      throw new Error(`No provider available for supported chains: ${chains}`);
    }

    const { chain, receiver, amount } = paymentOption;
    const provider = this.providers.get(chain);
    
    if (!provider) {
      throw new Error(`Provider not found for chain: ${chain}`);
    }

    // Check amount limit
    const amountNum = parseFloat(amount);
    if (this.maxAutoPayUSDC && amountNum > this.maxAutoPayUSDC) {
      throw new Error(
        `Payment amount ${amountNum} USDC exceeds limit ${this.maxAutoPayUSDC} USDC`
      );
    }

    console.log(`💳 [x402] Paying ${amount} USDC on ${chain} to ${receiver}`);

    // Execute payment
    const txHash = await provider.sendUSDC(receiver, amountNum);
    
    // Wait for confirmation
    await provider.waitForConfirmation(txHash);

    const proof: X402PaymentProof = {
      chain,
      txHash,
      amount,
      receiver,
      nonce: challenge.nonce,
      timestamp: Math.floor(Date.now() / 1000),
    };

    return proof;
  }

  /**
   * Select best payment option from challenge
   */
  private selectPaymentOption(challenge: X402PaymentChallenge): {
    chain: ChainName;
    receiver: string;
    amount: string;
  } | null {
    // Try preferred chain first
    if (this.preferredChain) {
      const option = challenge.chains.find(
        c => c.chain === this.preferredChain && this.providers.has(this.preferredChain)
      );
      if (option) {
        return {
          chain: this.preferredChain,
          receiver: option.receiver,
          amount: option.amount,
        };
      }
    }

    // Find first available chain
    for (const option of challenge.chains) {
      const chain = option.chain as ChainName;
      if (this.providers.has(chain)) {
        return {
          chain,
          receiver: option.receiver,
          amount: option.amount,
        };
      }
    }

    return null;
  }

  /**
   * Fetch with payment proof headers
   */
  private async fetchWithProof(
    url: string,
    proof: X402PaymentProof,
    options?: RequestInit
  ): Promise<Response> {
    const headers = new Headers(options?.headers);
    
    // Add payment proof headers
    headers.set('X-Payment-Chain', proof.chain);
    headers.set('X-Payment-TxHash', proof.txHash);
    headers.set('X-Payment-Amount', proof.amount);
    headers.set('X-Payment-Nonce', proof.nonce);
    headers.set('X-Payment-Timestamp', proof.timestamp.toString());

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Clear receipt cache
   */
  clearCache(): void {
    this.receiptCache.clear();
  }

  /**
   * Get cached receipts
   */
  getCachedReceipts(): X402PaymentProof[] {
    return Array.from(this.receiptCache.values());
  }
}

/**
 * Helper: Create x402 fetch function
 */
export function createX402Fetch(config: X402Config): (url: string, options?: RequestInit) => Promise<Response> {
  const client = new X402Client(config);
  return (url: string, options?: RequestInit) => client.fetch(url, options);
}
