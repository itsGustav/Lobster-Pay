/**
 * Real Estate Escrow Module
 * 
 * Smart contract-style escrow for earnest money deposits,
 * rental security deposits, and closing funds.
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export type EscrowType = 'earnest_money' | 'security_deposit' | 'closing_funds' | 'general';

export type EscrowStatus = 
  | 'created'
  | 'funded'
  | 'pending_release'
  | 'released'
  | 'refunded'
  | 'disputed'
  | 'cancelled';

export interface EscrowParty {
  role: 'buyer' | 'seller' | 'landlord' | 'tenant' | 'agent' | 'title_company' | 'depositor' | 'recipient';
  name: string;
  email?: string;
  phone?: string;
  walletAddress?: string;
  sessionId?: string;  // For Clawdbot agent approval
}

export interface EscrowCondition {
  id: string;
  description: string;
  type: 'inspection' | 'financing' | 'appraisal' | 'title' | 'closing' | 'move_out' | 'custom';
  status: 'pending' | 'satisfied' | 'waived' | 'failed';
  deadline?: string;
  satisfiedAt?: string;
  satisfiedBy?: string;
  evidence?: string;  // URL or description of proof
}

export interface Escrow {
  id: string;
  type: EscrowType;
  status: EscrowStatus;
  
  // Property/transaction info
  property?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    mlsNumber?: string;
  };
  
  // Parties
  parties: EscrowParty[];
  
  // Funds
  amount: string;
  chain: string;
  escrowAddress: string;  // Smart contract or custody address
  fundingTxHash?: string;
  fundedAt?: string;
  
  // Conditions for release
  conditions: EscrowCondition[];
  releaseRequires: 'all_conditions' | 'majority_approval' | 'any_party';
  
  // Approvals for release
  approvals: {
    partyRole: string;
    approved: boolean;
    timestamp: string;
    note?: string;
  }[];
  requiredApprovals: string[];  // Roles that must approve
  
  // Release/refund
  releaseTo?: string;  // Address
  releaseToRole?: string;
  releaseTxHash?: string;
  releasedAt?: string;
  
  // Dispute
  dispute?: {
    raisedBy: string;
    reason: string;
    raisedAt: string;
    resolution?: string;
    resolvedAt?: string;
  };
  
  // Deadlines
  fundingDeadline?: string;
  closingDate?: string;
  leaseEndDate?: string;
  
  // Metadata
  notes?: string;
  documents: { name: string; url: string; uploadedAt: string }[];
  
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = process.env.USDC_DATA_DIR || './data';

/**
 * Escrow Manager
 */
export class EscrowManager {
  private dataPath: string;

  constructor(dataDir = DATA_DIR) {
    this.dataPath = path.join(dataDir, 'escrows.json');
  }

  private async loadEscrows(): Promise<Escrow[]> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async saveEscrows(escrows: Escrow[]): Promise<void> {
    await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
    await fs.writeFile(this.dataPath, JSON.stringify(escrows, null, 2));
  }

  // ============ Escrow Creation ============

  /**
   * Create earnest money escrow
   */
  async createEarnestMoney(params: {
    property: Escrow['property'];
    amount: string;
    chain: string;
    buyer: Omit<EscrowParty, 'role'>;
    seller: Omit<EscrowParty, 'role'>;
    agent?: Omit<EscrowParty, 'role'>;
    closingDate?: string;
    conditions?: Omit<EscrowCondition, 'id' | 'status'>[];
  }): Promise<Escrow> {
    const escrows = await this.loadEscrows();

    const parties: EscrowParty[] = [
      { ...params.buyer, role: 'buyer' },
      { ...params.seller, role: 'seller' },
    ];
    if (params.agent) {
      parties.push({ ...params.agent, role: 'agent' });
    }

    // Default conditions for earnest money
    const defaultConditions: EscrowCondition[] = [
      {
        id: crypto.randomUUID(),
        description: 'Home inspection satisfactory',
        type: 'inspection',
        status: 'pending',
        deadline: this.addDays(new Date(), 10).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        description: 'Financing approved',
        type: 'financing',
        status: 'pending',
        deadline: this.addDays(new Date(), 21).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        description: 'Title clear',
        type: 'title',
        status: 'pending',
      },
    ];

    const customConditions = (params.conditions || []).map(c => ({
      ...c,
      id: crypto.randomUUID(),
      status: 'pending' as const,
    }));

    const escrow: Escrow = {
      id: `EM-${Date.now().toString(36).toUpperCase()}`,
      type: 'earnest_money',
      status: 'created',
      property: params.property,
      parties,
      amount: params.amount,
      chain: params.chain,
      escrowAddress: this.generateEscrowAddress(),
      conditions: [...defaultConditions, ...customConditions],
      releaseRequires: 'all_conditions',
      approvals: [],
      requiredApprovals: ['buyer', 'seller'],
      closingDate: params.closingDate,
      fundingDeadline: this.addDays(new Date(), 3).toISOString(),
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    escrows.push(escrow);
    await this.saveEscrows(escrows);
    
    return escrow;
  }

  /**
   * Create rental security deposit escrow
   */
  async createSecurityDeposit(params: {
    property: Escrow['property'];
    amount: string;
    chain: string;
    landlord: Omit<EscrowParty, 'role'>;
    tenant: Omit<EscrowParty, 'role'>;
    leaseEndDate: string;
  }): Promise<Escrow> {
    const escrows = await this.loadEscrows();

    const escrow: Escrow = {
      id: `SD-${Date.now().toString(36).toUpperCase()}`,
      type: 'security_deposit',
      status: 'created',
      property: params.property,
      parties: [
        { ...params.landlord, role: 'landlord' },
        { ...params.tenant, role: 'tenant' },
      ],
      amount: params.amount,
      chain: params.chain,
      escrowAddress: this.generateEscrowAddress(),
      conditions: [
        {
          id: crypto.randomUUID(),
          description: 'Lease term completed',
          type: 'move_out',
          status: 'pending',
          deadline: params.leaseEndDate,
        },
        {
          id: crypto.randomUUID(),
          description: 'Move-out inspection passed',
          type: 'inspection',
          status: 'pending',
        },
      ],
      releaseRequires: 'majority_approval',
      approvals: [],
      requiredApprovals: ['landlord'],  // Landlord approval releases to tenant
      leaseEndDate: params.leaseEndDate,
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    escrows.push(escrow);
    await this.saveEscrows(escrows);
    
    return escrow;
  }

  /**
   * Create general escrow
   */
  async createGeneral(params: {
    amount: string;
    chain: string;
    depositor: Omit<EscrowParty, 'role'>;
    recipient: Omit<EscrowParty, 'role'>;
    conditions?: Omit<EscrowCondition, 'id' | 'status'>[];
    description?: string;
  }): Promise<Escrow> {
    const escrows = await this.loadEscrows();

    const escrow: Escrow = {
      id: `GE-${Date.now().toString(36).toUpperCase()}`,
      type: 'general',
      status: 'created',
      parties: [
        { ...params.depositor, role: 'depositor' },
        { ...params.recipient, role: 'recipient' },
      ],
      amount: params.amount,
      chain: params.chain,
      escrowAddress: this.generateEscrowAddress(),
      conditions: (params.conditions || []).map(c => ({
        ...c,
        id: crypto.randomUUID(),
        status: 'pending' as const,
      })),
      releaseRequires: 'all_conditions',
      approvals: [],
      requiredApprovals: ['depositor'],
      notes: params.description,
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    escrows.push(escrow);
    await this.saveEscrows(escrows);
    
    return escrow;
  }

  // ============ Escrow Operations ============

  /**
   * Get escrow by ID
   */
  async get(id: string): Promise<Escrow | null> {
    const escrows = await this.loadEscrows();
    return escrows.find(e => e.id === id) || null;
  }

  /**
   * List escrows with filters
   */
  async list(filters?: {
    type?: EscrowType;
    status?: EscrowStatus;
    partyAddress?: string;
    propertyAddress?: string;
  }): Promise<Escrow[]> {
    let escrows = await this.loadEscrows();
    
    if (filters?.type) {
      escrows = escrows.filter(e => e.type === filters.type);
    }
    if (filters?.status) {
      escrows = escrows.filter(e => e.status === filters.status);
    }
    if (filters?.partyAddress) {
      escrows = escrows.filter(e => 
        e.parties.some(p => p.walletAddress?.toLowerCase() === filters.partyAddress!.toLowerCase())
      );
    }
    if (filters?.propertyAddress) {
      escrows = escrows.filter(e => 
        e.property?.address.toLowerCase().includes(filters.propertyAddress!.toLowerCase())
      );
    }
    
    return escrows.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Mark escrow as funded
   */
  async markFunded(id: string, txHash: string): Promise<Escrow | null> {
    const escrows = await this.loadEscrows();
    const escrow = escrows.find(e => e.id === id);
    
    if (escrow && escrow.status === 'created') {
      escrow.status = 'funded';
      escrow.fundingTxHash = txHash;
      escrow.fundedAt = new Date().toISOString();
      escrow.updatedAt = new Date().toISOString();
      await this.saveEscrows(escrows);
    }
    
    return escrow || null;
  }

  /**
   * Satisfy a condition
   */
  async satisfyCondition(
    escrowId: string, 
    conditionId: string, 
    satisfiedBy: string,
    evidence?: string
  ): Promise<Escrow | null> {
    const escrows = await this.loadEscrows();
    const escrow = escrows.find(e => e.id === escrowId);
    
    if (!escrow) return null;
    
    const condition = escrow.conditions.find(c => c.id === conditionId);
    if (condition && condition.status === 'pending') {
      condition.status = 'satisfied';
      condition.satisfiedAt = new Date().toISOString();
      condition.satisfiedBy = satisfiedBy;
      condition.evidence = evidence;
      escrow.updatedAt = new Date().toISOString();
      
      // Check if all conditions satisfied
      const allSatisfied = escrow.conditions.every(c => 
        c.status === 'satisfied' || c.status === 'waived'
      );
      if (allSatisfied && escrow.status === 'funded') {
        escrow.status = 'pending_release';
      }
      
      await this.saveEscrows(escrows);
    }
    
    return escrow;
  }

  /**
   * Waive a condition
   */
  async waiveCondition(escrowId: string, conditionId: string, waivedBy: string): Promise<Escrow | null> {
    const escrows = await this.loadEscrows();
    const escrow = escrows.find(e => e.id === escrowId);
    
    if (!escrow) return null;
    
    const condition = escrow.conditions.find(c => c.id === conditionId);
    if (condition && condition.status === 'pending') {
      condition.status = 'waived';
      condition.satisfiedAt = new Date().toISOString();
      condition.satisfiedBy = waivedBy;
      escrow.updatedAt = new Date().toISOString();
      await this.saveEscrows(escrows);
    }
    
    return escrow;
  }

  /**
   * Fail a condition (triggers refund flow)
   */
  async failCondition(escrowId: string, conditionId: string, reason: string): Promise<Escrow | null> {
    const escrows = await this.loadEscrows();
    const escrow = escrows.find(e => e.id === escrowId);
    
    if (!escrow) return null;
    
    const condition = escrow.conditions.find(c => c.id === conditionId);
    if (condition && condition.status === 'pending') {
      condition.status = 'failed';
      condition.evidence = reason;
      escrow.updatedAt = new Date().toISOString();
      
      // Initiate refund process for earnest money
      if (escrow.type === 'earnest_money') {
        escrow.status = 'pending_release';
        escrow.releaseToRole = 'buyer';  // Failed conditions = refund to buyer
      }
      
      await this.saveEscrows(escrows);
    }
    
    return escrow;
  }

  /**
   * Submit approval for release
   */
  async approve(escrowId: string, partyRole: string, note?: string): Promise<Escrow | null> {
    const escrows = await this.loadEscrows();
    const escrow = escrows.find(e => e.id === escrowId);
    
    if (!escrow) return null;
    
    // Check if party is authorized
    if (!escrow.requiredApprovals.includes(partyRole)) {
      throw new Error(`Party role "${partyRole}" is not required for approval`);
    }
    
    // Check if already approved
    if (escrow.approvals.some(a => a.partyRole === partyRole)) {
      throw new Error('Already approved');
    }
    
    escrow.approvals.push({
      partyRole,
      approved: true,
      timestamp: new Date().toISOString(),
      note,
    });
    escrow.updatedAt = new Date().toISOString();
    
    // Check if all required approvals received
    const allApproved = escrow.requiredApprovals.every(role =>
      escrow.approvals.some(a => a.partyRole === role && a.approved)
    );
    
    if (allApproved && (escrow.status === 'funded' || escrow.status === 'pending_release')) {
      escrow.status = 'pending_release';
    }
    
    await this.saveEscrows(escrows);
    return escrow;
  }

  /**
   * Execute release
   */
  async release(escrowId: string, toAddress: string, txHash: string): Promise<Escrow | null> {
    const escrows = await this.loadEscrows();
    const escrow = escrows.find(e => e.id === escrowId);
    
    if (escrow && escrow.status === 'pending_release') {
      escrow.status = 'released';
      escrow.releaseTo = toAddress;
      escrow.releaseTxHash = txHash;
      escrow.releasedAt = new Date().toISOString();
      escrow.updatedAt = new Date().toISOString();
      await this.saveEscrows(escrows);
    }
    
    return escrow || null;
  }

  /**
   * Execute refund
   */
  async refund(escrowId: string, txHash: string): Promise<Escrow | null> {
    const escrows = await this.loadEscrows();
    const escrow = escrows.find(e => e.id === escrowId);
    
    if (escrow && (escrow.status === 'funded' || escrow.status === 'pending_release')) {
      // Find buyer/depositor address
      const refundParty = escrow.parties.find(p => 
        p.role === 'buyer' || p.role === 'tenant' || p.role === 'depositor'
      );
      
      escrow.status = 'refunded';
      escrow.releaseTo = refundParty?.walletAddress;
      escrow.releaseTxHash = txHash;
      escrow.releasedAt = new Date().toISOString();
      escrow.updatedAt = new Date().toISOString();
      await this.saveEscrows(escrows);
    }
    
    return escrow || null;
  }

  /**
   * Raise dispute
   */
  async raiseDispute(escrowId: string, raisedBy: string, reason: string): Promise<Escrow | null> {
    const escrows = await this.loadEscrows();
    const escrow = escrows.find(e => e.id === escrowId);
    
    if (escrow && escrow.status === 'funded') {
      escrow.status = 'disputed';
      escrow.dispute = {
        raisedBy,
        reason,
        raisedAt: new Date().toISOString(),
      };
      escrow.updatedAt = new Date().toISOString();
      await this.saveEscrows(escrows);
    }
    
    return escrow || null;
  }

  /**
   * Cancel escrow (before funding)
   */
  async cancel(escrowId: string): Promise<Escrow | null> {
    const escrows = await this.loadEscrows();
    const escrow = escrows.find(e => e.id === escrowId);
    
    if (escrow && escrow.status === 'created') {
      escrow.status = 'cancelled';
      escrow.updatedAt = new Date().toISOString();
      await this.saveEscrows(escrows);
    }
    
    return escrow || null;
  }

  /**
   * Add document to escrow
   */
  async addDocument(escrowId: string, name: string, url: string): Promise<Escrow | null> {
    const escrows = await this.loadEscrows();
    const escrow = escrows.find(e => e.id === escrowId);
    
    if (escrow) {
      escrow.documents.push({
        name,
        url,
        uploadedAt: new Date().toISOString(),
      });
      escrow.updatedAt = new Date().toISOString();
      await this.saveEscrows(escrows);
    }
    
    return escrow || null;
  }

  // ============ Formatting ============

  /**
   * Format escrow summary for display
   */
  formatEscrowSummary(escrow: Escrow): string {
    const statusEmoji = {
      created: '📝',
      funded: '💰',
      pending_release: '⏳',
      released: '✅',
      refunded: '↩️',
      disputed: '⚠️',
      cancelled: '❌',
    }[escrow.status];

    const typeLabel = {
      earnest_money: 'Earnest Money',
      security_deposit: 'Security Deposit',
      closing_funds: 'Closing Funds',
      general: 'Escrow',
    }[escrow.type];

    let summary = `${statusEmoji} **${typeLabel} ${escrow.id}**\n\n`;
    
    if (escrow.property) {
      summary += `📍 ${escrow.property.address}, ${escrow.property.city}, ${escrow.property.state}\n`;
    }
    
    summary += `💵 **$${escrow.amount} USDC** (${escrow.chain})\n`;
    summary += `Status: ${escrow.status.replace('_', ' ').toUpperCase()}\n\n`;
    
    // Parties
    summary += `**Parties:**\n`;
    for (const party of escrow.parties) {
      summary += `• ${party.role}: ${party.name}\n`;
    }
    summary += '\n';
    
    // Conditions
    if (escrow.conditions.length > 0) {
      summary += `**Conditions:**\n`;
      for (const cond of escrow.conditions) {
        const condEmoji = {
          pending: '⏳',
          satisfied: '✅',
          waived: '⏭️',
          failed: '❌',
        }[cond.status];
        summary += `${condEmoji} ${cond.description}\n`;
      }
      summary += '\n';
    }
    
    // Approvals
    if (escrow.requiredApprovals.length > 0) {
      summary += `**Approvals:** `;
      const approved = escrow.approvals.filter(a => a.approved).map(a => a.partyRole);
      summary += `${approved.length}/${escrow.requiredApprovals.length} `;
      summary += `(${escrow.requiredApprovals.map(r => approved.includes(r) ? '✓' : '○').join('')})\n`;
    }
    
    return summary;
  }

  // ============ Helpers ============

  private generateEscrowAddress(): string {
    // In production, this would deploy/derive a smart contract address
    // For now, generate a deterministic address
    return '0x' + crypto.randomBytes(20).toString('hex');
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

export default EscrowManager;
