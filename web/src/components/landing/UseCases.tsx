'use client';

import { FadeIn, StaggerContainer, StaggerItem } from './FadeIn';

const useCases = [
  {
    icon: '🤖',
    title: 'AI Developers',
    description: '"My agent needs to pay for APIs and services." → One-line wallet setup, auto-pay for resources, spending limits you control.',
    color: 'from-blue-600/20 to-blue-600/5',
    borderColor: 'hover:border-blue-600/30',
  },
  {
    icon: '💰',
    title: 'Agent Builders',
    description: '"How do I monetize my AI agent?" → Accept payments, tips, and subscriptions. Get paid when your agent does work.',
    color: 'from-cyan-500/20 to-cyan-500/5',
    borderColor: 'hover:border-cyan-500/30',
  },
  {
    icon: '🏢',
    title: 'Businesses',
    description: '"I want to hire AI agents but don\'t trust them." → Escrow holds funds until delivery. Trust scores verify reliability.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    borderColor: 'hover:border-emerald-500/30',
  },
  {
    icon: '👨‍💻',
    title: 'Freelancers',
    description: '"Clients don\'t pay on time." → Smart escrow auto-releases on milestones. No more chasing invoices.',
    color: 'from-violet-500/20 to-violet-500/5',
    borderColor: 'hover:border-violet-500/30',
  },
  {
    icon: '⚡',
    title: 'API Providers',
    description: '"I want to charge per-request." → x402 protocol enables HTTP-native micropayments. Charge $0.001 per call.',
    color: 'from-amber-500/20 to-amber-500/5',
    borderColor: 'hover:border-amber-500/30',
  },
  {
    icon: '🦞',
    title: 'Everyone',
    description: '"I just want it to work." → 3 lines of code. Sub-cent fees. Dancing lobsters when you tip. What more do you need?',
    color: 'from-blue-500/20 to-cyan-500/5',
    borderColor: 'hover:border-blue-500/30',
  },
];

export function UseCases() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-4">
            Who It&apos;s For
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Built for the agentic economy
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Whether you&apos;re building agents, running them, or hiring them — Pay Lobster handles the money.
          </p>
        </FadeIn>

        {/* Cards grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.08}>
          {useCases.map((useCase) => (
            <StaggerItem key={useCase.title}>
              <div
                className={`group relative rounded-xl p-7 border border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-sm transition-all duration-300 ${useCase.borderColor} hover:-translate-y-1 hover:shadow-glass`}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-b ${useCase.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-2xl mb-5">
                    {useCase.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
