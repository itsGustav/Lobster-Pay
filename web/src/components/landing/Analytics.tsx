'use client';

import { FadeIn } from './FadeIn';

const analyticsFeatures = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Spending Analytics',
    description: 'Track spending by category, monitor daily/weekly/monthly trends, and identify top recipients.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'Volume Monitoring',
    description: 'Real-time transaction volume charts, chain distribution breakdown, and trend visualization.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Export & Reporting',
    description: 'CSV export for accounting, transaction receipts, and detailed audit trails for compliance.',
  },
];

export function Analytics() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-900/50" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Mock dashboard */}
          <FadeIn direction="left">
            <div className="rounded-2xl border border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-sm overflow-hidden">
              {/* Dashboard header */}
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Transaction Analytics</span>
                <span className="text-xs text-gray-500 font-mono">Last 30 days</span>
              </div>

              <div className="p-6 space-y-6">
                {/* Mini stats row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {[
                    { label: 'Volume', value: '$4,280', change: '+12%' },
                    { label: 'Txns', value: '147', change: '+8%' },
                    { label: 'Agents', value: '23', change: '+3' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center min-w-0">
                      <div className="text-base sm:text-lg font-bold text-white truncate">{stat.value}</div>
                      <div className="text-[10px] sm:text-[11px] text-gray-500 truncate">{stat.label}</div>
                      <div className="text-[10px] sm:text-[11px] text-emerald-400 font-medium">{stat.change}</div>
                    </div>
                  ))}
                </div>

                {/* Mock chart bars */}
                <div className="flex items-end gap-1.5 h-24">
                  {[35, 50, 25, 65, 45, 80, 55, 70, 40, 90, 60, 75, 50, 85].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-600/40 to-blue-600/80 transition-all duration-300 hover:from-blue-500/50 hover:to-blue-500/90"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>

                {/* Category breakdown */}
                <div className="space-y-3">
                  {[
                    { name: 'API Payments', amount: '$2,140', pct: 50, color: 'bg-blue-500' },
                    { name: 'Escrow', amount: '$1,284', pct: 30, color: 'bg-cyan-500' },
                    { name: 'Tips', amount: '$856', pct: 20, color: 'bg-emerald-500' },
                  ].map((cat) => (
                    <div key={cat.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{cat.name}</span>
                        <span className="text-gray-300 font-medium">{cat.amount}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right: Features */}
          <FadeIn direction="right" delay={0.15}>
            <span className="inline-block text-xs font-semibold text-blue-400 uppercase tracking-[0.15em] mb-4">
              Insights
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
              Analytics & Reporting
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-10">
              Full visibility into your agent&apos;s financial activity. Track spending, monitor volume, and export for accounting.
            </p>

            <div className="space-y-6">
              {analyticsFeatures.map((feature) => (
                <div key={feature.title} className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
