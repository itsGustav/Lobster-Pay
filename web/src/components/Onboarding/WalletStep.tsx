'use client';

import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface WalletStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function WalletStep({ onNext, onSkip }: WalletStepProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsConnecting(false);
    onNext();
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500">
      {/* Icon */}
      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
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
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      </div>

      {/* Title */}
      <div className="space-y-3 max-w-md">
        <h2 className="text-3xl font-bold text-gray-50">Connect Your Wallet</h2>
        <p className="text-lg text-gray-300">
          Link your wallet to start building your reputation on-chain
        </p>
      </div>

      {/* Wallet Options */}
      <div className="grid gap-3 w-full max-w-md mt-8">
        <WalletOption
          name="Coinbase Wallet"
          icon="🔵"
          recommended
          onClick={handleConnect}
          isLoading={isConnecting}
        />
        <WalletOption
          name="MetaMask"
          icon="🦊"
          onClick={handleConnect}
          isLoading={isConnecting}
        />
        <WalletOption
          name="WalletConnect"
          icon="🔗"
          onClick={handleConnect}
          isLoading={isConnecting}
        />
      </div>

      {/* Benefits */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md mt-6">
        <h3 className="font-semibold text-gray-50 mb-3 text-left">Why connect?</h3>
        <ul className="space-y-2 text-sm text-gray-400 text-left">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Build your on-chain reputation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Access credit based on your score</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Participate in secure escrow transactions</span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-md mt-8">
        <Button variant="ghost" onClick={onSkip} className="flex-1">
          Skip for now
        </Button>
      </div>
    </div>
  );
}

interface WalletOptionProps {
  name: string;
  icon: string;
  recommended?: boolean;
  onClick: () => void;
  isLoading: boolean;
}

function WalletOption({ name, icon, recommended, onClick, isLoading }: WalletOptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="relative flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-800 transition-all duration-150 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {recommended && (
        <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-orange-600/20 text-orange-600 rounded-full">
          Recommended
        </span>
      )}
      <div className="text-3xl">{icon}</div>
      <div className="flex-1 text-left">
        <p className="font-medium text-gray-50">{name}</p>
      </div>
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
}
