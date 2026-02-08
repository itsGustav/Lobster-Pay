'use client';

import { FadeIn, StaggerContainer, StaggerItem } from './FadeIn';

const templates = [
  {
    icon: '👨‍💻',
    title: 'Freelance Milestones',
    description: 'Break projects into milestones. Each milestone releases funds automatically when the buyer approves delivery.',
    tags: ['Auto-release', 'Milestones', 'Disputes'],
  },
  {
    icon: '🏠',
    title: 'Real Estate Deposits',
    description: 'Earnest money held in trustless escrow. Funds release when closing conditions are met, or refund on timeout.',
    tags: ['Conditional', 'Timeout', 'Multi-party'],
  },
  {
    icon: '🛒',
    title: 'E-Commerce Protection',
    description: 'Buyer protection for digital and physical goods. Funds held until the buyer confirms receipt and satisfaction.',
    tags: ['Buyer protection', 'Auto-refund'],
  },
  {
    icon: '🤝',
    title: 'P2P Trade Escrow',
    description: 'Secure peer-to-peer exchanges without intermediaries. Both parties deposit, both parties approve.',
    tags: ['Mutual deposit', 'Trustless'],
  },
];

export function EscrowTemplates() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-4">
            Escrow
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Pre-Built Escrow Templates
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Pick a template and customize. Trustless payments for every use case.
          </p>
        </FadeIn>

        {/* Templates grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5" staggerDelay={0.08}>
          {templates.map((template) => (
            <StaggerItem key={template.title}>
              <div className="group relative rounded-xl p-7 border border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-sm transition-all duration-300 hover:border-blue-600/30 hover:-translate-y-1 hover:shadow-glass h-full">
                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-2xl flex-shrink-0">
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2">{template.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">{template.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2.5 py-1 text-[11px] font-medium text-cyan-400 bg-cyan-400/10 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Code snippet */}
        <FadeIn delay={0.3} className="mt-10">
          <div className="max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/[0.06] bg-[#0A0E1A]">
            <div className="flex items-center gap-2 px-5 py-3 bg-[rgba(15,23,42,0.8)] border-b border-white/[0.06]">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-gray-500 font-mono">create-escrow.ts</span>
            </div>
            <div className="p-5 overflow-x-auto">
              <pre className="font-mono text-[13px] leading-[1.8]">
                <code>
                  <span className="text-gray-600">{'// Create an escrow in 3 lines'}</span>{'\n'}
                  <span className="text-purple-400">const</span>{' '}
                  <span className="text-cyan-300">escrow</span>{' '}
                  <span className="text-gray-500">=</span>{' '}
                  <span className="text-purple-400">await</span>{' '}
                  <span className="text-cyan-300">payLobster</span>
                  <span className="text-gray-400">.</span>
                  <span className="text-blue-300">createEscrow</span>
                  <span className="text-gray-400">(</span>
                  <span className="text-gray-400">{'{'}</span>{'\n'}
                  {'  '}<span className="text-blue-300">seller</span>
                  <span className="text-gray-400">:</span>{' '}
                  <span className="text-green-300">{'"0xSeller..."'}</span>
                  <span className="text-gray-400">,</span>{'\n'}
                  {'  '}<span className="text-blue-300">amount</span>
                  <span className="text-gray-400">:</span>{' '}
                  <span className="text-green-300">{'"100"'}</span>
                  <span className="text-gray-400">,</span>{' '}
                  <span className="text-gray-600">{'// 100 USDC'}</span>{'\n'}
                  {'  '}<span className="text-blue-300">timeout</span>
                  <span className="text-gray-400">:</span>{' '}
                  <span className="text-amber-300">86400</span>{' '}
                  <span className="text-gray-600">{'// 24 hours'}</span>{'\n'}
                  <span className="text-gray-400">{'}'}</span>
                  <span className="text-gray-400">)</span>
                  <span className="text-gray-400">;</span>
                </code>
              </pre>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
