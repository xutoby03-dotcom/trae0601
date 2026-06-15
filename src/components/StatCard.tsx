import { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: 'teal' | 'red' | 'amber' | 'orange' | 'blue';
  trend?: 'up' | 'down' | 'neutral';
}

const colorClasses: Record<string, string> = {
  teal: 'from-teal-500 to-teal-600',
  red: 'from-red-500 to-red-600',
  amber: 'from-amber-500 to-amber-600',
  orange: 'from-orange-500 to-orange-600',
  blue: 'from-blue-500 to-blue-600',
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'teal',
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
          )}
          {trend && (
            <span
              className={cn(
                'mt-2 inline-flex items-center text-xs font-medium',
                trend === 'up' && 'text-emerald-600',
                trend === 'down' && 'text-red-600',
                trend === 'neutral' && 'text-gray-500'
              )}
            >
              {trend === 'up' && '↑ '}
              {trend === 'down' && '↓ '}
              {trend === 'neutral' && '→ '}
              与上周持平
            </span>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white',
              colorClasses[color]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
