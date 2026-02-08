'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  description: string;
  secret: string;
  active: boolean;
  createdAt: string;
  lastTriggered: string | null;
  triggerCount: number;
  failureCount: number;
}

const AVAILABLE_EVENTS = [
  { id: 'escrow_created', label: 'Escrow Created', icon: '🔐' },
  { id: 'escrow_released', label: 'Escrow Released', icon: '✅' },
  { id: 'escrow_disputed', label: 'Escrow Disputed', icon: '⚠️' },
  { id: 'score_changed', label: 'Score Changed', icon: '📊' },
];

export default function WebhooksPage() {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formUrl, setFormUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Test state
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadWebhooks();
    }
  }, [user]);

  const loadWebhooks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { db } = await import('@/lib/firebase-client');
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      const q = query(
        collection(db, 'webhooks'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const webhooksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastTriggered: doc.data().lastTriggered?.toDate?.()?.toISOString() || null,
      })) as Webhook[];
      
      setWebhooks(webhooksData);
    } catch (err) {
      console.error('Error loading webhooks:', err);
      setError(err instanceof Error ? err : new Error('Failed to load webhooks'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formUrl || formEvents.length === 0) {
      setFormError('URL and at least one event are required');
      return;
    }

    if (!user) {
      setFormError('You must be signed in');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError(null);
      
      const { db } = await import('@/lib/firebase-client');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
      // Generate webhook secret (browser-compatible)
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const secret = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      
      await addDoc(collection(db, 'webhooks'), {
        userId: user.uid,
        url: formUrl,
        events: formEvents,
        description: formDescription,
        secret,
        active: true,
        createdAt: serverTimestamp(),
        lastTriggered: null,
        triggerCount: 0,
        failureCount: 0,
      });
      
      // Reset form
      setFormUrl('');
      setFormDescription('');
      setFormEvents([]);
      setShowForm(false);
      
      // Reload webhooks
      await loadWebhooks();
    } catch (err) {
      console.error('Error creating webhook:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to create webhook');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }

    try {
      const { db } = await import('@/lib/firebase-client');
      const { doc, deleteDoc } = await import('firebase/firestore');
      
      await deleteDoc(doc(db, 'webhooks', webhookId));
      await loadWebhooks();
    } catch (err) {
      console.error('Error deleting webhook:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete webhook');
    }
  };

  const handleTest = async (webhookId: string) => {
    try {
      setTesting(webhookId);
      
      const webhook = webhooks.find(w => w.id === webhookId);
      if (!webhook) {
        alert('Webhook not found');
        return;
      }
      
      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookId,
          url: webhook.url,
          secret: webhook.secret,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Webhook test successful!');
      } else {
        alert(`❌ Webhook test failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error testing webhook:', err);
      alert(err instanceof Error ? err.message : 'Failed to test webhook');
    } finally {
      setTesting(null);
    }
  };

  const toggleEvent = (eventId: string) => {
    setFormEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    alert('Secret copied to clipboard!');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center space-y-4 p-8">
          <div className="text-5xl">🔒</div>
          <h1 className="text-2xl font-bold">Sign In Required</h1>
          <p className="text-gray-400">
            Please sign in to manage webhooks
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-1/3" />
            <div className="h-64 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Webhooks</h1>
            <p className="text-gray-400">
              Receive real-time notifications for escrow events and score changes
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-600 hover:bg-orange-500"
          >
            {showForm ? 'Cancel' : '+ Add Webhook'}
          </Button>
        </div>

        {/* Add Webhook Form */}
        {showForm && (
          <Card className="animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-bold">Add New Webhook</h2>
              
              {formError && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Webhook URL *</label>
                <Input
                  type="url"
                  placeholder="https://your-server.com/webhooks/paylobster"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Your endpoint will receive POST requests with event data
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Input
                  type="text"
                  placeholder="e.g., Production webhook for escrow notifications"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Events to Subscribe *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AVAILABLE_EVENTS.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => toggleEvent(event.id)}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                        formEvents.includes(event.id)
                          ? 'border-orange-600 bg-orange-600/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <span className="text-2xl">{event.icon}</span>
                      <div className="text-left">
                        <div className="font-medium">{event.label}</div>
                        <div className="text-xs text-gray-500">{event.id}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={formSubmitting || !formUrl || formEvents.length === 0}
                  className="bg-orange-600 hover:bg-orange-500"
                >
                  {formSubmitting ? 'Creating...' : 'Create Webhook'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Webhooks List */}
        {error ? (
          <ErrorState error={error} onRetry={loadWebhooks} />
        ) : webhooks.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No webhooks yet"
            description="Create your first webhook to receive real-time notifications"
            action={{
              label: "Add Webhook",
              onClick: () => setShowForm(true),
            }}
          />
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="space-y-4">
                {/* Webhook Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-mono text-sm truncate">
                        {webhook.url}
                      </h3>
                      <Badge variant={webhook.active ? 'success' : 'default'}>
                        {webhook.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {webhook.description && (
                      <p className="text-sm text-gray-400">{webhook.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTest(webhook.id)}
                      disabled={testing === webhook.id}
                    >
                      {testing === webhook.id ? '...' : 'Test'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(webhook.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Events */}
                <div className="flex flex-wrap gap-2">
                  {webhook.events.map((eventId) => {
                    const event = AVAILABLE_EVENTS.find(e => e.id === eventId);
                    return (
                      <Badge key={eventId} variant="default">
                        {event?.icon} {event?.label || eventId}
                      </Badge>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="text-gray-400">Triggers:</span>{' '}
                    <span className="font-medium">{webhook.triggerCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Failures:</span>{' '}
                    <span className={webhook.failureCount > 0 ? 'text-red-500' : ''}>
                      {webhook.failureCount}
                    </span>
                  </div>
                  {webhook.lastTriggered && (
                    <div>
                      <span className="text-gray-400">Last triggered:</span>{' '}
                      <span>{new Date(webhook.lastTriggered).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Secret */}
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-400 mb-1">Signing Secret</div>
                      <code className="text-xs font-mono text-gray-300 break-all">
                        {webhook.secret}
                      </code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copySecret(webhook.secret)}
                      className="shrink-0"
                    >
                      📋 Copy
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use this secret to verify webhook signatures (X-Webhook-Signature header)
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Documentation */}
        <Card className="bg-gray-800/30">
          <h3 className="text-lg font-bold mb-4">📚 Webhook Documentation</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Payload Format</h4>
              <pre className="bg-gray-900 p-3 rounded-lg overflow-x-auto">
{`{
  "event": "escrow_created",
  "data": { /* event-specific data */ },
  "timestamp": "2024-02-06T05:12:00.000Z",
  "signature": "hmac-sha256-signature"
}`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">Verifying Signatures</h4>
              <p className="text-gray-400 mb-2">
                Verify the X-Webhook-Signature header using HMAC-SHA256 with your webhook secret:
              </p>
              <pre className="bg-gray-900 p-3 rounded-lg overflow-x-auto">
{`const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">Retry Policy</h4>
              <p className="text-gray-400">
                Webhooks are automatically disabled after 10 consecutive failures. 
                Ensure your endpoint returns a 2xx status code.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
