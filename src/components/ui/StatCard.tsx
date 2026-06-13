import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  onClick,
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
  };

  const bgColorClasses = {
    blue: 'bg-blue-500/10',
    green: 'bg-emerald-500/10',
    orange: 'bg-orange-500/10',
    purple: 'bg-purple-500/10',
    red: 'bg-red-500/10',
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-emerald-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500',
    red: 'text-red-500',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer',
        onClick && 'hover:scale-[1.02]'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 font-mono">
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-success-500' : 'text-danger-500'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-400 ml-2">较上周</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-xl',
            bgColorClasses[color]
          )}
        >
          <div className={cn('w-6 h-6', iconColorClasses[color])}>
            {icon}
          </div>
        </div>
      </div>
      <div
        className={cn(
          'mt-4 h-1 rounded-full bg-gradient-to-r',
          colorClasses[color]
        )}
      />
    </div>
  );
};
