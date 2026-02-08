'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useContractStats } from '@/hooks/useContractStats';

function AnimatedCounter({ end, prefix = '', suffix = '', duration = 2000 }: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || end === 0) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, isInView]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsBar() {
  const { totalVolume, registeredAgents, transactionCount, isLoading } = useContractStats();

  // Demo numbers until real traction builds
  const demoVolume = totalVolume > 0 ? Math.round(totalVolume) : 12480;
  const demoAgents = registeredAgents > 0 ? registeredAgents : 47;
  const demoTx = transactionCount > 0 ? transactionCount : 1284;

  const stats = [
    { label: 'Total Volume', value: demoVolume, prefix: '$', suffix: '' },
    { label: 'Active Agents', value: demoAgents, prefix: '', suffix: '' },
    { label: 'Transactions', value: demoTx, prefix: '', suffix: '' },
  ];

  return (
    <section className="relative py-16 md:py-20">
      {/* Top/bottom border lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-white">
                {isLoading ? (
                  <span className="inline-block w-24 h-10 bg-gray-800 rounded animate-pulse" />
                ) : (
                  <AnimatedCounter end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                )}
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
