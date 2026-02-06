import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase';
import { DisputeService } from '@/lib/disputes';
import { ResolveDisputeRequest, DisputeResolution } from '@/types/dispute';

export const dynamic = 'force-dynamic';

// POST /api/disputes/[id]/resolve - Resolve a dispute (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: ResolveDisputeRequest = await request.json();
    const { type, outcome, notes, refundAmount } = body;

    if (!type || !outcome || !notes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get wallet address from header/auth
    // TODO: Implement proper admin auth
    const walletAddress = request.headers.get('x-wallet-address');
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 401 }
      );
    }

    // TODO: Check if user is admin
    // For MVP, allowing anyone to resolve (should be restricted)

    const db = initAdmin();
    const disputeService = new DisputeService(db);

    const dispute = await disputeService.getDispute(id);
    if (!dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    if (dispute.status === 'resolved') {
      return NextResponse.json(
        { error: 'Dispute already resolved' },
        { status: 400 }
      );
    }

    const resolution: DisputeResolution = {
      type,
      resolvedBy: walletAddress,
      resolvedAt: Date.now(),
      outcome,
      notes,
      refundAmount,
    };

    await disputeService.resolveDispute(id, resolution);

    return NextResponse.json({ 
      message: 'Dispute resolved',
      resolution 
    });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    return NextResponse.json(
      { error: 'Failed to resolve dispute' },
      { status: 500 }
    );
  }
}
