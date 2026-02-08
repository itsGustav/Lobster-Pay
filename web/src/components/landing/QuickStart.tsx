'use client';

import Link from 'next/link';
import { FadeIn } from './FadeIn';
import { Button } from '@/components/ui/Button';

export function QuickStart() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-4">
            GET STARTED
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Up and running in 30 seconds
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            One install. Real USDC. No setup required.
          </p>
        </FadeIn>

        {/* Terminal */}
        <FadeIn delay={0.2}>
          <div className="rounded-2xl border border-white/10 bg-[rgba(10,22,40,0.8)] backdrop-blur-sm overflow-hidden shadow-2xl">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[rgba(15,23,42,0.5)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2 text-xs font-medium text-gray-500">terminal</span>
            </div>

            {/* Terminal content */}
            <div className="p-6 font-mono text-sm overflow-x-auto">
              <div className="space-y-4">
                {/* Install command */}
                <div>
                  <span className="text-gray-600"># Install Pay Lobster</span>
                  <div className="flex items-start gap-2 mt-1">
                    <span className="text-emerald-400 select-none">$</span>
                    <span className="text-gray-300">npm install pay-lobster</span>
                  </div>
                </div>

                {/* Empty line */}
                <div className="h-2" />

                {/* Balance check command */}
                <div>
                  <span className="text-gray-600"># Check any wallet balance (no setup needed!)</span>
                  <div className="flex items-start gap-2 mt-1">
                    <span className="text-emerald-400 select-none">$</span>
                    <span className="text-gray-300">
                      npx pay-lobster balance 0xf775f0224A680E2915a066e53A389d0335318b7B
                    </span>
                  </div>
                </div>

                {/* Empty line */}
                <div className="h-2" />

                {/* Output */}
                <div>
                  <span className="text-gray-600"># Output:</span>
                  <div className="mt-1 text-cyan-400">💰 Balance: 0.00 USDC on Base mainnet</div>
                </div>

                {/* Empty line */}
                <div className="h-2" />

                {/* Final comment */}
                <div>
                  <span className="text-gray-600">
                    # That&apos;s it. You&apos;re live. Use Pay Lobster by chatting with your agent. 🦞
                  </span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Tip box */}
        <FadeIn delay={0.3}>
          <div className="mt-8 p-4 rounded-xl bg-blue-600/5 border border-blue-600/20 flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <p className="text-sm text-gray-300 flex-1">
              Want to send payments?{' '}
              <Link href="/docs/setup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Add your wallet credentials →
              </Link>
            </p>
          </div>
        </FadeIn>

        {/* Action buttons */}
        <FadeIn delay={0.4}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
            <Link href="https://npmjs.com/package/pay-lobster" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto min-w-[200px]">
                📦 View on npm
              </Button>
            </Link>
            <Link href="https://github.com/itsGustav/PayLobster" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
                ⭐ Star on GitHub
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
