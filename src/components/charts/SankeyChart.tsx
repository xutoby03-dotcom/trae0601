import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface SankeyChartProps {
  data: { source: string; target: string; value: number }[];
  height?: number;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const SankeyChartComponent: React.FC<SankeyChartProps> = ({
  data,
  height = 300,
}) => {
  const chartData = data.reduce((acc, item) => {
    const existing = acc.find(d => d.name === item.target);
    if (existing) {
      existing.value += item.value;
    } else {
      acc.push({ name: item.target, value: item.value, source: item.source });
    }
    return acc;
  }, [] as { name: string; value: number; source: string }[]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          unit=" kg"
        />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: number, _name, props) => [
            `${value} kg`,
            props.payload.source,
          ]}
        />
        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
          {chartData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
