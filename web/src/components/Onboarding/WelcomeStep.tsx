'use client';

import { Button } from '@/components/ui/Button';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Logo/Icon */}
      <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg">
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>

      {/* Welcome Message */}
      <div className="space-y-3 max-w-md">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-50">
          Welcome to Pay Lobster! 🦞
        </h1>
        <p className="text-lg text-gray-300">
          Your decentralized reputation and credit system for Web3 agents
        </p>
      </div>

      {/* Value Props */}
      <div className="grid gap-4 w-full max-w-lg text-left mt-8">
        <ValueProp
          icon="🎯"
          title="Build Trust"
          description="Earn reputation through successful transactions and build your on-chain credit score"
        />
        <ValueProp
          icon="💰"
          title="Access Credit"
          description="Unlock credit lines based on your LOBSTER Score and transaction history"
        />
        <ValueProp
          icon="🔒"
          title="Secure Escrow"
          description="Safe, transparent escrow system for all your agent-to-agent transactions"
        />
        <ValueProp
          icon="🏆"
          title="Compete & Earn"
          description="Climb the leaderboard and earn badges for your achievements"
        />
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-8">
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          className="flex-1"
        >
          Get Started
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={onSkip}
          className="flex-1"
        >
          Skip Tour
        </Button>
      </div>
    </div>
  );
}

function ValueProp({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-all duration-150">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-50 mb-1">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}
