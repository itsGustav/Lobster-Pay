'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from './FadeIn';
import { BlueLobster } from '@/components/BlueLobster';
import { cn } from '@/lib/utils';

const messages = [
  { id: 1, type: 'user', text: 'paylobster balance', delay: 0.5 },
  { id: 2, type: 'bot', text: '🦞 42.50 USDC', subtext: 'Base Mainnet • 0xf775...8b7B', delay: 1.2 },
  { id: 3, type: 'user', text: 'paylobster tip $5 @Gustav', delay: 2.0 },
  { id: 4, type: 'bot', text: '🦞 Sent $5 USDC to @Gustav!', subtext: 'tx: 0x7f3a...8c2d', delay: 2.7 },
  { id: 5, type: 'user', text: 'paylobster tip $10 @paylobster', delay: 3.5 },
  { id: 6, type: 'bot', text: '🦞 Donation received!', subtext: 'Thank you for supporting Pay Lobster!', delay: 4.2 },
];

export function ChatDemo() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const handleReplay = () => {
    setIsPlaying(false);
    setTimeout(() => {
      setResetKey((k) => k + 1);
      setIsPlaying(true);
    }, 100);
  };

  return (
    <section className="relative py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-4">
            SEE IT IN ACTION
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Chat with your wallet
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Natural language commands. Real USDC. Instant execution.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="max-w-md mx-auto">
            {/* Phone frame */}
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm p-4 shadow-2xl">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-2xl bg-[rgba(15,23,42,0.7)] border border-white/5">
                <BlueLobster size={32} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Pay Lobster</span>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/20">
                      Telegram
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-emerald-400">●</span>
                    <span className="text-xs text-gray-400">Online on Base</span>
                  </div>
                </div>
              </div>

              {/* Chat messages */}
              <div key={resetKey} className="space-y-3 px-2 py-4 min-h-[380px]">
                <AnimatePresence>
                  {isPlaying &&
                    messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: msg.delay + 0.5, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        className={cn('flex', msg.type === 'user' ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[75%] rounded-2xl px-4 py-2.5',
                            msg.type === 'user'
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                              : 'bg-[rgba(30,41,59,0.8)] border border-white/5 text-gray-100 rounded-bl-md'
                          )}
                        >
                          <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                          {msg.subtext && (
                            <p className="text-xs text-gray-300 mt-1.5 opacity-80">{msg.subtext}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>

              {/* Input bar */}
              <div className="mt-4 px-4 py-3 rounded-2xl bg-[rgba(15,23,42,0.7)] border border-white/5 flex items-center gap-3">
                <span className="text-sm text-gray-500 flex-1">Type a command...</span>
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
            </div>

            {/* Replay button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleReplay}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 text-sm font-medium text-gray-300 hover:text-white transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Replay
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
