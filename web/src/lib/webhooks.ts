import { initAdmin } from './firebase';
import crypto from 'crypto';

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}

export interface TriggerResult {
  success: boolean;
  status?: number;
  error?: string;
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Trigger a specific webhook
 */
export async function triggerWebhook(
  webhookId: string,
  payload: Omit<WebhookPayload, 'signature'>
): Promise<TriggerResult> {
  try {
    const db = initAdmin();
    const webhookRef = db.collection('webhooks').doc(webhookId);
    const doc = await webhookRef.get();

    if (!doc.exists) {
      return { success: false, error: 'Webhook not found' };
    }

    const webhook = doc.data();
    
    if (!webhook?.active || webhook.deleted) {
      return { success: false, error: 'Webhook inactive or deleted' };
    }

    // Generate signature
    const payloadString = JSON.stringify(payload);
    const signature = generateSignature(payloadString, webhook.secret);

    const signedPayload: WebhookPayload = {
      ...payload,
      signature,
    };

    // Send webhook request
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': payload.event,
        'User-Agent': 'PayLobster-Webhooks/1.0',
      },
      body: JSON.stringify(signedPayload),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    // Update webhook stats
    const updateData: any = {
      lastTriggered: new Date(),
      triggerCount: (webhook.triggerCount || 0) + 1,
    };

    if (!response.ok) {
      updateData.failureCount = (webhook.failureCount || 0) + 1;
      updateData.lastError = `HTTP ${response.status}`;
      
      // Auto-disable after 10 consecutive failures
      if (updateData.failureCount >= 10) {
        updateData.active = false;
        updateData.disabledReason = 'Too many failures';
      }
    } else {
      // Reset failure count on success
      updateData.failureCount = 0;
      updateData.lastError = null;
    }

    await webhookRef.update(updateData);

    return {
      success: response.ok,
      status: response.status,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    console.error('Error triggering webhook:', error);
    
    // Update failure count
    try {
      const db = initAdmin();
      const webhookRef = db.collection('webhooks').doc(webhookId);
      const doc = await webhookRef.get();
      const webhook = doc.data();
      
      await webhookRef.update({
        failureCount: (webhook?.failureCount || 0) + 1,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      });
    } catch (updateError) {
      console.error('Error updating webhook failure:', updateError);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Trigger webhooks for all users subscribed to an event
 */
export async function triggerWebhooksForEvent(
  event: string,
  data: any,
  userId?: string
): Promise<void> {
  try {
    const db = initAdmin();
    let query = db
      .collection('webhooks')
      .where('active', '==', true)
      .where('deleted', '==', false)
      .where('events', 'array-contains', event);

    // If userId is provided, only trigger for that user
    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.get();

    const payload: Omit<WebhookPayload, 'signature'> = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    // Trigger all webhooks in parallel (fire and forget)
    const promises = snapshot.docs.map((doc) =>
      triggerWebhook(doc.id, payload).catch((error) => {
        console.error(`Failed to trigger webhook ${doc.id}:`, error);
      })
    );

    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Error triggering webhooks for event:', error);
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
