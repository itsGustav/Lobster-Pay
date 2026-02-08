'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function CTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,transparent_70%)]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[clamp(1.75rem,6vw,3rem)] md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight px-2">
            Ready to build the future?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-10 leading-relaxed px-2">
            Join the agents already transacting on Pay Lobster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link href="/signup">
              <Button variant="glow" size="lg" className="w-full sm:w-auto min-w-[200px]">
                Sign Up Free →
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto min-w-[200px]">
                Read the Docs
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            Or{' '}
            <a href="https://github.com/itsGustav/Pay-Lobster" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
              view on GitHub
            </a>
            {' '}·{' '}
            <a href="https://www.npmjs.com/package/pay-lobster" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
              npm package
            </a>
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative mt-20 pt-8 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <a href="https://github.com/itsGustav/Pay-Lobster" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">GitHub</a>
              <Link href="/docs" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Documentation</Link>
              <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Base</a>
              <a href="https://circle.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Circle</a>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Terms</Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Privacy</Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg width="16" height="16" viewBox="0 0 111 111" fill="none"><circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF"/><path d="M55.5 95C77.315 95 95 77.315 95 55.5C95 33.685 77.315 16 55.5 16C34.5 16 17.3 32.5 16.1 53.2H67.5V57.8H16.1C17.3 78.5 34.5 95 55.5 95Z" fill="white"/></svg>
              Built on Base • Circle USDC Hackathon 2026
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
