import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { BlindTest } from '@/types';
import { getScoreBySampleId, CHART_COLORS, calculateAverageScore } from '@/utils/helpers';

interface BarChartProps {
  blindTest: BlindTest;
}

export function BarChart({ blindTest }: BarChartProps) {
  const data = blindTest.waterSamples.map((sample, index) => {
    const score = getScoreBySampleId(blindTest, sample.id);
    return {
      name: `水样 ${sample.blindCode}`,
      综合评分: score ? calculateAverageScore(score) : 0,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
  }).sort((a, b) => b.综合评分 - a.综合评分);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFEBE9" />
          <XAxis
            dataKey="name"
            tick={{
              fill: '#5D4037',
              fontSize: 12,
              fontWeight: 600,
            }}
            axisLine={{ stroke: '#BCAAA4' }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: '#8D6E63', fontSize: 12 }}
            axisLine={{ stroke: '#BCAAA4' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFF8E1',
              border: '1px solid #D7CCC8',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(62, 39, 35, 0.1)',
            }}
            itemStyle={{ color: '#3E2723' }}
            formatter={(value: number) => [value.toFixed(1), '综合评分']}
          />
          <Bar dataKey="综合评分" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
