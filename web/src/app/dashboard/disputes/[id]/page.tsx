'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dispute, Evidence } from '@/types/dispute';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'open':
      return 'warning';
    case 'evidence':
      return 'default';
    case 'resolved':
      return 'success';
    default:
      return 'default';
  }
}

export default function DisputeDetailPage() {
  const params = useParams();
  const disputeId = params.id as string;
  const { address, isConnected } = useAccount();
  
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evidenceText, setEvidenceText] = useState('');
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      fetchDispute();
    }
  }, [isConnected, address, disputeId]);

  const fetchDispute = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/disputes/${disputeId}`, {
        headers: {
          'x-wallet-address': address,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dispute');
      }

      const data = await response.json();
      setDispute(data.dispute);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dispute');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !evidenceText.trim()) return;

    try {
      setIsSubmittingEvidence(true);

      const response = await fetch(`/api/disputes/${disputeId}/evidence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': address,
        },
        body: JSON.stringify({ text: evidenceText }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit evidence');
      }

      setEvidenceText('');
      await fetchDispute(); // Refresh dispute data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit evidence');
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center space-y-4">
          <div className="text-5xl">🦞</div>
          <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
          <p className="text-gray-400">Connect your wallet to view this dispute</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">🦞</div>
          <p className="text-gray-400">Loading dispute...</p>
        </Card>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center space-y-4 border-red-500/50">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-gray-400">{error || 'Dispute not found'}</p>
          <Link href="/dashboard/disputes">
            <Button>← Back to Disputes</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isParty =
    address &&
    (address.toLowerCase() === dispute.createdBy.toLowerCase() ||
      address.toLowerCase() === dispute.recipientAddress.toLowerCase() ||
      address.toLowerCase() === dispute.depositorAddress.toLowerCase());

  return (
    <div className="min-h-screen py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard/disputes"
          className="inline-flex items-center text-gray-400 hover:text-gray-200 mb-6"
        >
          ← Back to Disputes
        </Link>

        {/* Header */}
        <Card className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Dispute #{dispute.id.slice(0, 8)}
                </h1>
                <Badge variant={getStatusBadgeVariant(dispute.status)}>
                  {dispute.status}
                </Badge>
              </div>
              <p className="text-gray-400">
                Created {formatDate(dispute.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600">
                {dispute.escrowAmount} USDC
              </div>
              <p className="text-sm text-gray-400">Escrow Amount</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Escrow</div>
              <div className="font-mono text-sm">
                {dispute.escrowDescription || formatAddress(dispute.escrowId)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-1">Dispute Reason</div>
              <p className="text-gray-200">{dispute.reason}</p>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-1">Desired Resolution</div>
              <p className="text-gray-200">{dispute.desiredResolution}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
              <div>
                <div className="text-sm text-gray-400 mb-1">Raised By</div>
                <div className="font-mono text-xs">{formatAddress(dispute.createdBy)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Recipient</div>
                <div className="font-mono text-xs">
                  {formatAddress(dispute.recipientAddress)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Depositor</div>
                <div className="font-mono text-xs">
                  {formatAddress(dispute.depositorAddress)}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Resolution (if resolved) */}
        {dispute.resolution && (
          <Card className="mb-8 border-green-500/30">
            <h2 className="text-xl font-bold mb-4 text-green-500">✓ Resolution</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-400 mb-1">Outcome</div>
                <div className="text-lg font-bold">
                  {dispute.resolution.outcome === 'favor-creator'
                    ? 'In favor of dispute creator'
                    : dispute.resolution.outcome === 'favor-recipient'
                    ? 'In favor of recipient'
                    : 'Split resolution'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Resolution Type</div>
                <div className="capitalize">{dispute.resolution.type}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Notes</div>
                <p className="text-gray-200">{dispute.resolution.notes}</p>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Resolved</div>
                <div>{formatDate(dispute.resolution.resolvedAt)}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Evidence Timeline */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold mb-6">Evidence Timeline</h2>
          
          {dispute.evidence.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No evidence submitted yet
            </div>
          ) : (
            <div className="space-y-6">
              {dispute.evidence
                .sort((a, b) => b.submittedAt - a.submittedAt)
                .map((evidence: Evidence) => (
                  <div
                    key={evidence.id}
                    className="border-l-2 border-orange-600 pl-4 py-2"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="font-mono text-xs text-gray-400">
                        {formatAddress(evidence.submittedBy)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(evidence.submittedAt)}
                      </div>
                    </div>
                    <p className="text-gray-200">{evidence.text}</p>
                  </div>
                ))}
            </div>
          )}
        </Card>

        {/* Add Evidence Form */}
        {isParty && dispute.status !== 'resolved' && (
          <Card id="evidence">
            <h2 className="text-xl font-bold mb-4">Submit Evidence</h2>
            <form onSubmit={handleSubmitEvidence} className="space-y-4">
              <textarea
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-gray-50 placeholder-gray-500 transition-colors min-h-touch focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent hover:border-gray-700"
                rows={4}
                placeholder="Provide additional evidence or context..."
                value={evidenceText}
                onChange={(e) => setEvidenceText(e.target.value)}
                required
              />
              <Button
                type="submit"
                disabled={!evidenceText.trim() || isSubmittingEvidence}
                className="w-full"
              >
                {isSubmittingEvidence ? 'Submitting...' : 'Submit Evidence'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
