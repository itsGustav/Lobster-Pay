'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from './FadeIn';
import { cn } from '@/lib/utils';

const actions = [
  { id: 'send', icon: '💸', label: 'Send USDC', demo: 'Sent $25 USDC to 0x7a3f...2d1e', balanceChange: -25, color: 'from-blue-500 to-blue-600', statusIcon: '↗', statusColor: 'text-blue-400' },
  { id: 'receive', icon: '📥', label: 'Receive', demo: 'Received $100 USDC from 0xb92c...4f8a', balanceChange: 100, color: 'from-emerald-500 to-green-600', statusIcon: '↙', statusColor: 'text-emerald-400' },
  { id: 'escrow', icon: '🔒', label: 'Escrow', demo: 'Escrow ESC-0x3d created — $50 held', balanceChange: -50, color: 'from-amber-500 to-orange-600', statusIcon: '🔐', statusColor: 'text-amber-400' },
  { id: 'verify', icon: '✅', label: 'Verify', demo: 'Agent score: 782 / 850 — Verified', balanceChange: 0, color: 'from-green-500 to-emerald-600', statusIcon: '✓', statusColor: 'text-green-400' },
  { id: 'tip', icon: '💜', label: 'Tip', demo: 'Tipped $5 USDC to @Gustav', balanceChange: -5, color: 'from-purple-500 to-violet-600', statusIcon: '♥', statusColor: 'text-purple-400' },
  { id: 'hire', icon: '🤖', label: 'Hire Agent', demo: 'CodeReviewBot hired — $8 via escrow', balanceChange: -8, color: 'from-cyan-500 to-blue-600', statusIcon: '⚡', statusColor: 'text-cyan-400' },
];

export function InteractiveDemo() {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [balance, setBalance] = useState(1000);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; action: string }[]>([]);
  const [txHash, setTxHash] = useState('');

  const handleAction = (action: typeof actions[0]) => {
    setActiveAction(action.id);
    setBalance((b) => b + action.balanceChange);
    setTxHash(`0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`);

    // Spawn particles
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 200,
      y: -(Math.random() * 120 + 40),
      action: action.id,
    }));
    setParticles(newParticles);

    setTimeout(() => {
      setActiveAction(null);
      setParticles([]);
    }, 2500);
  };

  const currentAction = actions.find((a) => a.id === activeAction);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-cyan-500/5 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-4">
            Interactive Demo
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Try it yourself
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Click any action below to see Pay Lobster in action.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="max-w-sm mx-auto mb-10">
            {/* Phone frame */}
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm p-8 shadow-2xl overflow-hidden">
              {/* Background pulse on action */}
              <AnimatePresence>
                {activeAction && currentAction && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 3, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn('absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-r', currentAction.color)}
                  />
                )}
              </AnimatePresence>

              {/* Particles */}
              <AnimatePresence>
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ x: '50%', y: '40%', opacity: 1, scale: 1 }}
                    animate={{ x: `calc(50% + ${p.x}px)`, y: `calc(40% + ${p.y}px)`, opacity: 0, scale: 0 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute text-sm pointer-events-none"
                  >
                    {currentAction?.statusIcon}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Notch */}
              <div className="relative flex justify-center mb-6">
                <div className="w-24 h-1.5 rounded-full bg-white/10" />
              </div>

              {/* Balance */}
              <div className="relative text-center mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  USDC Balance
                </p>
                <div className="relative inline-block">
                  <motion.p
                    key={balance}
                    initial={{ scale: 1.08, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="text-5xl font-bold text-white tabular-nums"
                  >
                    {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </motion.p>
                  {/* Balance change indicator */}
                  <AnimatePresence>
                    {activeAction && currentAction && currentAction.balanceChange !== 0 && (
                      <motion.span
                        initial={{ opacity: 0, y: 0, x: 10 }}
                        animate={{ opacity: 1, y: -20, x: 10 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.8 }}
                        className={cn('absolute -right-16 top-2 text-lg font-bold', currentAction.statusColor)}
                      >
                        {currentAction.balanceChange > 0 ? '+' : ''}{currentAction.balanceChange}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Status area */}
              <div className="relative h-28 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {activeAction && currentAction ? (
                    <motion.div
                      key={activeAction}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="text-center px-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.3, 1] }}
                        transition={{ duration: 0.4, times: [0, 0.6, 1] }}
                        className={cn('text-3xl mb-3', currentAction.statusColor)}
                      >
                        {currentAction.statusIcon}
                      </motion.div>
                      <p className={cn('text-sm font-semibold mb-1', currentAction.statusColor)}>
                        {currentAction.demo}
                      </p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xs text-gray-600 font-mono"
                      >
                        tx: {txHash}
                      </motion.p>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-gray-600"
                    >
                      Click a button below
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Live badge */}
              <div className="relative flex justify-center mt-2">
                <motion.div
                  animate={activeAction ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                >
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  />
                  <span className="text-xs font-medium text-emerald-400">Live on Base</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="relative z-10 grid grid-cols-3 md:grid-cols-6 gap-3 max-w-3xl mx-auto">
            {actions.map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleAction(action)}
                className={cn(
                  'group relative rounded-xl px-3 py-4 border transition-colors duration-200',
                  'bg-[rgba(15,23,42,0.5)] backdrop-blur-sm',
                  activeAction === action.id
                    ? 'border-blue-500/50 bg-blue-600/10'
                    : 'border-white/[0.06] hover:border-blue-500/30'
                )}
              >
                {/* Active glow */}
                <AnimatePresence>
                  {activeAction === action.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn('absolute inset-0 rounded-xl bg-gradient-to-b opacity-20', action.color)}
                    />
                  )}
                </AnimatePresence>
                <div className="relative flex flex-col items-center gap-2">
                  <motion.span
                    animate={activeAction === action.id ? { rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className="text-xl leading-none"
                  >
                    {action.icon}
                  </motion.span>
                  <span className="text-[11px] font-medium text-gray-400 group-hover:text-white transition-colors whitespace-nowrap">
                    {action.label}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
