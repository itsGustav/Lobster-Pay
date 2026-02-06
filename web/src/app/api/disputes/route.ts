import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase';
import { DisputeService } from '@/lib/disputes';
import { CreateDisputeRequest, Dispute } from '@/types/dispute';

export const dynamic = 'force-dynamic';

// GET /api/disputes - List disputes for a user
export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get('wallet');
    const escrowId = request.nextUrl.searchParams.get('escrowId');
    const status = request.nextUrl.searchParams.get('status');

    if (!walletAddress && !escrowId) {
      return NextResponse.json(
        { error: 'wallet or escrowId parameter required' },
        { status: 400 }
      );
    }

    const db = initAdmin();
    const disputeService = new DisputeService(db);

    let disputes: Dispute[] = [];
    if (escrowId) {
      disputes = await disputeService.listDisputesByEscrow(escrowId);
    } else if (walletAddress) {
      disputes = await disputeService.listDisputesByUser(walletAddress);
    }

    // Filter by status if provided
    if (status) {
      disputes = disputes.filter((d) => d.status === status);
    }

    return NextResponse.json({ disputes });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch disputes' },
      { status: 500 }
    );
  }
}

// POST /api/disputes - Create a new dispute
export async function POST(request: NextRequest) {
  try {
    const body: CreateDisputeRequest = await request.json();
    const { escrowId, reason, desiredResolution, initialEvidence } = body;

    // Validate request
    if (!escrowId || !reason || !desiredResolution) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Check if dispute already exists for this escrow
    const hasDispute = await disputeService.hasActiveDispute(escrowId);
    if (hasDispute) {
      return NextResponse.json(
        { error: 'Active dispute already exists for this escrow' },
        { status: 409 }
      );
    }

    // TODO: Fetch escrow details from blockchain
    // For MVP, using mock data
    const escrowData = {
      recipientAddress: '0x0000000000000000000000000000000000000000',
      depositorAddress: walletAddress,
      amount: 100,
      description: 'Test escrow',
    };

    const dispute = await disputeService.createDispute({
      escrowId,
      createdBy: walletAddress,
      recipientAddress: escrowData.recipientAddress,
      depositorAddress: escrowData.depositorAddress,
      reason,
      desiredResolution,
      escrowAmount: escrowData.amount,
      escrowDescription: escrowData.description,
      initialEvidence,
    });

    return NextResponse.json({ dispute }, { status: 201 });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return NextResponse.json(
      { error: 'Failed to create dispute' },
      { status: 500 }
    );
  }
}
