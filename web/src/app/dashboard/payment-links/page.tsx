'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button, Input, Badge, EmptyState, ErrorState } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import Link from 'next/link';
import { db } from '@/lib/firebase-client';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

interface PaymentLink {
  id: string;
  linkId: string;
  amount: number;
  description: string;
  recipientWallet: string;
  createdAt: any;
  expiresAt?: any;
  status: 'active' | 'paid' | 'expired';
  paidBy?: string;
  txHash?: string;
}

export default function PaymentLinksPage() {
  const { user } = useAuth();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formRecipient, setFormRecipient] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPaymentLinks();
    }
  }, [user]);

  const loadPaymentLinks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const q = query(
        collection(db, 'paymentLinks'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const linksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentLink[];
      
      // Sort by creation date, newest first
      linksData.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      
      setLinks(linksData);
    } catch (err) {
      console.error('Error loading payment links:', err);
      setError(err instanceof Error ? err : new Error('Failed to load payment links'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formAmount || !formDescription || !formRecipient) {
      setFormError('All fields are required');
      return;
    }

    if (!user) {
      setFormError('You must be signed in');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError(null);
      
      // Generate unique link ID
      const linkId = Math.random().toString(36).substring(2, 15);
      
      // Create payment link in Firestore
      await addDoc(collection(db, 'paymentLinks'), {
        linkId,
        userId: user.uid,
        amount: parseFloat(formAmount),
        description: formDescription,
        recipientWallet: formRecipient,
        status: 'active',
        createdAt: serverTimestamp(),
        expiresAt: null, // Could add expiration logic
      });
      
      // Reset form
      setFormAmount('');
      setFormDescription('');
      setFormRecipient('');
      setShowForm(false);
      
      haptics.success();
      
      // Reload links
      await loadPaymentLinks();
    } catch (err) {
      console.error('Error creating payment link:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to create payment link');
      haptics.error();
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this payment link?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'paymentLinks', linkId));
      haptics.success();
      await loadPaymentLinks();
    } catch (err) {
      console.error('Error deleting payment link:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete payment link');
      haptics.error();
    }
  };

  const copyLink = (linkId: string) => {
    const url = `${window.location.origin}/pay/${linkId}`;
    navigator.clipboard.writeText(url);
    haptics.success();
    // You could show a toast notification here
    alert('Link copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'paid':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'expired':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center space-y-4 p-8">
          <div className="text-5xl">🔒</div>
          <h1 className="text-2xl font-bold">Sign In Required</h1>
          <p className="text-gray-400">
            Please sign in to manage payment links
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
    <div className="min-h-screen py-16 px-4 md:px-8 bg-[#030B1A]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Payment Links</h1>
            <p className="text-gray-400">
              Create shareable payment links that accept USDC
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              haptics.light();
            }}
            className="bg-[#2563EB] hover:bg-[#3B82F6]"
          >
            {showForm ? 'Cancel' : '+ Create Link'}
          </Button>
        </div>

        {/* Create Link Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 bg-[#0A1628] border-gray-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-xl font-bold">Create New Payment Link</h2>
                  
                  {formError && (
                    <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500 text-sm">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Amount (USDC) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      required
                      className="text-2xl font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Description *</label>
                    <Input
                      type="text"
                      placeholder="e.g., Invoice #1234, Product purchase"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Recipient Wallet *</label>
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={formRecipient}
                      onChange={(e) => setFormRecipient(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      The wallet address that will receive the payment
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={formSubmitting || !formAmount || !formDescription || !formRecipient}
                      className="bg-[#2563EB] hover:bg-[#3B82F6]"
                    >
                      {formSubmitting ? 'Creating...' : 'Create Payment Link'}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Links List */}
        {error ? (
          <ErrorState error={error} onRetry={loadPaymentLinks} />
        ) : links.length === 0 ? (
          <EmptyState
            icon="💳"
            title="No payment links yet"
            description="Create your first payment link to accept USDC payments"
            action={{
              label: "Create Link",
              onClick: () => setShowForm(true),
            }}
          />
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 bg-[#0A1628] border-gray-800 hover:border-[#2563EB]/30 transition-colors">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-50 truncate">
                          {link.description}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(link.status)}`}>
                          {link.status}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-[#2563EB] mb-2">
                        ${link.amount.toFixed(2)} USDC
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {link.status === 'active' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyLink(link.linkId)}
                          >
                            📋 Copy Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(link.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Link URL */}
                  <div className="bg-[#030B1A] rounded-lg p-3 mb-4">
                    <div className="text-xs text-gray-400 mb-1">Payment URL</div>
                    <code className="text-xs font-mono text-[#06B6D4] break-all">
                      {window.location.origin}/pay/{link.linkId}
                    </code>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Recipient:</span>{' '}
                      <span className="font-mono text-gray-300">
                        {link.recipientWallet.slice(0, 6)}...{link.recipientWallet.slice(-4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Created:</span>{' '}
                      <span className="text-gray-300">
                        {link.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </span>
                    </div>
                    {link.paidBy && (
                      <>
                        <div>
                          <span className="text-gray-400">Paid by:</span>{' '}
                          <span className="font-mono text-gray-300">
                            {link.paidBy.slice(0, 6)}...{link.paidBy.slice(-4)}
                          </span>
                        </div>
                        {link.txHash && (
                          <div>
                            <a
                              href={`https://basescan.org/tx/${link.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2563EB] hover:text-[#3B82F6]"
                            >
                              View transaction →
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="p-6 bg-[#0A1628]/50 border-gray-800">
          <h3 className="text-lg font-bold mb-4">💡 How Payment Links Work</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <p>
              1. <span className="text-gray-300">Create a link</span> with the amount and your wallet address
            </p>
            <p>
              2. <span className="text-gray-300">Share the link</span> via email, social media, or embed it on your website
            </p>
            <p>
              3. <span className="text-gray-300">Customers pay</span> by connecting their wallet and sending USDC on Base
            </p>
            <p>
              4. <span className="text-gray-300">Receive instantly</span> - payments go directly to your wallet
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
