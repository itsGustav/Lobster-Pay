import { Firestore } from 'firebase-admin/firestore';
import { Dispute, Evidence, DisputeResolution, DisputeStatus } from '@/types/dispute';

const DISPUTES_COLLECTION = 'disputes';

export class DisputeService {
  constructor(private db: Firestore) {}

  async createDispute(data: {
    escrowId: string;
    createdBy: string;
    recipientAddress: string;
    depositorAddress: string;
    reason: string;
    desiredResolution: string;
    escrowAmount: number;
    escrowDescription: string;
    initialEvidence?: string;
  }): Promise<Dispute> {
    const now = Date.now();
    const disputeRef = this.db.collection(DISPUTES_COLLECTION).doc();
    
    const evidence: Evidence[] = [];
    if (data.initialEvidence) {
      evidence.push({
        id: `${disputeRef.id}_0`,
        submittedBy: data.createdBy,
        submittedAt: now,
        text: data.initialEvidence,
      });
    }

    const dispute: Dispute = {
      id: disputeRef.id,
      escrowId: data.escrowId,
      createdBy: data.createdBy,
      recipientAddress: data.recipientAddress,
      depositorAddress: data.depositorAddress,
      reason: data.reason,
      desiredResolution: data.desiredResolution,
      status: 'open',
      evidence,
      createdAt: now,
      updatedAt: now,
      escrowAmount: data.escrowAmount,
      escrowDescription: data.escrowDescription,
    };

    await disputeRef.set(dispute);
    return dispute;
  }

  async getDispute(id: string): Promise<Dispute | null> {
    const doc = await this.db.collection(DISPUTES_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Dispute;
  }

  async listDisputesByUser(walletAddress: string): Promise<Dispute[]> {
    const queries = await Promise.all([
      this.db
        .collection(DISPUTES_COLLECTION)
        .where('createdBy', '==', walletAddress)
        .get(),
      this.db
        .collection(DISPUTES_COLLECTION)
        .where('recipientAddress', '==', walletAddress)
        .get(),
      this.db
        .collection(DISPUTES_COLLECTION)
        .where('depositorAddress', '==', walletAddress)
        .get(),
    ]);

    const disputeMap = new Map<string, Dispute>();
    
    queries.forEach((snapshot) => {
      snapshot.docs.forEach((doc) => {
        const dispute = doc.data() as Dispute;
        disputeMap.set(dispute.id, dispute);
      });
    });

    return Array.from(disputeMap.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async listDisputesByEscrow(escrowId: string): Promise<Dispute[]> {
    const snapshot = await this.db
      .collection(DISPUTES_COLLECTION)
      .where('escrowId', '==', escrowId)
      .get();

    return snapshot.docs.map((doc) => doc.data() as Dispute);
  }

  async addEvidence(
    disputeId: string,
    submittedBy: string,
    text: string,
    attachments?: string[]
  ): Promise<Evidence> {
    const disputeRef = this.db.collection(DISPUTES_COLLECTION).doc(disputeId);
    const doc = await disputeRef.get();
    
    if (!doc.exists) {
      throw new Error('Dispute not found');
    }

    const dispute = doc.data() as Dispute;
    const evidence: Evidence = {
      id: `${disputeId}_${dispute.evidence.length}`,
      submittedBy,
      submittedAt: Date.now(),
      text,
      attachments,
    };

    await disputeRef.update({
      evidence: [...dispute.evidence, evidence],
      updatedAt: Date.now(),
      status: 'evidence',
    });

    return evidence;
  }

  async resolveDispute(
    disputeId: string,
    resolution: DisputeResolution
  ): Promise<void> {
    const disputeRef = this.db.collection(DISPUTES_COLLECTION).doc(disputeId);
    
    await disputeRef.update({
      resolution,
      status: 'resolved',
      updatedAt: Date.now(),
    });
  }

  async updateDisputeStatus(
    disputeId: string,
    status: DisputeStatus
  ): Promise<void> {
    await this.db.collection(DISPUTES_COLLECTION).doc(disputeId).update({
      status,
      updatedAt: Date.now(),
    });
  }

  async hasActiveDispute(escrowId: string): Promise<boolean> {
    const snapshot = await this.db
      .collection(DISPUTES_COLLECTION)
      .where('escrowId', '==', escrowId)
      .where('status', 'in', ['open', 'evidence'])
      .limit(1)
      .get();

    return !snapshot.empty;
  }
}
