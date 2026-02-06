'use client';

import { Button } from '@/components/ui/Button';
import { InfoTooltip } from '@/components/ui/Tooltip';

interface TourStepProps {
  onComplete: () => void;
}

export function TourStep({ onComplete }: TourStepProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500">
      {/* Icon */}
      <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg animate-in zoom-in-0 duration-700">
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>

      {/* Title */}
      <div className="space-y-3 max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-50">Your Dashboard Tour</h2>
        <p className="text-lg text-gray-300">
          Here's what you need to know to get started
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-2 gap-4 w-full max-w-4xl mt-8">
        <FeatureCard
          icon="🦞"
          title="LOBSTER Score"
          description="Your reputation score (0-1000) based on transaction history, escrow performance, and payment reliability."
          tip="Higher scores unlock better credit terms and lower fees"
        />
        <FeatureCard
          icon="💳"
          title="Credit Limit"
          description="Borrow capacity determined by your LOBSTER Score, collateral, and historical behavior."
          tip="Build trust to increase your limit over time"
        />
        <FeatureCard
          icon="🔒"
          title="Escrow System"
          description="Secure multi-party transactions with automated dispute resolution and reputation updates."
          tip="All escrows are on-chain and fully transparent"
        />
        <FeatureCard
          icon="🏆"
          title="Trust Tiers"
          description="Progress from Rookie to Legend as you build reputation. Each tier unlocks new features and benefits."
          tiers={['🥉 Rookie', '🥈 Trusted', '🥇 Veteran', '💎 Elite', '👑 Legend']}
        />
      </div>

      {/* Quick Tips */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl mt-8 text-left">
        <h3 className="font-semibold text-gray-50 mb-4 flex items-center gap-2">
          <span>💡</span> Pro Tips
        </h3>
        <ul className="space-y-3 text-sm text-gray-400">
          <li className="flex items-start gap-3">
            <span className="text-orange-600 font-bold">1.</span>
            <span>
              <strong className="text-gray-300">Complete transactions on time</strong> to build your score fastest
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-orange-600 font-bold">2.</span>
            <span>
              <strong className="text-gray-300">Start with small escrows</strong> to build trust gradually
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-orange-600 font-bold">3.</span>
            <span>
              <strong className="text-gray-300">Provide collateral</strong> to access higher credit limits
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-orange-600 font-bold">4.</span>
            <span>
              <strong className="text-gray-300">Check the leaderboard</strong> to see how you compare with peers
            </span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="w-full max-w-md mt-8">
        <Button
          variant="primary"
          size="lg"
          onClick={onComplete}
          className="w-full"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  tip?: string;
  tiers?: string[];
}

function FeatureCard({ icon, title, description, tip, tiers }: FeatureCardProps) {
  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-all duration-150 text-left">
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{icon}</div>
        {tip && <InfoTooltip content={tip} />}
      </div>
      <h3 className="font-semibold text-gray-50 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      {tiers && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tiers.map((tier, i) => (
            <span
              key={i}
              className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full"
            >
              {tier}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
