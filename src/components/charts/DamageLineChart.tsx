import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DamageRateItem } from '@/types';

interface Props {
  data: DamageRateItem[];
}

export default function DamageLineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="dmgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F97316" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#64748B' }}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 'auto']}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            fontSize: 13,
          }}
          formatter={(v: number) => [`${v}%`, '破损率']}
        />
        <Line
          type="monotone"
          dataKey="rate"
          name="破损率"
          stroke="#F97316"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#fff', stroke: '#F97316', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
          fill="url(#dmgGrad)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
