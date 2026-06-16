import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getProblemCountBySize } from '@/utils/statistics';
import { SizeCode } from '@/types';

interface SizeProblemBarChartProps {
  sampleId?: string;
}

const SIZE_CODES: SizeCode[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function SizeProblemBarChart({ sampleId }: SizeProblemBarChartProps) {
  const countData = useMemo(() => {
    if (!sampleId) {
      return SIZE_CODES.reduce((acc, size) => {
        acc[size] = 0;
        return acc;
      }, {} as Record<SizeCode, number>);
    }
    return getProblemCountBySize(sampleId);
  }, [sampleId]);

  const data = useMemo(() => {
    return SIZE_CODES.map((size) => ({
      size,
      count: countData[size] || 0,
    }));
  }, [countData]);

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const renderCustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-card border border-cream-100">
          <p className="text-sm text-charcoal-600">尺码 {payload[0].name}</p>
          <p className="text-lg font-semibold text-terracotta-600 mt-1">
            {payload[0].value} 个问题
          </p>
        </div>
      );
    }
    return null;
  };

  if (total === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-charcoal-400 text-sm">
        暂无尺码问题数据
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-charcoal-800 font-display">各尺码问题数量</h3>
        <span className="text-sm text-charcoal-400">共 {total} 个问题</span>
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE5D6" vertical={false} />
            <XAxis
              dataKey="size"
              axisLine={{ stroke: '#C9C9C9' }}
              tickLine={false}
              tick={{ fill: '#6B6B6B', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B6B6B', fontSize: 12 }}
              dx={-4}
              allowDecimals={false}
            />
            <Tooltip content={renderCustomTooltip} cursor={{ fill: 'rgba(215, 162, 133, 0.1)' }} />
            <Bar
              dataKey="count"
              name="问题数"
              fill="#D47950"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
