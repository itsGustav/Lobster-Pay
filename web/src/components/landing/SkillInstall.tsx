'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from './FadeIn';

interface Step {
  type: 'command' | 'output';
  text: string;
  delay: number;
}

const steps: Step[] = [
  { type: 'command', text: '$ clawhub install pay-lobster', delay: 0 },
  { type: 'output', text: '📦 Downloading pay-lobster@3.2.0...', delay: 800 },
  { type: 'output', text: '✓ Skill installed to ./skills/pay-lobster', delay: 1600 },
  { type: 'output', text: '', delay: 2000 },
  { type: 'command', text: '$ paylobster setup', delay: 2400 },
  { type: 'output', text: '🦞 Initializing Pay Lobster...', delay: 3200 },
  { type: 'output', text: '✓ Wallet connected: 0xf775...8b7B', delay: 4000 },
  { type: 'output', text: '✓ Agent identity registered (Token #1)', delay: 4800 },
  { type: 'output', text: '✓ LOBSTER score initialized: 300', delay: 5600 },
  { type: 'output', text: '', delay: 6000 },
  { type: 'output', text: '🎉 You\'re live! Your agent can now accept payments.', delay: 6400 },
  { type: 'output', text: '   Payment link: paylobster.com/pay/your-agent', delay: 7000 },
];

export function SkillInstall() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const startAnimation = () => {
    setVisibleLines(0);
    setIsPlaying(true);
    setHasPlayed(true);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timers = steps.map((step, i) =>
      setTimeout(() => {
        setVisibleLines(i + 1);
        if (i === steps.length - 1) setIsPlaying(false);
      }, step.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [isPlaying]);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/[0.04] to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-4">
            OpenClaw Skill
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            One install. Ready to earn.
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Install the Pay Lobster skill from{' '}
            <a
              href="https://clawhub.ai/skills/pay-lobster"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
            >
              ClawHub
            </a>{' '}
            and your agent starts accepting payments in seconds.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="max-w-3xl mx-auto">
            {/* Terminal window */}
            <div className="rounded-2xl border border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-sm overflow-hidden shadow-2xl shadow-blue-900/10">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-5 py-3 bg-[rgba(15,23,42,0.8)] border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-gray-500 font-mono">Terminal — pay-lobster</span>
                <button
                  onClick={startAnimation}
                  disabled={isPlaying}
                  className="text-xs text-gray-500 hover:text-blue-400 transition-colors disabled:opacity-40 flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Replay
                </button>
              </div>

              {/* Terminal body */}
              <div className="p-6 font-mono text-sm leading-relaxed min-h-[320px]">
                {!hasPlayed ? (
                  <motion.div
                    className="flex flex-col items-center justify-center h-64 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <button
                      onClick={startAnimation}
                      className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-blue-600/10 border border-blue-600/20 hover:bg-blue-600/20 hover:border-blue-600/30 transition-all"
                    >
                      <svg className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span className="text-blue-400 font-medium font-sans">Watch the setup</span>
                    </button>
                    <span className="text-gray-600 text-xs font-sans">Takes ~8 seconds</span>
                  </motion.div>
                ) : (
                  <div className="space-y-1">
                    {steps.slice(0, visibleLines).map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {step.type === 'command' ? (
                          <div className="text-gray-200">
                            <span className="text-blue-400">$</span>{' '}
                            <span className="text-white font-semibold">{step.text.replace('$ ', '')}</span>
                          </div>
                        ) : step.text === '' ? (
                          <div className="h-3" />
                        ) : (
                          <div className={
                            step.text.startsWith('✓') ? 'text-emerald-400' :
                            step.text.startsWith('🎉') || step.text.startsWith('   ') ? 'text-cyan-300' :
                            'text-gray-400'
                          }>
                            {step.text}
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {isPlaying && (
                      <motion.span
                        className="inline-block w-2 h-4 bg-blue-400"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom links */}
            <FadeIn delay={0.3} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <a
                href="https://clawhub.ai/skills/pay-lobster"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-blue-600/30 hover:bg-blue-600/5 transition-all text-sm font-medium text-gray-300 hover:text-white"
              >
                <span className="text-lg">🦞</span>
                View on ClawHub
              </a>
              <a
                href="https://www.npmjs.com/package/pay-lobster"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-blue-600/30 hover:bg-blue-600/5 transition-all text-sm font-medium text-gray-300 hover:text-white"
              >
                <span className="text-lg">📦</span>
                View on npm
              </a>
              <a
                href="https://github.com/itsGustav/PayLobster"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-blue-600/30 hover:bg-blue-600/5 transition-all text-sm font-medium text-gray-300 hover:text-white"
              >
                <span className="text-lg">⭐</span>
                Star on GitHub
              </a>
            </FadeIn>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
