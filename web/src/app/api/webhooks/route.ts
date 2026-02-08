import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET - List user's webhooks
// TODO: Implement with Firebase Admin SDK
export async function GET(req: NextRequest) {
  return NextResponse.json(
    { error: 'Webhooks endpoint temporarily disabled during auth migration' },
    { status: 503 }
  );
}

// POST - Register new webhook
// TODO: Implement with Firebase Admin SDK
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'Webhooks endpoint temporarily disabled during auth migration' },
    { status: 503 }
  );
}

// DELETE - Remove webhook
// TODO: Implement with Firebase Admin SDK
export async function DELETE(req: NextRequest) {
  return NextResponse.json(
    { error: 'Webhooks endpoint temporarily disabled during auth migration' },
    { status: 503 }
  );
}
