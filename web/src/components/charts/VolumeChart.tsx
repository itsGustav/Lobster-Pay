'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface VolumeDataPoint {
  date: string;
  count: number;
  amount: number;
}

interface VolumeChartProps {
  data: VolumeDataPoint[];
  className?: string;
  metric?: 'count' | 'amount';
}

export function VolumeChart({ data, className, metric = 'count' }: VolumeChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;
    
    const point = payload[0].payload;
    
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-sm text-gray-400">{new Date(point.date).toLocaleDateString()}</p>
        <div className="space-y-1 mt-2">
          <p className="text-lg font-bold text-white">
            {metric === 'count' 
              ? `${point.count} transaction${point.count !== 1 ? 's' : ''}`
              : `$${point.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
          </p>
          {metric === 'count' && point.amount > 0 && (
            <p className="text-xs text-gray-500">
              ${point.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
            </p>
          )}
          {metric === 'amount' && point.count > 0 && (
            <p className="text-xs text-gray-500">
              {point.count} transaction{point.count !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Format data for display
  const chartData = data.map((point) => ({
    ...point,
    displayDate: new Date(point.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
  }));

  if (chartData.length === 0) {
    return (
      <div className={`h-80 flex items-center justify-center text-gray-500 ${className || ''}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>No transaction history yet</p>
          <p className="text-sm mt-1">Start transacting to see your volume</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="displayDate"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey={metric}
            fill="#F97316"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
