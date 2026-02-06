'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { DisputeCard } from '@/components/DisputeCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Dispute, DisputeStatus } from '@/types/dispute';

export default function DisputesPage() {
  const { address, isConnected } = useAccount();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [filteredDisputes, setFilteredDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | 'all'>('all');

  useEffect(() => {
    if (isConnected && address) {
      fetchDisputes();
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredDisputes(disputes);
    } else {
      setFilteredDisputes(disputes.filter((d) => d.status === statusFilter));
    }
  }, [statusFilter, disputes]);

  const fetchDisputes = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/disputes?wallet=${address}`, {
        headers: {
          'x-wallet-address': address,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch disputes');
      }

      const data = await response.json();
      setDisputes(data.disputes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load disputes');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <EmptyState
          icon="🦞"
          title="Connect Your Wallet"
          description="Connect your wallet to view your disputes"
        />
      </div>
    );
  }

  const statusCounts = {
    all: disputes.length,
    open: disputes.filter((d) => d.status === 'open').length,
    evidence: disputes.filter((d) => d.status === 'evidence').length,
    resolved: disputes.filter((d) => d.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            Dispute Resolution
          </h1>
          <p className="text-lg text-gray-400">
            Manage and track your escrow disputes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-3xl font-bold text-orange-600">{statusCounts.all}</div>
            <div className="text-sm text-gray-400 mt-1">Total</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-yellow-500">{statusCounts.open}</div>
            <div className="text-sm text-gray-400 mt-1">Open</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-blue-500">{statusCounts.evidence}</div>
            <div className="text-sm text-gray-400 mt-1">Evidence</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-green-500">{statusCounts.resolved}</div>
            <div className="text-sm text-gray-400 mt-1">Resolved</div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({statusCounts.all})
          </Button>
          <Button
            variant={statusFilter === 'open' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('open')}
          >
            Open ({statusCounts.open})
          </Button>
          <Button
            variant={statusFilter === 'evidence' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('evidence')}
          >
            Evidence ({statusCounts.evidence})
          </Button>
          <Button
            variant={statusFilter === 'resolved' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('resolved')}
          >
            Resolved ({statusCounts.resolved})
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <Card className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">🦞</div>
            <p className="text-gray-400">Loading disputes...</p>
          </Card>
        ) : error ? (
          <Card className="text-center py-12 border-red-500/50">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchDisputes}>Retry</Button>
          </Card>
        ) : filteredDisputes.length === 0 ? (
          <EmptyState
            icon="⚖️"
            title={
              statusFilter === 'all'
                ? 'No Disputes Yet'
                : `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Disputes`
            }
            description={
              statusFilter === 'all'
                ? 'You have no active or resolved disputes'
                : `You have no disputes in ${statusFilter} status`
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredDisputes.map((dispute) => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
