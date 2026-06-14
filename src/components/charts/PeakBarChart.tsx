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
import type { DailyPeakItem } from '@/types';
import { useMemo } from 'react';

interface Props {
  data: DailyPeakItem[];
}

export default function PeakBarChart({ data }: Props) {
  const merged = useMemo(() => {
    const map = new Map<string, { hour: string; rainy: number; normal: number }>();
    for (let h = 6; h <= 22; h++) {
      const key = h.toString().padStart(2, '0') + ':00';
      map.set(key, { hour: key, rainy: 0, normal: 0 });
    }
    data.forEach((d) => {
      const row = map.get(d.hour);
      if (!row) return;
      if (d.isRainyDay) row.rainy = d.count;
      else row.normal = d.count;
    });
    return Array.from(map.values());
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={merged} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 12, fill: '#64748B' }}
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
          contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
        <Bar dataKey="rainy" name="雨天借伞" fill="#0F766E" radius={[6, 6, 0, 0]} />
        <Bar dataKey="normal" name="平日借伞" fill="#94A3B8" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
