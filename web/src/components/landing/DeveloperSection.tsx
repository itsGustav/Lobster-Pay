'use client';

import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from './FadeIn';

const developerOptions = [
  {
    icon: '🔌',
    title: 'REST API',
    description: 'Simple HTTP endpoints for payments, escrow, and identity verification.',
    codeSnippet: `curl -X POST https://api.paylobster.com/pay \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -d '{"to":"0x...", "amount":"10.00"}'`,
    language: 'bash',
    link: '/docs/api',
  },
  {
    icon: '📦',
    title: 'TypeScript SDK',
    description: 'Full-featured SDK for Node.js and browsers. Type-safe and developer-friendly.',
    codeSnippet: `import { PayLobster } from 'pay-lobster';

const client = new PayLobster(apiKey);

await client.pay({
  to: '0x...',
  amount: '10.00',
  currency: 'USDC'
});`,
    language: 'typescript',
    link: '/docs/sdk',
  },
  {
    icon: '🦞',
    title: 'OpenClaw Skill',
    description: 'One-line install for your OpenClaw agent. Accept payments directly in chat.',
    codeSnippet: `# Install the skill
openclaw skill install pay-lobster

# Your agent now accepts payments!
"Send $5 to agent@paylobster.com"
→ ✅ Payment sent!`,
    language: 'bash',
    link: '/docs/openclaw',
  },
];

export function DeveloperSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/5 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-4">
            For Developers
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Build with Pay Lobster
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            REST API, TypeScript SDK, or OpenClaw Skill — pick your integration path.
          </p>
        </FadeIn>

        {/* Developer options grid */}
        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {developerOptions.map((option) => (
            <StaggerItem key={option.title}>
              <div className="group relative rounded-2xl border border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-blue-600/30 hover:-translate-y-1 hover:shadow-glass h-full flex flex-col">
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-2xl flex-shrink-0">
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-2">{option.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{option.description}</p>
                    </div>
                  </div>
                </div>

                {/* Code snippet */}
                <div className="flex-1 px-6 pb-6">
                  <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#0A0E1A]">
                    {/* Code header */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(15,23,42,0.8)] border-b border-white/[0.06]">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      <span className="ml-2 text-[10px] text-gray-500 font-mono">{option.language}</span>
                    </div>

                    {/* Code content */}
                    <div className="p-4 overflow-x-auto">
                      <pre className="font-mono text-[11px] sm:text-xs leading-[1.6] text-gray-300 whitespace-pre">
                        {option.codeSnippet}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Footer link */}
                <div className="px-6 pb-6 pt-2">
                  <Link
                    href={option.link}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors group-hover:gap-3"
                  >
                    Read the docs
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom CTA */}
        <FadeIn delay={0.4} className="text-center mt-12">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-sm text-gray-400">Need help getting started?</span>
            <Link href="/docs" className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Browse Documentation
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
