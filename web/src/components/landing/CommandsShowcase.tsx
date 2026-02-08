'use client';

import { FadeIn, StaggerContainer, StaggerItem } from './FadeIn';
import { CodeBlock } from '@/components/docs/CodeBlock';

const showcaseCommands = [
  {
    title: 'Setup in Seconds',
    description: 'Initialize your agent wallet and on-chain identity with a single command.',
    icon: '⚡',
    color: 'from-blue-600 to-cyan-500',
    command: 'paylobster setup',
    output: `✓ Wallet initialized
✓ Agent identity created (NFT #1234)
✓ Initial LOBSTER score: 650
✓ Ready to accept payments!

Your agent address: 0x742d...89aB`,
  },
  {
    title: 'Accept Payments Instantly',
    description: 'Create payment requests or links that work anywhere — chat, email, or embedded.',
    icon: '💰',
    color: 'from-green-600 to-emerald-500',
    command: 'paylobster request 25 --description "Premium AI Analysis"',
    output: `Payment request created!

Pay here: https://paylobster.com/pay/req_7x9m...
QR Code: https://paylobster.com/qr/req_7x9m...

Waiting for payment...`,
  },
  {
    title: 'Check Your Reputation',
    description: 'Monitor your on-chain credit score and see exactly what drives it.',
    icon: '⭐',
    color: 'from-purple-600 to-pink-500',
    command: 'paylobster score',
    output: `LOBSTER Credit Score: 782 (Verified Tier)

Score Breakdown:
  Transaction History (35%): 285 pts
  Payment Behavior (30%):   240 pts
  Account Age (15%):        110 pts
  Credit Utilization (10%):  78 pts
  Network Trust (10%):       69 pts

Credit Limit: $782.00 USDC`,
  },
  {
    title: 'Create Secure Escrow',
    description: 'Lock funds in trustless escrow with milestone releases and automatic dispute resolution.',
    icon: '🔒',
    color: 'from-orange-600 to-red-500',
    command: `paylobster escrow create \\
  --to 0x742d...89aB \\
  --amount 100 \\
  --deadline 7d \\
  --terms "Website redesign with 3 milestones"`,
    output: `Escrow created: ESC-0x3f7a...

Deposited: 100.00 USDC
Provider: 0x742d...89aB (Score: 745)
Deadline: 7 days
Status: AWAITING_DELIVERY

Track: https://paylobster.com/escrow/ESC-0x3f7a...`,
  },
];

export function CommandsShowcase() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-darker to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-4">
            Powerful CLI
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Everything You Need in One Tool
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Accept payments, build reputation, and manage escrow — all from the command line or SDK.
          </p>
        </FadeIn>

        {/* Commands Grid */}
        <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {showcaseCommands.map((cmd, idx) => (
            <StaggerItem key={idx}>
              <div className="group h-full rounded-2xl border border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-sm overflow-hidden hover:border-blue-600/30 transition-all">
                {/* Card Header */}
                <div className="p-6 pb-4 border-b border-white/[0.04]">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cmd.color} flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      {cmd.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1">{cmd.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{cmd.description}</p>
                    </div>
                  </div>
                </div>

                {/* Command Block */}
                <div className="p-6 space-y-4">
                  {/* Input */}
                  <div className="rounded-lg bg-darker/80 border border-white/[0.04] p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-cyan-400 text-xs font-mono">$</span>
                      <span className="text-xs font-mono text-gray-500">command</span>
                    </div>
                    <code className="block text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                      {cmd.command}
                    </code>
                  </div>

                  {/* Output */}
                  <div className="rounded-lg bg-darker/60 border border-green-600/20 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-400 text-xs">●</span>
                      <span className="text-xs font-mono text-gray-500">output</span>
                    </div>
                    <pre className="text-xs md:text-sm font-mono text-gray-400 whitespace-pre-wrap break-all leading-relaxed">
                      {cmd.output}
                    </pre>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom CTA */}
        <FadeIn delay={0.5} className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-600/20">
            <div className="text-left sm:text-left">
              <div className="text-sm font-semibold text-white mb-1">Ready to get started?</div>
              <div className="text-xs text-gray-400">Install the CLI and register your agent in under 2 minutes.</div>
            </div>
            <a
              href="/docs"
              className="flex-shrink-0 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-600/50 hover:scale-105"
            >
              View Docs →
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
