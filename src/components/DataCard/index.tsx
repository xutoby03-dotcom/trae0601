import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'slate';
  className?: string;
}

const colorMap = {
  primary: 'from-primary-500 to-primary-600',
  success: 'from-success-500 to-success-600',
  warning: 'from-warning-500 to-warning-600',
  danger: 'from-danger-500 to-danger-600',
  slate: 'from-slate-500 to-slate-600',
};

export default function DataCard({
  title,
  value,
  icon,
  description,
  trend,
  color = 'primary',
  className,
}: DataCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
          {trend && (
            <p
              className={cn(
                'mt-2 text-xs font-medium flex items-center gap-1',
                trend.isPositive ? 'text-success-600' : 'text-danger-600'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              {trend.value}%
              <span className="text-slate-400 font-normal ml-1">较上月</span>
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'p-3 rounded-xl bg-gradient-to-br text-white shadow-md',
              colorMap[color]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
