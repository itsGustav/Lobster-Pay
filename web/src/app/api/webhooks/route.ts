import { NextRequest, NextResponse } from 'next/server';
import { authServer } from '@/lib/auth-server';
import { initAdmin } from '@/lib/firebase';
import crypto from 'crypto';

export const runtime = 'nodejs';

// GET - List user's webhooks
export async function GET(req: NextRequest) {
  try {
    const session = await authServer.auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = initAdmin();
    const webhooksRef = db.collection('webhooks');
    const snapshot = await webhooksRef
      .where('userId', '==', session.user.id)
      .where('deleted', '==', false)
      .orderBy('createdAt', 'desc')
      .get();

    const webhooks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      lastTriggered: doc.data().lastTriggered?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

// POST - Register new webhook
export async function POST(req: NextRequest) {
  try {
    const session = await authServer.auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { url, events, description } = body;

    // Validate input
    if (!url || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'URL and at least one event are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate events
    const validEvents = [
      'escrow_created',
      'escrow_released',
      'escrow_disputed',
      'score_changed',
    ];
    
    const invalidEvents = events.filter((e: string) => !validEvents.includes(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate webhook secret for signature verification
    const secret = crypto.randomBytes(32).toString('hex');

    // Create webhook document
    const db = initAdmin();
    const webhookRef = await db.collection('webhooks').add({
      userId: session.user.id,
      url,
      events,
      description: description || '',
      secret,
      active: true,
      deleted: false,
      createdAt: new Date(),
      lastTriggered: null,
      triggerCount: 0,
      failureCount: 0,
    });

    const webhook = {
      id: webhookRef.id,
      url,
      events,
      description,
      secret,
      active: true,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ webhook }, { status: 201 });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}

// DELETE - Remove webhook
export async function DELETE(req: NextRequest) {
  try {
    const session = await authServer.auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const webhookId = searchParams.get('id');

    if (!webhookId) {
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        { status: 400 }
      );
    }

    const db = initAdmin();
    const webhookRef = db.collection('webhooks').doc(webhookId);
    const doc = await webhookRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    const webhookData = doc.data();
    if (webhookData?.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Soft delete
    await webhookRef.update({
      deleted: true,
      deletedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}
