import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'teal' | 'blue' | 'amber' | 'red' | 'purple';
  subtitle?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  onClick?: () => void;
  className?: string;
}

const colorConfig = {
  teal: {
    bg: 'bg-teal-50',
    iconBg: 'bg-teal-100',
    icon: 'text-teal-600',
    value: 'text-teal-700',
    border: 'border-teal-100',
    hover: 'hover:border-teal-200',
  },
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    icon: 'text-blue-600',
    value: 'text-blue-700',
    border: 'border-blue-100',
    hover: 'hover:border-blue-200',
  },
  amber: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    icon: 'text-amber-600',
    value: 'text-amber-700',
    border: 'border-amber-100',
    hover: 'hover:border-amber-200',
  },
  red: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    icon: 'text-red-600',
    value: 'text-red-700',
    border: 'border-red-100',
    hover: 'hover:border-red-200',
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    icon: 'text-purple-600',
    value: 'text-purple-700',
    border: 'border-purple-100',
    hover: 'hover:border-purple-200',
  },
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'teal',
  subtitle,
  trend,
  trendValue,
  onClick,
  className,
}: StatCardProps) => {
  const config = colorConfig[color];

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border p-5 transition-all duration-300 cursor-pointer',
        'hover:shadow-lg hover:-translate-y-0.5',
        config.border,
        config.hover,
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={cn('text-3xl font-bold mt-2', config.value)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                'text-xs font-medium',
                trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </span>
            <span className="text-xs text-slate-400">较上周</span>
          </div>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            config.iconBg
          )}
        >
          <Icon className={cn('w-6 h-6', config.icon)} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
