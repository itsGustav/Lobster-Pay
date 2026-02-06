import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase';
import { DisputeService } from '@/lib/disputes';

export const dynamic = 'force-dynamic';

// GET /api/disputes/[id] - Get dispute details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const db = initAdmin();
    const disputeService = new DisputeService(db);

    const dispute = await disputeService.getDispute(id);

    if (!dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ dispute });
  } catch (error) {
    console.error('Error fetching dispute:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dispute' },
      { status: 500 }
    );
  }
}
