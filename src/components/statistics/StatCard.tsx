import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export type StatCardVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

export interface StatCardProps {
  icon: ReactNode;
  value: number | string;
  title: string;
  trend?: number;
  trendLabel?: string;
  variant?: StatCardVariant;
  className?: string;
}

const variantStyles: Record<StatCardVariant, { bg: string; text: string; border: string; iconBg: string }> = {
  primary: {
    bg: 'bg-primary-50',
    text: 'text-primary-600',
    border: 'border-primary-100',
    iconBg: 'bg-primary-500',
  },
  secondary: {
    bg: 'bg-secondary-50',
    text: 'text-secondary-600',
    border: 'border-secondary-100',
    iconBg: 'bg-secondary-500',
  },
  success: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-100',
    iconBg: 'bg-success',
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-100',
    iconBg: 'bg-warning',
  },
  danger: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-100',
    iconBg: 'bg-danger',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
    iconBg: 'bg-info',
  },
};

export function StatCard({
  icon,
  value,
  title,
  trend,
  trendLabel,
  variant = 'primary',
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md',
        styles.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className={cn('h-4 w-4', styles.text)} />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositive ? styles.text : 'text-red-500'
                )}
              >
                {isPositive ? '+' : ''}{trend}%
              </span>
              {trendLabel && (
                <span className="text-sm text-gray-400">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl text-white',
            styles.iconBg
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
