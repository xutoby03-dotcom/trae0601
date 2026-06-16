import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getProblemTypeDistribution } from '@/utils/statistics';
import { ProblemType, ProblemTypeLabel } from '@/types';
import { getProblemTypeColor } from '@/utils/format';

interface ProblemPieChartProps {
  sampleId?: string;
  title?: string;
}

const COLORS: Record<ProblemType, string> = {
  pattern: '#4A6B57',
  fabric: '#B89F6B',
  workmanship: '#D47950',
  comfort: '#C75B39',
};

export default function ProblemPieChart({ sampleId, title }: ProblemPieChartProps) {
  const distribution = useMemo(() => getProblemTypeDistribution(sampleId), [sampleId]);

  const data = useMemo(() => {
    return (Object.keys(distribution) as ProblemType[]).map((type) => ({
      name: ProblemTypeLabel[type],
      value: distribution[type],
      type,
    }));
  }, [distribution]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { type: ProblemType } }[] }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-card border border-cream-100">
          <p className="text-sm font-medium text-charcoal-700">{item.name}</p>
          <p className="text-lg font-semibold text-charcoal-800 mt-1">
            {item.value} <span className="text-sm font-normal text-charcoal-400">({percentage}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLegend = ({ payload }: { payload?: { value: string; color: string }[] }) => {
    if (!payload) return null;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-charcoal-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (total === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-charcoal-400 text-sm">
        暂无问题数据
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-base font-semibold text-charcoal-800 mb-4 font-display">{title}</h3>}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.type]} />
              ))}
            </Pie>
            <Tooltip content={renderCustomTooltip} />
            <Legend content={renderCustomLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
