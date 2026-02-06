import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase';
import { DisputeService } from '@/lib/disputes';
import { AddEvidenceRequest } from '@/types/dispute';

export const dynamic = 'force-dynamic';

// POST /api/disputes/[id]/evidence - Add evidence to a dispute
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: AddEvidenceRequest = await request.json();
    const { text, attachments } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Evidence text required' },
        { status: 400 }
      );
    }

    // Get wallet address from header/auth
    // TODO: Implement proper auth
    const walletAddress = request.headers.get('x-wallet-address');
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 401 }
      );
    }

    const db = initAdmin();
    const disputeService = new DisputeService(db);

    // Verify dispute exists and user is a party
    const dispute = await disputeService.getDispute(id);
    if (!dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    const isParty =
      walletAddress.toLowerCase() === dispute.createdBy.toLowerCase() ||
      walletAddress.toLowerCase() === dispute.recipientAddress.toLowerCase() ||
      walletAddress.toLowerCase() === dispute.depositorAddress.toLowerCase();

    if (!isParty) {
      return NextResponse.json(
        { error: 'Only dispute parties can submit evidence' },
        { status: 403 }
      );
    }

    if (dispute.status === 'resolved') {
      return NextResponse.json(
        { error: 'Cannot add evidence to resolved dispute' },
        { status: 400 }
      );
    }

    const evidence = await disputeService.addEvidence(
      id,
      walletAddress,
      text,
      attachments
    );

    return NextResponse.json({ evidence }, { status: 201 });
  } catch (error) {
    console.error('Error adding evidence:', error);
    return NextResponse.json(
      { error: 'Failed to add evidence' },
      { status: 500 }
    );
  }
}
