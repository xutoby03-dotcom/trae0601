import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: 'cyan' | 'emerald' | 'amber' | 'red' | 'violet';
}

const colorConfig = {
  cyan: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    value: 'text-cyan-700',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    value: 'text-emerald-700',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    value: 'text-amber-700',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    value: 'text-red-700',
  },
  violet: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    value: 'text-violet-700',
  },
};

export function DashboardCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
}: DashboardCardProps) {
  const config = colorConfig[color];

  return (
    <div
      className={cn(
        'rounded-xl border p-6 transition-all hover:shadow-md',
        config.bg,
        config.border
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className={cn('text-3xl font-bold', config.value)}>{value}</p>
          {trend && trendValue && (
            <div
              className={cn(
                'flex items-center gap-1 mt-2 text-sm font-medium',
                trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', config.iconBg)}>
          <Icon className={cn('w-6 h-6', config.iconColor)} />
        </div>
      </div>
    </div>
  );
}
