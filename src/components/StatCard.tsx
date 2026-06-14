import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export const StatCard = ({
  label,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
  trend,
  delay = 0,
}: StatCardProps) => {
  return (
    <div
      className="card-base p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-warm-500 font-medium">{label}</p>
          <p className="font-display text-3xl font-bold text-warm-900 mt-2 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-warm-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                'inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full',
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-red-50 text-red-600'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              {trend.value}%
              <span className="text-warm-400 ml-1 font-normal">较上月</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            iconBg,
            iconColor
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};
