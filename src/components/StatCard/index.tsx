import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
    label: string;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  suffix?: string;
}

const colorClasses = {
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
  red: 'from-red-500/20 to-red-600/10 border-red-500/30',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
};

const iconColorClasses = {
  blue: 'text-blue-400 bg-blue-500/20',
  green: 'text-emerald-400 bg-emerald-500/20',
  yellow: 'text-yellow-400 bg-yellow-500/20',
  red: 'text-red-400 bg-red-500/20',
  purple: 'text-purple-400 bg-purple-500/20',
};

export default function StatCard({ title, value, icon, trend, color = 'blue', suffix }: StatCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5',
      colorClasses[color]
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 mb-2">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {value}
            </span>
            {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
          </div>
          {trend && (
            <div className={cn(
              'mt-3 flex items-center gap-1 text-sm font-medium',
              trend.isUp ? 'text-emerald-400' : 'text-red-400'
            )}>
              {trend.isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-slate-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl',
          iconColorClasses[color]
        )}>
          {icon}
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
    </div>
  );
}
