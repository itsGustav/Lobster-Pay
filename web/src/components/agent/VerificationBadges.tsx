'use client';

import { type VerificationBadge } from '@/types/badges';
import { getEarnedBadges } from '@/lib/badge-utils';

interface VerificationBadgesProps {
  badges: VerificationBadge[];
  showAll?: boolean;
}

export function VerificationBadges({ badges, showAll = false }: VerificationBadgesProps) {
  const displayBadges = showAll ? badges : getEarnedBadges(badges);

  if (displayBadges.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {showAll ? 'All Badges' : 'Earned Badges'}
        </h2>
        {showAll && (
          <span className="text-sm text-gray-400">
            {getEarnedBadges(badges).length} / {badges.length} earned
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {displayBadges.map((badge) => (
          <div
            key={badge.type}
            className={`
              border rounded-lg p-4 flex flex-col gap-2 transition-all
              ${badge.earned
                ? 'bg-gray-950 border-gray-800 hover:border-orange-600'
                : 'bg-gray-950/50 border-gray-800/50 opacity-50'
              }
            `}
            title={badge.description}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{badge.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {badge.name}
                </div>
                {badge.earned && (
                  <div className="text-green-500 text-xs flex items-center gap-1 mt-0.5">
                    <span>✓</span>
                    <span>Earned</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              {badge.description}
            </p>
            {!badge.earned && (
              <div className="text-gray-500 text-xs mt-1 pt-2 border-t border-gray-800">
                Criteria: {badge.criteria}
              </div>
            )}
          </div>
        ))}
      </div>

      {!showAll && badges.length > displayBadges.length && (
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            {badges.length - displayBadges.length} more badge{badges.length - displayBadges.length !== 1 ? 's' : ''} available to earn
          </p>
        </div>
      )}
    </div>
  );
}
