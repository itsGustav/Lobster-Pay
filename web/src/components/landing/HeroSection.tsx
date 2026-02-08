'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { BlueLobster } from '@/components/BlueLobster';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-darker" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-full bg-[radial-gradient(ellipse_at_center_top,rgba(37,99,235,0.15)_0%,transparent_60%)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[radial-gradient(ellipse_at_center_bottom,rgba(6,182,212,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-grid opacity-40" />
      </div>

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-600/10 blur-[100px]"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-cyan-500/10 blur-[80px]"
        animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-blue-600/20 bg-blue-600/10"
        >
          <BlueLobster size={18} />
          <span className="text-sm font-medium text-blue-400">OpenClaw Skill</span>
          <span className="text-gray-600 mx-1">•</span>
          <span className="text-sm text-blue-400 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 111 111" fill="none">
              <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF"/>
              <path d="M55.5 95C77.315 95 95 77.315 95 55.5C95 33.685 77.315 16 55.5 16C34.5 16 17.3 32.5 16.1 53.2H67.5V57.8H16.1C17.3 78.5 34.5 95 55.5 95Z" fill="white"/>
            </svg>
            Built on Base
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[clamp(2rem,8vw,4.5rem)] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
        >
          The Payment Layer for{' '}
          <br className="hidden sm:block" />
          <span className="text-gradient">Autonomous Agents</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed px-2"
        >
          Your OpenClaw bot accepts tips, donations, and payments — right in chat.
          One skill install. Real USDC on Base. Sub-cent fees.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
        >
          <Link href="/signup">
            <Button variant="glow" size="lg" className="w-full sm:w-auto min-w-[200px]">
              Get Started Free →
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto min-w-[200px]">
              See How It Works ↓
            </Button>
          </Link>
        </motion.div>

        {/* Sign in link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="text-gray-500 text-sm"
        >
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Log In →
          </Link>
        </motion.p>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="flex flex-wrap justify-center items-center gap-6 mt-16 pt-8 border-t border-white/5"
        >
          <span className="text-xs text-gray-600 uppercase tracking-widest">Built on trusted infrastructure</span>
          <div className="flex items-center gap-8 text-gray-500">
            <span className="flex items-center gap-2 text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 111 111" fill="none"><circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF"/><path d="M55.5 95C77.315 95 95 77.315 95 55.5C95 33.685 77.315 16 55.5 16C34.5 16 17.3 32.5 16.1 53.2H67.5V57.8H16.1C17.3 78.5 34.5 95 55.5 95Z" fill="white"/></svg>
              Base
            </span>
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="text-blue-400">●</span> Circle USDC
            </span>
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="text-emerald-400">●</span> ERC-8004
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
