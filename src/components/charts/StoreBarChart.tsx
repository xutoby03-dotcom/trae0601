import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { StoreStats } from '@/types';

interface Props {
  data: StoreStats[];
}

export default function StoreBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="storeName"
          tick={{ fontSize: 12, fill: '#64748B' }}
          tickFormatter={(v) => v.replace(/店$/, '')}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: '#F1F5F9' }}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 20px -10px rgba(15,23,42,0.2)',
            fontSize: 13,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
        />
        <Bar dataKey="available" name="可借" fill="#0F766E" radius={[6, 6, 0, 0]} />
        <Bar dataKey="lent" name="借出" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
        <Bar dataKey="damaged" name="破损" fill="#F97316" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
