import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: 'primary' | 'emerald' | 'amber' | 'rose' | 'sky';
  children?: ReactNode;
}

const colorMap = {
  primary: 'bg-primary-500/10 text-primary-500',
  emerald: 'bg-emerald-500/10 text-emerald-600',
  amber: 'bg-amber-500/10 text-amber-600',
  rose: 'bg-rose-500/10 text-rose-600',
  sky: 'bg-sky-500/10 text-sky-600',
};

export default function StatCard({ title, value, icon: Icon, trend, color = 'primary', children }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5.5 h-5.5" strokeWidth={2} />
        </div>
      </div>
      {children}
    </div>
  );
}
