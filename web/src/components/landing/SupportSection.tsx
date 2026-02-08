'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeIn } from './FadeIn';
import { BlueLobster } from '@/components/BlueLobster';
import { cn } from '@/lib/utils';

const presetAmounts = [5, 10, 25, 50];

export function SupportSection() {
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomChange = (value: string) => {
    const numValue = value.replace(/[^0-9.]/g, '');
    setCustomAmount(numValue);
    if (numValue) {
      setIsCustom(true);
      setSelectedAmount(parseFloat(numValue) || 0);
    } else {
      setIsCustom(false);
      setSelectedAmount(25);
    }
  };

  const displayAmount = isCustom && customAmount ? customAmount : selectedAmount;

  return (
    <section className="relative py-20 md:py-28">
      <div className="max-w-2xl mx-auto px-4 md:px-8">
        <FadeIn>
          {/* Glass card container */}
          <div className="relative rounded-2xl p-8 md:p-10 bg-[rgba(15,23,42,0.5)] backdrop-blur-sm border border-white/[0.06] overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/20 via-transparent to-cyan-500/20 opacity-50 pointer-events-none" />
            <div className="absolute inset-[1px] rounded-2xl bg-[rgba(10,22,40,0.9)] pointer-events-none" />

            {/* Content */}
            <div className="relative space-y-6">
              {/* Live badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs text-emerald-400">●</span>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    LIVE ON BASE MAINNET
                  </span>
                </div>
              </div>

              {/* Lobster icon */}
              <motion.div
                className="flex justify-center"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <BlueLobster size={64} />
              </motion.div>

              {/* Title and description */}
              <div className="text-center space-y-2 mb-2">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Support Pay Lobster</h2>
                <p className="text-base text-gray-400">Help us build the future of agent payments</p>
              </div>

              {/* Preset amount buttons */}
              <div className="grid grid-cols-4 gap-3">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handlePresetClick(amount)}
                    className={cn(
                      'px-4 py-3 rounded-lg font-semibold text-lg transition-all duration-200',
                      'border',
                      !isCustom && selectedAmount === amount
                        ? 'bg-blue-600 border-blue-600 text-white shadow-glow-blue'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-blue-500/30'
                    )}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <div className="relative mt-2">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
                  $
                </div>
                <input
                  type="text"
                  value={customAmount}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  placeholder="Custom amount"
                  className={cn(
                    'w-full px-4 py-3.5 pl-8 pr-16 rounded-xl bg-white/5 border transition-all duration-200',
                    'text-gray-300 placeholder:text-gray-600 font-medium',
                    'focus:outline-none focus:ring-2 focus:ring-blue-600/50',
                    isCustom
                      ? 'border-blue-500/50 bg-blue-600/5'
                      : 'border-white/10 hover:border-white/20'
                  )}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm pointer-events-none">
                  USDC
                </div>
              </div>

              {/* Donate button */}
              <Link href="/pay/support" className="block mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg shadow-glow-blue hover:shadow-glow-blue-lg transition-all duration-200"
                >
                  🦞 Donate ${displayAmount} USDC
                </motion.button>
              </Link>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-gray-400 mt-6">
                <span className="flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>Secure</span>
                </span>
                <span className="text-gray-700">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-blue-400">🔵</span>
                  <span>Base Network</span>
                </span>
                <span className="text-gray-700">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-blue-400">🔵</span>
                  <span>USDC Stablecoin</span>
                </span>
              </div>

              {/* Footer text */}
              <div className="pt-6 border-t border-white/5 text-center">
                <p className="text-sm text-gray-500">
                  100% of donations fund development. No middlemen. Built with{' '}
                  <span className="text-blue-400">💙</span>
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
