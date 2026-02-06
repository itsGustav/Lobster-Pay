'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScoreChart } from '@/components/charts/ScoreChart';
import { VolumeChart } from '@/components/charts/VolumeChart';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  scoreHistory: Array<{
    date: string;
    score: number;
    change: number;
    reason?: string;
  }>;
  transactionVolume: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
  escrowStats: {
    total: number;
    released: number;
    disputed: number;
    successRate: number;
  };
  peerComparison: {
    userScore: number;
    userRank: number;
    totalUsers: number;
    percentile: number;
    averageScore: number;
  };
  keyMetrics: {
    currentScore: number;
    scoreChange30d: number;
    totalTransactions: number;
    totalVolume: number;
    escrowsCompleted: number;
    trustRating: number;
  };
}

type TimeRange = 7 | 30 | 90 | 365;

export default function AnalyticsPage() {
  const { address, isConnected } = useAccount();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [volumeMetric, setVolumeMetric] = useState<'count' | 'amount'>('count');

  useEffect(() => {
    if (address) {
      loadAnalytics();
    }
  }, [address, timeRange]);

  const loadAnalytics = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/analytics?address=${address}&timeRange=${timeRange}`
      );

      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err : new Error('Failed to load analytics'));
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center space-y-4 p-8">
          <div className="text-5xl">📊</div>
          <h1 className="text-2xl font-bold">Connect Wallet</h1>
          <p className="text-gray-400">
            Connect your wallet to view analytics
          </p>
        </Card>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center space-y-4 p-8">
          <div className="text-5xl">🔗</div>
          <h1 className="text-2xl font-bold">Wallet Required</h1>
          <p className="text-gray-400">
            Please connect your wallet to view analytics
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded" />
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-800 rounded" />
              <div className="h-96 bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <ErrorState error={error} onRetry={loadAnalytics} />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <EmptyState
            icon="📊"
            title="No analytics data"
            description="Start using Pay Lobster to see your analytics"
          />
        </div>
      </div>
    );
  }

  const { keyMetrics, scoreHistory, transactionVolume, escrowStats, peerComparison } = analytics;

  return (
    <div className="min-h-screen py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-gray-400">
              Track your performance and growth on Pay Lobster
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            {[7, 30, 90, 365].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days as TimeRange)}
                className={cn(
                  'px-3 py-1 text-sm rounded-md transition-colors',
                  timeRange === days
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {days === 7 ? '7d' : days === 30 ? '30d' : days === 90 ? '90d' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Current Score */}
          <Card className="text-center space-y-2">
            <div className="text-sm text-gray-400">Score</div>
            <div className="text-3xl font-bold text-green-500">
              {keyMetrics.currentScore}
            </div>
            {keyMetrics.scoreChange30d !== 0 && (
              <Badge
                variant={keyMetrics.scoreChange30d > 0 ? 'success' : 'default'}
                className="text-xs"
              >
                {keyMetrics.scoreChange30d > 0 ? '↑' : '↓'}{' '}
                {Math.abs(keyMetrics.scoreChange30d)}
              </Badge>
            )}
          </Card>

          {/* Total Transactions */}
          <Card className="text-center space-y-2">
            <div className="text-sm text-gray-400">Transactions</div>
            <div className="text-3xl font-bold">
              {keyMetrics.totalTransactions}
            </div>
            <div className="text-xs text-gray-500">all time</div>
          </Card>

          {/* Total Volume */}
          <Card className="text-center space-y-2">
            <div className="text-sm text-gray-400">Volume</div>
            <div className="text-3xl font-bold text-orange-500">
              ${keyMetrics.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-gray-500">total</div>
          </Card>

          {/* Escrows Completed */}
          <Card className="text-center space-y-2">
            <div className="text-sm text-gray-400">Escrows</div>
            <div className="text-3xl font-bold">
              {keyMetrics.escrowsCompleted}
            </div>
            <div className="text-xs text-gray-500">completed</div>
          </Card>

          {/* Success Rate */}
          <Card className="text-center space-y-2">
            <div className="text-sm text-gray-400">Success Rate</div>
            <div className="text-3xl font-bold text-blue-500">
              {keyMetrics.trustRating.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">escrows</div>
          </Card>

          {/* Rank */}
          <Card className="text-center space-y-2">
            <div className="text-sm text-gray-400">Rank</div>
            <div className="text-3xl font-bold text-purple-500">
              #{peerComparison.userRank}
            </div>
            <div className="text-xs text-gray-500">
              of {peerComparison.totalUsers}
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Score History Chart */}
          <Card>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Score History</h3>
              <ScoreChart data={scoreHistory} />
            </div>
          </Card>

          {/* Transaction Volume Chart */}
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Transaction Volume</h3>
                <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setVolumeMetric('count')}
                    className={cn(
                      'px-3 py-1 text-xs rounded-md transition-colors',
                      volumeMetric === 'count'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    Count
                  </button>
                  <button
                    onClick={() => setVolumeMetric('amount')}
                    className={cn(
                      'px-3 py-1 text-xs rounded-md transition-colors',
                      volumeMetric === 'amount'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    Amount
                  </button>
                </div>
              </div>
              <VolumeChart data={transactionVolume} metric={volumeMetric} />
            </div>
          </Card>
        </div>

        {/* Additional Stats Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Escrow Statistics */}
          <Card>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Escrow Performance</h3>
              
              <div className="space-y-3">
                {/* Total Escrows */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🔐</div>
                    <div>
                      <div className="font-medium">Total Escrows</div>
                      <div className="text-sm text-gray-400">Created</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{escrowStats.total}</div>
                </div>

                {/* Released */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <div className="font-medium">Released</div>
                      <div className="text-sm text-gray-400">Successful</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    {escrowStats.released}
                  </div>
                </div>

                {/* Disputed */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div>
                      <div className="font-medium">Disputed</div>
                      <div className="text-sm text-gray-400">Conflicts</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-500">
                    {escrowStats.disputed}
                  </div>
                </div>

                {/* Success Rate Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Success Rate</span>
                    <span className="font-medium">
                      {escrowStats.successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${escrowStats.successRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Peer Comparison */}
          <Card>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Peer Comparison</h3>
              
              <div className="space-y-4">
                {/* Percentile */}
                <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">You're in the top</div>
                  <div className="text-5xl font-bold mb-2">
                    {(100 - peerComparison.percentile).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-400">
                    Ranked #{peerComparison.userRank} of {peerComparison.totalUsers} users
                  </div>
                </div>

                {/* Score Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Your Score</div>
                    <div className="text-3xl font-bold text-green-500">
                      {peerComparison.userScore}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Network Avg</div>
                    <div className="text-3xl font-bold text-blue-500">
                      {peerComparison.averageScore.toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Difference */}
                <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Difference</div>
                  <div className={cn(
                    'text-2xl font-bold',
                    peerComparison.userScore >= peerComparison.averageScore 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  )}>
                    {peerComparison.userScore >= peerComparison.averageScore ? '+' : ''}
                    {(peerComparison.userScore - peerComparison.averageScore).toFixed(0)} points
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
