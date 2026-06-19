import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Accent = 'brand' | 'success' | 'warning' | 'danger';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accent?: Accent;
}

const accentMap: Record<Accent, { gradient: string; iconBg: string; iconColor: string }> = {
  brand: {
    gradient: 'from-brand-500 to-brand-600',
    iconBg: 'bg-brand-100',
    iconColor: 'text-brand-600',
  },
  success: {
    gradient: 'from-success-500 to-success-600',
    iconBg: 'bg-success-100',
    iconColor: 'text-success-500',
  },
  warning: {
    gradient: 'from-warning-500 to-warning-600',
    iconBg: 'bg-warning-100',
    iconColor: 'text-warning-500',
  },
  danger: {
    gradient: 'from-danger-500 to-danger-600',
    iconBg: 'bg-danger-100',
    iconColor: 'text-danger-500',
  },
};

export default function StatCard({ title, value, icon: Icon, trend, accent = 'brand' }: StatCardProps) {
  const { gradient, iconBg, iconColor } = accentMap[accent];

  return (
    <div className="card p-5 animate-fade-in-up overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-800 tracking-tight">{value}</p>
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                {trend.value >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-success-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-danger-500" />
                )}
                <span className={cn('text-xs font-medium', trend.value >= 0 ? 'text-success-500' : 'text-danger-500')}>
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-gray-400">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBg)}>
            <Icon className={cn('w-6 h-6', iconColor)} />
          </div>
        </div>
      </div>
    </div>
  );
}
