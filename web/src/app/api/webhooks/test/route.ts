import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

// POST - Test webhook delivery
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webhookId, url, secret } = body;

    if (!url || !secret) {
      return NextResponse.json(
        { success: false, error: 'URL and secret are required' },
        { status: 400 }
      );
    }

    // Create test payload
    const testPayload = {
      event: 'webhook.test',
      data: {
        message: 'This is a test webhook from PayLobster',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    // Generate signature
    const signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(testPayload))
      .digest('hex');

    // Send test webhook
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'User-Agent': 'PayLobster-Webhook/1.0',
      },
      body: JSON.stringify(testPayload),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Webhook endpoint returned ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook test successful',
      statusCode: response.status,
    });
  } catch (error) {
    console.error('Error testing webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test webhook',
      },
      { status: 200 }
    );
  }
}
