export type DisputeStatus = 'open' | 'evidence' | 'resolved';

export type DisputeResolutionType = 'arbitration' | 'mutual' | 'timeout';

export interface Evidence {
  id: string;
  submittedBy: string; // wallet address
  submittedAt: number; // timestamp
  text: string;
  attachments?: string[]; // URLs or IPFS hashes
}

export interface DisputeResolution {
  type: DisputeResolutionType;
  resolvedBy: string; // wallet address or 'system'
  resolvedAt: number;
  outcome: 'favor-creator' | 'favor-recipient' | 'split';
  notes: string;
  refundAmount?: number;
}

export interface Dispute {
  id: string;
  escrowId: string;
  
  // Parties
  createdBy: string; // wallet address (party who raised dispute)
  recipientAddress: string;
  depositorAddress: string;
  
  // Dispute details
  reason: string;
  desiredResolution: string;
  status: DisputeStatus;
  
  // Evidence
  evidence: Evidence[];
  
  // Resolution
  resolution?: DisputeResolution;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  
  // Escrow details (denormalized for display)
  escrowAmount: number;
  escrowDescription: string;
}

export interface CreateDisputeRequest {
  escrowId: string;
  reason: string;
  desiredResolution: string;
  initialEvidence?: string;
}

export interface AddEvidenceRequest {
  text: string;
  attachments?: string[];
}

export interface ResolveDisputeRequest {
  type: DisputeResolutionType;
  outcome: 'favor-creator' | 'favor-recipient' | 'split';
  notes: string;
  refundAmount?: number;
}
