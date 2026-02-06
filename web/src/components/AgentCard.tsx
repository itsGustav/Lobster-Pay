'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { Address } from 'viem';

interface AgentCardProps {
  address: Address;
  name: string;
  score: number;
  trustPercent: number;
  transactions: number;
  registrationDate?: string;
}

// Generate a deterministic avatar from address
function generateAvatar(address: string): string {
  const hash = address.toLowerCase();
  const hue = parseInt(hash.slice(2, 4), 16) * 1.41; // 0-360
  const saturation = 60 + (parseInt(hash.slice(4, 6), 16) % 20); // 60-80%
  const lightness = 45 + (parseInt(hash.slice(6, 8), 16) % 15); // 45-60%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Get tier badge based on LOBSTER score
function getScoreTier(score: number): { label: string; variant: 'success' | 'warning' | 'default' } {
  if (score >= 750) return { label: 'Elite', variant: 'success' };
  if (score >= 600) return { label: 'Trusted', variant: 'warning' };
  if (score >= 400) return { label: 'Building', variant: 'default' };
  return { label: 'New', variant: 'default' };
}

// Shorten address for display
function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function AgentCard({
  address,
  name,
  score,
  trustPercent,
  transactions,
  registrationDate,
}: AgentCardProps) {
  const avatarColor = generateAvatar(address);
  const tier = getScoreTier(score);
  const shortAddress = shortenAddress(address);

  return (
    <Card hover className="group cursor-pointer flex flex-col h-full">
      <Link href={`/agent/${address}`} className="flex-1">
        <div className="space-y-4">
          {/* Header: Avatar + Name + Badge */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg"
              style={{ backgroundColor: avatarColor }}
            >
              {name.slice(0, 2).toUpperCase()}
            </div>

            {/* Name + Address + Badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-50 group-hover:text-orange-500 transition-colors truncate">
                  {name}
                </h3>
                <Badge variant={tier.variant} className="flex-shrink-0">
                  {tier.label}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 font-mono truncate">{shortAddress}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800">
            <div>
              <div className="text-xs text-gray-500 mb-1">LOBSTER Score</div>
              <div className="text-2xl font-bold text-orange-500">{score}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Trust Rating</div>
              <div className="text-2xl font-bold text-green-500">{trustPercent}%</div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Transactions</div>
              <div className="text-lg font-bold text-gray-300">{transactions}</div>
            </div>

            {registrationDate && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Registered</div>
                <div className="text-sm font-medium text-gray-400">{registrationDate}</div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800">
        <Link href={`/agent/${address}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            View Profile
          </Button>
        </Link>
        <Link href={`/escrow/new?recipient=${address}`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full">
            Start Escrow
          </Button>
        </Link>
      </div>
    </Card>
  );
}
