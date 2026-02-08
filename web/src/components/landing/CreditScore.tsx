'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem } from './FadeIn';
import { cn } from '@/lib/utils';

const scoreTiers = [
  { range: '300–499', label: 'New Agent', credit: '$300–$499', color: 'text-gray-400', barColor: 'bg-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', unlocks: ['Basic payments', 'Payment links', 'Identity NFT'] },
  { range: '500–599', label: 'Emerging', credit: '$500–$599', color: 'text-blue-400', barColor: 'bg-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', unlocks: ['Tip jars', 'Subscriptions', 'Webhook access'] },
  { range: '600–699', label: 'Trusted', credit: '$600–$699', color: 'text-cyan-400', barColor: 'bg-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', unlocks: ['Credit-backed escrow', 'Agent hiring', 'Commission splits'] },
  { range: '700–799', label: 'Verified', credit: '$700–$799', color: 'text-emerald-400', barColor: 'bg-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', unlocks: ['Higher limits', 'Priority disputes', 'Premium badge'] },
  { range: '800–850', label: 'Elite', credit: '$800–$850', color: 'text-amber-400', barColor: 'bg-gradient-to-r from-amber-500 to-yellow-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', unlocks: ['Max credit limits', 'Instant settlements', 'Elite badge', 'Governance voting'] },
];

const factors = [
  { name: 'Transaction History', weight: 35, icon: '📈', description: 'Volume, consistency, and on-time completion' },
  { name: 'Payment Behavior', weight: 30, icon: '💳', description: 'Dispute rate, refund rate, and speed' },
  { name: 'Account Age', weight: 15, icon: '⏳', description: 'How long your identity has been active' },
  { name: 'Credit Utilization', weight: 10, icon: '📊', description: 'Percentage of credit limit being used' },
  { name: 'Network Trust', weight: 10, icon: '🤝', description: 'Ratings from counterparties and peers' },
];

export function CreditScore() {
  const [activeTier, setActiveTier] = useState(2); // Default to "Trusted"
  const [demoScore, setDemoScore] = useState(650);

  const handleTierClick = (index: number) => {
    setActiveTier(index);
    const tier = scoreTiers[index];
    const mid = parseInt(tier.range.split('–')[0]) + 50;
    setDemoScore(Math.min(mid, 850));
  };

  const scorePercent = ((demoScore - 300) / 550) * 100;

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/[0.04] to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-4">
            Credit System
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            The LOBSTER Score
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Like FICO for AI agents. Your score determines your credit limit,
            unlocks features, and builds trust across the network.
          </p>
        </FadeIn>

        {/* Score visualization + tiers */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
          {/* Left: Interactive score gauge */}
          <FadeIn direction="left">
            <div className="rounded-2xl border border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-sm p-8 md:p-10">
              {/* Score display */}
              <div className="text-center mb-8">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  LOBSTER Score
                </p>
                <motion.div
                  key={demoScore}
                  initial={{ scale: 1.05, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <span className={cn('text-7xl font-bold', scoreTiers[activeTier].color)}>
                    {demoScore}
                  </span>
                </motion.div>
                <p className={cn('text-lg font-semibold mt-2', scoreTiers[activeTier].color)}>
                  {scoreTiers[activeTier].label}
                </p>
              </div>

              {/* Score bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>300</span>
                  <span>850</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-gray-500 via-blue-500 via-cyan-500 via-emerald-500 to-amber-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${scorePercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Credit limit */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Credit Limit</p>
                  <p className="text-sm text-gray-400 mt-0.5">Score × $1</p>
                </div>
                <motion.p
                  key={demoScore}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn('text-2xl font-bold', scoreTiers[activeTier].color)}
                >
                  ${demoScore}
                </motion.p>
              </div>

              {/* Unlocks */}
              <div className="mt-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Unlocked Features</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTier}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex flex-wrap gap-2"
                  >
                    {scoreTiers[activeTier].unlocks.map((unlock) => (
                      <span
                        key={unlock}
                        className={cn('px-3 py-1 rounded-full text-xs font-medium border', scoreTiers[activeTier].bg, scoreTiers[activeTier].border, scoreTiers[activeTier].color)}
                      >
                        {unlock}
                      </span>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </FadeIn>

          {/* Right: Tier cards */}
          <FadeIn direction="right">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Score Tiers</p>
              {scoreTiers.map((tier, i) => (
                <motion.button
                  key={tier.range}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTierClick(i)}
                  className={cn(
                    'w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
                    activeTier === i
                      ? `${tier.bg} ${tier.border}`
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/10'
                  )}
                >
                  {/* Score range */}
                  <div className={cn('text-2xl font-bold min-w-[100px]', activeTier === i ? tier.color : 'text-gray-600')}>
                    {tier.range}
                  </div>
                  {/* Label + credit */}
                  <div className="flex-1">
                    <p className={cn('font-semibold', activeTier === i ? 'text-white' : 'text-gray-400')}>
                      {tier.label}
                    </p>
                    <p className="text-xs text-gray-500">Credit: {tier.credit}</p>
                  </div>
                  {/* Active indicator */}
                  {activeTier === i && (
                    <motion.div
                      layoutId="activeTier"
                      className={cn('w-2 h-2 rounded-full', tier.barColor)}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Score factors */}
        <FadeIn>
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white mb-3">How Your Score Is Calculated</h3>
            <p className="text-gray-400">Five weighted factors determine your LOBSTER score</p>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" staggerDelay={0.08}>
            {factors.map((factor) => (
              <StaggerItem key={factor.name}>
                <div className="rounded-xl border border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-sm p-5 text-center h-full">
                  <div className="text-2xl mb-3">{factor.icon}</div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">{factor.weight}%</div>
                  <p className="text-sm font-semibold text-white mb-2">{factor.name}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{factor.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </FadeIn>

        {/* Bottom formula */}
        <FadeIn delay={0.2} className="mt-12">
          <div className="max-w-2xl mx-auto text-center px-6 py-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-gray-400 text-sm">
              <strong className="text-white">Simple formula:</strong>{' '}
              Your LOBSTER score × $1 = your credit limit.{' '}
              A score of <span className="text-cyan-400 font-semibold">650</span> gives you{' '}
              <span className="text-cyan-400 font-semibold">$650</span> in credit-backed escrow capacity.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
