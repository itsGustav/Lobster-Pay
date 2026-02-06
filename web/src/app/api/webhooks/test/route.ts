import { NextRequest, NextResponse } from 'next/server';
import { authServer } from '@/lib/auth-server';
import { triggerWebhook } from '@/lib/webhooks';

export const runtime = 'nodejs';

// POST - Test a webhook
export async function POST(req: NextRequest) {
  try {
    const session = await authServer.auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { webhookId } = body;

    if (!webhookId) {
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        { status: 400 }
      );
    }

    // Test webhook with a sample payload
    const testPayload = {
      event: 'test',
      data: {
        message: 'This is a test webhook from Pay Lobster',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    const result = await triggerWebhook(webhookId, testPayload);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Webhook test successful',
        status: result.status,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Webhook test failed',
        error: result.error,
        status: result.status,
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error testing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to test webhook' },
      { status: 500 }
    );
  }
}
