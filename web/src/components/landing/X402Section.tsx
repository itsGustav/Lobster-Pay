'use client';

import { FadeIn } from './FadeIn';

export function X402Section() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-900/50" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <FadeIn direction="left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 mb-6">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Protocol</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
              x402 Payment Protocol
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-6">
              When Agent A calls Agent B&apos;s API and gets a <code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded text-sm font-mono">402 Payment Required</code> response,
              Pay Lobster automatically parses the payment request, sends the USDC, and retries with proof of payment.
            </p>
            <p className="text-base text-gray-500 leading-relaxed mb-8">
              No invoices, no manual steps, no waiting. HTTP-native micropayments that work at machine speed.
            </p>

            <div className="space-y-3">
              {[
                'HTTP-native micropayments',
                'Auto-pay on 402 response',
                'Payment receipt verification',
                'Max payment limits per request',
                'Server middleware included',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Right: Code example */}
          <FadeIn direction="right" delay={0.15}>
            <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0A0E1A] shadow-2xl">
              {/* Code header */}
              <div className="flex items-center gap-2 px-5 py-3.5 bg-[rgba(15,23,42,0.8)] border-b border-white/[0.06]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs text-gray-500 font-mono">x402-example.ts</span>
              </div>

              {/* Code content */}
              <div className="p-5 overflow-x-auto">
                <pre className="font-mono text-[13px] leading-[1.8]">
                  <code>
                    <span className="text-gray-600">{'// Agent A calls Agent B\'s paid API'}</span>{'\n'}
                    <span className="text-purple-400">const</span>{' '}
                    <span className="text-cyan-300">response</span>{' '}
                    <span className="text-gray-500">=</span>{' '}
                    <span className="text-purple-400">await</span>{' '}
                    <span className="text-blue-300">fetch</span>
                    <span className="text-gray-400">(</span>{'\n'}
                    {'  '}<span className="text-green-300">{'"https://api.auditbot.ai/scan"'}</span>
                    <span className="text-gray-400">,</span>{'\n'}
                    {'  '}<span className="text-gray-400">{'{'}</span>{' '}
                    <span className="text-blue-300">headers</span>
                    <span className="text-gray-400">:</span>{' '}
                    <span className="text-gray-400">{'{'}</span>{' '}
                    <span className="text-green-300">{'"X-402-Pay"'}</span>
                    <span className="text-gray-400">:</span>{' '}
                    <span className="text-green-300">{'"auto"'}</span>{' '}
                    <span className="text-gray-400">{'}'}</span>{' '}
                    <span className="text-gray-400">{'}'}</span>{'\n'}
                    <span className="text-gray-400">)</span>
                    <span className="text-gray-400">;</span>{'\n'}
                    {'\n'}
                    <span className="text-gray-600">{'// Pay Lobster handles the 402 flow:'}</span>{'\n'}
                    <span className="text-gray-600">{'// 1. Receives 402 Payment Required'}</span>{'\n'}
                    <span className="text-gray-600">{'// 2. Parses payment: $0.001 USDC'}</span>{'\n'}
                    <span className="text-gray-600">{'// 3. Sends USDC on Base (~$0.0001 fee)'}</span>{'\n'}
                    <span className="text-gray-600">{'// 4. Retries with payment receipt'}</span>{'\n'}
                    {'\n'}
                    <span className="text-purple-400">const</span>{' '}
                    <span className="text-cyan-300">result</span>{' '}
                    <span className="text-gray-500">=</span>{' '}
                    <span className="text-purple-400">await</span>{' '}
                    <span className="text-cyan-300">response</span>
                    <span className="text-gray-400">.</span>
                    <span className="text-blue-300">json</span>
                    <span className="text-gray-400">();</span>{'\n'}
                    <span className="text-emerald-400">{'// ✓ Audit complete — paid $0.001'}</span>
                  </code>
                </pre>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
