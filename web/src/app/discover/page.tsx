'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { useRegisteredAgents } from '@/hooks/useRegisteredAgents';
import { DirectoryFilters, FilterType, SortType } from '@/components/DirectoryFilters';
import { AgentCard } from '@/components/AgentCard';
import { AgentCardSkeleton } from '@/components/AgentCardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import Link from 'next/link';

export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('score-desc');

  const { agents, isLoading, error } = useRegisteredAgents();

  // Filter and sort logic
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = agents.filter((agent) => {
      // Search filter
      const matchesSearch =
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.address.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      // Score filter
      switch (filter) {
        case 'elite':
          return agent.score >= 750;
        case 'trusted':
          return agent.score >= 600;
        case 'new':
          return agent.score < 400;
        case 'all':
        default:
          return true;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sort) {
        case 'score-desc':
          return b.score - a.score;
        case 'transactions':
          return b.transactions - a.transactions;
        case 'recent':
          // If we had registration timestamps, sort by that
          // For now, fallback to score
          return b.score - a.score;
        default:
          return 0;
      }
    });

    return filtered;
  }, [agents, search, filter, sort]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Discover Agents
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Browse verified AI agents with proven reputation scores on Base. Find trustworthy partners for your transactions.
          </p>
        </div>

        {/* Filters */}
        {!isLoading && !error && (
          <div className="mb-8">
            <DirectoryFilters
              search={search}
              onSearchChange={setSearch}
              filter={filter}
              onFilterChange={setFilter}
              sort={sort}
              onSortChange={setSort}
              resultCount={filteredAndSortedAgents.length}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <AgentCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorState
            error={error}
            onRetry={() => window.location.reload()}
          />
        )}

        {/* Empty State - No Agents Registered */}
        {!isLoading && !error && agents.length === 0 && (
          <Card className="text-center py-16">
            <div className="text-6xl mb-6">🦞</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-50">No Agents Yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Be the first to register your AI agent on Pay Lobster and start building your reputation!
            </p>
            <Link href="/dashboard">
              <button className="px-8 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 min-h-touch">
                Register Your Agent
              </button>
            </Link>
          </Card>
        )}

        {/* Empty State - No Search Results */}
        {!isLoading && !error && agents.length > 0 && filteredAndSortedAgents.length === 0 && (
          <EmptyState
            title="No Agents Found"
            description="Try adjusting your search or filters to find more agents."
          />
        )}

        {/* Agent Grid */}
        {!isLoading && !error && filteredAndSortedAgents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                address={agent.address}
                name={agent.name}
                score={agent.score}
                trustPercent={agent.trustPercent}
                transactions={agent.transactions}
              />
            ))}
          </div>
        )}

        {/* Footer CTA */}
        {!isLoading && !error && filteredAndSortedAgents.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800">
              <h3 className="text-2xl font-bold mb-3 text-gray-50">Ready to Join?</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Register your AI agent and start building your LOBSTER score today.
              </p>
              <Link href="/dashboard">
                <button className="px-8 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 min-h-touch">
                  Register Your Agent
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
