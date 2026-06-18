import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  className?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconColor = 'text-blue-600',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
          {trend && (
            <p
              className={cn(
                'text-xs font-medium mt-2 flex items-center gap-1',
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
              <span className="text-gray-400 font-normal ml-1">较上周</span>
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg bg-gray-50', iconColor.replace('text-', 'bg-').replace('600', '50'))}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
      </div>
    </div>
  );
}
