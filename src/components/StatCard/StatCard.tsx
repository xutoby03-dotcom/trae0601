import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/format';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'primary' | 'warning' | 'danger' | 'success' | 'purple';
  className?: string;
}

const colorClasses = {
  primary: 'from-primary-500 to-primary-700',
  warning: 'from-warning-500 to-warning-600',
  danger: 'from-danger-500 to-danger-600',
  success: 'from-success-500 to-success-600',
  purple: 'from-purple-500 to-purple-700',
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color = 'primary',
  className,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs font-medium flex items-center',
                trendUp ? 'text-success-500' : 'text-danger-500'
              )}
            >
              <span className="mr-1">{trendUp ? '↑' : '↓'}</span>
              {trend}
            </p>
          )}
        </div>
        <div
          className={cn(
            'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg',
            colorClasses[color]
          )}
        >
          <Icon className="w-7 h-7" />
        </div>
      </div>
      <div
        className={cn(
          'absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br opacity-10',
          colorClasses[color]
        )}
      ></div>
    </div>
  );
};
