import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'orange' | 'green' | 'blue' | 'red';
  className?: string;
}

const colorClasses = {
  orange: 'from-orange-500 to-orange-600',
  green: 'from-green-500 to-green-600',
  blue: 'from-blue-500 to-blue-600',
  red: 'from-red-500 to-red-600',
};

export function StatCard({ title, value, icon: Icon, trend, color = 'orange', className }: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-xl p-6 shadow-sm border border-gray-100', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm mt-2 font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% 较昨日
            </p>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
          colorClasses[color]
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
