import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  gradient?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  gradient = 'from-primary-500 to-primary-700',
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white shadow-card p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 animate-fade-in',
        className
      )}
    >
      <div
        className={cn(
          'absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 bg-gradient-to-br',
          gradient
        )}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500 font-medium">{title}</span>
          <div
            className={cn(
              'p-3 rounded-xl bg-gradient-to-br text-white',
              gradient
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-slate-800 font-display">{value}</p>
            {trend && (
              <p
                className={cn(
                  'text-sm mt-1 flex items-center gap-1',
                  trendUp ? 'text-emerald-600' : 'text-amber-600'
                )}
              >
                {trendUp ? '↑' : '↓'} {trend}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
