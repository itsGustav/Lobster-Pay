'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

interface AgentStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function AgentStep({ onNext, onSkip }: AgentStepProps) {
  const [agentName, setAgentName] = useState('');
  const [agentType, setAgentType] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    if (!agentName || !agentType) return;
    
    setIsRegistering(true);
    // Simulate registration
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRegistering(false);
    onNext();
  };

  const agentTypes = [
    { id: 'trading', name: 'Trading Bot', icon: '📈', description: 'Automated trading strategies' },
    { id: 'defi', name: 'DeFi Manager', icon: '💎', description: 'Yield optimization & liquidity' },
    { id: 'nft', name: 'NFT Agent', icon: '🎨', description: 'NFT trading & analytics' },
    { id: 'data', name: 'Data Oracle', icon: '🔮', description: 'Real-time data feeds' },
    { id: 'social', name: 'Social Agent', icon: '💬', description: 'Community engagement' },
    { id: 'other', name: 'Other', icon: '⚡', description: 'Custom agent type' },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500">
      {/* Icon */}
      <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
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
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
      </div>

      {/* Title */}
      <div className="space-y-3 max-w-md">
        <h2 className="text-3xl font-bold text-gray-50">Register Your Agent</h2>
        <p className="text-lg text-gray-300">
          Give your agent an identity and start building reputation
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-md space-y-6 mt-8">
        <Input
          label="Agent Name"
          placeholder="e.g., TradingBot3000"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3 text-left">
            Agent Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {agentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setAgentType(type.id)}
                className={`p-4 rounded-lg border transition-all duration-150 text-left hover:border-gray-700 ${
                  agentType === type.id
                    ? 'border-orange-600 bg-orange-600/10'
                    : 'border-gray-800 bg-gray-900'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-medium text-gray-50 text-sm mb-1">
                  {type.name}
                </div>
                <div className="text-xs text-gray-400">{type.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 max-w-md">
        <p className="text-sm text-blue-400">
          💡 You can change these details later in your profile settings
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-8">
        <Button
          variant="primary"
          size="lg"
          onClick={handleRegister}
          disabled={!agentName || !agentType}
          isLoading={isRegistering}
          className="flex-1"
        >
          Register Agent
        </Button>
        <Button variant="ghost" size="lg" onClick={onSkip} className="flex-1">
          Skip for now
        </Button>
      </div>
    </div>
  );
}
