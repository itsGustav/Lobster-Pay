import { NextRequest, NextResponse } from 'next/server';

// POST - Link wallet to user
// TODO: Implement with Firebase Admin SDK or move to client-side
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Wallet linking now handled client-side via Firestore' },
    { status: 410 }
  );
}

// CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
