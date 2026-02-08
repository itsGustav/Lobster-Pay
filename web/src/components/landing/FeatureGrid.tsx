'use client';

import { FadeIn, StaggerContainer, StaggerItem } from './FadeIn';

const features = [
  {
    icon: '💳',
    title: 'Core Payments',
    items: [
      'Send USDC to any address',
      'Receive with generated addresses',
      'Multi-chain support (5+ networks)',
      'Cross-chain bridges via CCTP',
      'Real-time balance tracking',
      'Transaction history',
    ],
  },
  {
    icon: '⚡',
    title: 'x402 Protocol',
    items: [
      'HTTP-native micropayments',
      'Auto-pay on 402 response',
      'Payment receipt verification',
      'Max payment limits',
      'Retry with proof of payment',
      'Server middleware included',
    ],
  },
  {
    icon: '🛡️',
    title: 'ERC-8004 Trust',
    items: [
      'On-chain agent identity',
      'NFT-based registration',
      'Reputation scoring',
      'Feedback after transactions',
      'Trust-based payment limits',
      'Agent discovery service',
    ],
  },
  {
    icon: '🔒',
    title: 'Escrow Service',
    items: [
      'Freelance milestone payments',
      'Real estate earnest money',
      'E-commerce buyer protection',
      'P2P trade escrow',
      'Multi-party approval',
      'Condition-based release',
      'Custom condition builder',
    ],
  },
  {
    icon: '📄',
    title: 'Invoicing',
    items: [
      'Professional invoice creation',
      'Line items with tax',
      'Payment link generation',
      'Status tracking (sent/viewed/paid)',
    ],
  },
  {
    icon: '👥',
    title: 'Address Book',
    items: [
      'Save contacts with names',
      'Multi-chain addresses per contact',
      'Tags and search',
      'Send by name ("pay Alice")',
    ],
  },
  {
    icon: '✅',
    title: 'Approvals',
    items: [
      'Multi-approver policies',
      'Amount-based triggers',
      'Daily spending limits',
      'Approval/rejection workflow',
    ],
  },
  {
    icon: '🔔',
    title: 'Notifications',
    items: [
      'Real-time payment alerts',
      'Webhook delivery',
      'HMAC signature verification',
      'Configurable thresholds',
    ],
  },
  {
    icon: '📊',
    title: 'Analytics',
    items: [
      'Daily/weekly/monthly summaries',
      'Category breakdown',
      'Top recipients analysis',
      'Chain distribution',
      'CSV export',
      'Trend visualization',
    ],
  },
  {
    icon: '💰',
    title: 'Tip Jar',
    items: [
      'Create tip jars',
      'Leaderboards (top tippers)',
      'Real-time notifications',
      'Agent-to-agent tips',
      'Custom tip amounts',
      'Thank you messages',
    ],
  },
  {
    icon: '💎',
    title: 'Commission',
    items: [
      'Platform fee collection',
      'Percentage-based splits',
      'Automatic deduction',
      'Commission reporting',
      'Multi-party splits',
      'Configurable rates',
    ],
  },
  {
    icon: '🛠️',
    title: 'Developer Experience',
    items: [
      'TypeScript native',
      'One-liner setup',
      'CLI included',
      'Full documentation',
      'Example code',
      'MIT licensed',
    ],
  },
];

export function FeatureGrid() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-4">
            COMPLETE FEATURE SET
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Everything included
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            A comprehensive toolkit for agent-to-agent commerce.
          </p>
        </FadeIn>

        {/* Feature cards grid */}
        <StaggerContainer
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          staggerDelay={0.08}
        >
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="group relative rounded-xl p-6 border border-gray-800 bg-[rgba(15,23,42,0.5)] backdrop-blur-sm transition-all duration-300 hover:border-gray-700 hover:-translate-y-1 hover:shadow-glass h-full">
                {/* Icon and title */}
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white pt-1.5">{feature.title}</h3>
                </div>

                {/* Feature list */}
                <ul className="space-y-2.5">
                  {feature.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm text-gray-400 leading-relaxed">
                      <svg
                        className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom CTA */}
        <FadeIn delay={0.5}>
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-6">
              And that&apos;s just the beginning. New features ship weekly.
            </p>
            <a
              href="/docs"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors group"
            >
              View full documentation
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
