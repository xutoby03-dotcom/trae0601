import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface DataCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'red';
  trend?: number;
  className?: string;
}

const colorStyles: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
};

const iconBgStyles: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
};

export const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 tabular-nums">
              {value}
            </span>
            {trend !== undefined && (
              <span
                className={cn(
                  'text-sm font-medium',
                  trend >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            'p-3 rounded-xl',
            iconBgStyles[color],
            'transition-transform duration-300 group-hover:scale-110'
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div
        className={cn(
          'mt-4 h-1 rounded-full bg-gradient-to-r',
          colorStyles[color]
        )}
      />
    </div>
  );
};
