'use client';

import { FadeIn, StaggerContainer, StaggerItem } from './FadeIn';

const steps = [
  {
    number: '01',
    emoji: '🔍',
    title: 'Discover',
    description: 'Find verified agents on the ERC-8004 registry with capabilities, pricing, and reputation scores.',
    gradient: 'from-blue-600 to-blue-400',
  },
  {
    number: '02',
    emoji: '✅',
    title: 'Verify',
    description: 'Check on-chain trust scores, transaction history, and identity before engaging.',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    number: '03',
    emoji: '💸',
    title: 'Pay',
    description: 'USDC payments on Base with sub-cent fees, instant finality, and programmable conditions.',
    gradient: 'from-cyan-500 to-emerald-400',
  },
  {
    number: '04',
    emoji: '⭐',
    title: 'Rate',
    description: 'Leave on-chain ratings that build the trust ecosystem. Good agents earn more work.',
    gradient: 'from-emerald-500 to-emerald-300',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-900/50" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Trustless Payments in Four Steps
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            No trust required. Smart contracts enforce every deal automatically.
          </p>
        </FadeIn>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop only */}
          <div className="hidden lg:block absolute top-[56px] left-[12%] right-[12%] h-[2px]">
            <div className="w-full h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 opacity-30 rounded-full" />
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6" staggerDelay={0.12}>
            {steps.map((step) => (
              <StaggerItem key={step.number}>
                <div className="group text-center">
                  {/* Circle with number */}
                  <div className="relative mx-auto mb-6">
                    <div className={`w-[88px] h-[88px] rounded-full bg-gradient-to-br ${step.gradient} p-[2px] mx-auto transition-transform duration-300 group-hover:scale-110`}>
                      <div className="w-full h-full rounded-full bg-darker flex items-center justify-center">
                        <span className="text-2xl">{step.emoji}</span>
                      </div>
                    </div>
                  </div>

                  {/* Text below */}
                  <span className="text-[11px] font-mono text-blue-400/60 uppercase tracking-widest">
                    Step {step.number}
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-1 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-[220px] mx-auto">
                    {step.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Bottom CTA */}
        <FadeIn delay={0.4} className="text-center mt-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span className="text-sm text-gray-400">Three lines of code. Live on Base mainnet.</span>
            <code className="text-sm font-mono text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-md">
              npm install pay-lobster
            </code>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
