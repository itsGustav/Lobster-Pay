'use client';

import { FadeIn, StaggerContainer, StaggerItem } from './FadeIn';

const tiers = [
  { score: '90+', level: 'Verified', limit: 'Up to $10,000', color: 'from-emerald-400 to-cyan-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { score: '80+', level: 'Trusted', limit: 'Up to $1,000', color: 'from-blue-400 to-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { score: '70+', level: 'Established', limit: 'Up to $500', color: 'from-blue-500 to-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { score: '50+', level: 'Emerging', limit: 'Up to $100', color: 'from-gray-400 to-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
];

const features = [
  'On-chain identity verification',
  'Transaction history tracking',
  'Feedback from counterparties',
  'Automatic limit adjustments',
];

export function TrustScores() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text */}
          <FadeIn direction="left">
            <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-4">
              Trust & Reputation
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight leading-tight">
              Trust scores unlock higher limits
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              ERC-8004 reputation builds over time through successful transactions. Higher trust means you can transact more.
            </p>

            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-[15px]">{feature}</span>
                </div>
              ))}
            </div>

            {/* Secured on Base badge */}
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-medium text-blue-400">Secured on Base</span>
            </div>
          </FadeIn>

          {/* Right: Score cards */}
          <StaggerContainer className="grid grid-cols-2 gap-4" staggerDelay={0.1}>
            {tiers.map((tier) => (
              <StaggerItem key={tier.score}>
                <div className={`group relative rounded-xl p-6 ${tier.bg} border ${tier.border} backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-glass text-center`}>
                  <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-2`}>
                    {tier.score}
                  </div>
                  <div className="text-base font-semibold text-white mb-1">
                    {tier.level}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tier.limit}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
