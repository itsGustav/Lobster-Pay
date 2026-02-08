import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// POST - Test webhook delivery
// TODO: Implement with Firebase Admin SDK
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'Webhook testing endpoint temporarily disabled during auth migration' },
    { status: 503 }
  );
}
