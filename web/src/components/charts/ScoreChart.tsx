'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ScoreDataPoint {
  date: string;
  score: number;
  change: number;
  reason?: string;
}

interface ScoreChartProps {
  data: ScoreDataPoint[];
  className?: string;
}

export function ScoreChart({ data, className }: ScoreChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;
    
    const point = payload[0].payload;
    const change = point.change;
    
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-sm text-gray-400">{new Date(point.date).toLocaleDateString()}</p>
        <p className="text-lg font-bold text-white">{point.score}</p>
        {change !== 0 && (
          <p className={`text-xs font-medium ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)} points
          </p>
        )}
        {point.reason && (
          <p className="text-xs text-gray-500 mt-1">{point.reason}</p>
        )}
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
          <div className="text-4xl mb-2">📊</div>
          <p>No score history yet</p>
          <p className="text-sm mt-1">Complete transactions to build your score</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="displayDate"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis
            domain={[0, 850]}
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: '#10B981', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
