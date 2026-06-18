import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from 'recharts';

import type { HourlyData, CourierDelayData } from '@/types';
import { cn } from '@/utils';

interface HourlyProps {
  data: HourlyData[];
}

export function HourlyTrendChart({ data }: HourlyProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="storedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="pickedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            tickFormatter={(h) => `${h}时`}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => [
              `${value} 件`, name === 'stored' ? '入架' : '取件']}
            labelFormatter={(l) => `${l}时`}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            formatter={(v) => (v === 'stored' ? '入架数量' : '取件数量')}
          />
          <Bar dataKey="stored" fill="url(#storedGrad)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="picked" fill="url(#pickedGrad)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CourierProps {
  data: CourierDelayData[];
}

export function CourierDelayChart({ data }: CourierProps) {
  const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#2dd4bf', '#60a5fa', '#c084fc', '#f472b6'];

  if (data.length === 0) {
    return <div className="h-56 flex items-center justify-center text-sm text-slate-400">暂无数据</div>;
  }

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 'auto']}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={72}
            tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            formatter={(value: number, name: string) => {
              if (name === 'rate') return [`${value}%`, '滞留率'];
              return [value, name === 'delayed' ? '滞留件数' : '总件数'];
            }}
          />
          <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={16}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface Stats {
  label: string;
  value: number | string;
  delta?: number;
  deltaLabel?: string;
  gradient: string;
  iconBg: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}

export function StatsCard({ stat, className }: { stat: Stats; className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 text-white shadow-lg',
        stat.gradient,
        className,
      )}
    >
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -right-10 bottom-0 w-36 h-36 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-medium opacity-90">{stat.label}</div>
            <div className="mt-2 text-3xl font-extrabold tracking-tight">{stat.value}</div>
            {typeof stat.delta === 'number' && (
              <div className="mt-2 flex items-center gap-1 text-xs opacity-90">
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/20 font-semibold',
                    stat.trend === 'down' && 'rotate-180',
                  )}
                >
                  ↑
                </span>
                <span>{stat.delta}%</span>
                {stat.deltaLabel && <span>{stat.deltaLabel}</span>}
              </div>
            )}
          </div>
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', stat.iconBg)}>
            {stat.icon}
          </div>
        </div>
      </div>
    </div>
  );
}
