import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down';
  };
  color?: 'blue' | 'orange' | 'green' | 'red' | 'purple';
  className?: string;
}

const StatsCard = ({ title, value, icon: Icon, trend, color = 'blue', className }: StatsCardProps) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500/20 to-blue-600/5',
      icon: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    orange: {
      bg: 'from-warning-500/20 to-warning-600/5',
      icon: 'text-warning-400',
      border: 'border-warning-500/20',
    },
    green: {
      bg: 'from-success-500/20 to-success-600/5',
      icon: 'text-success-400',
      border: 'border-success-500/20',
    },
    red: {
      bg: 'from-danger-500/20 to-danger-600/5',
      icon: 'text-danger-400',
      border: 'border-danger-500/20',
    },
    purple: {
      bg: 'from-purple-500/20 to-purple-600/5',
      icon: 'text-purple-400',
      border: 'border-purple-500/20',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm',
        'bg-gradient-to-br border transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-lg',
        colors.bg,
        colors.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2 font-mono">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-3">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.direction === 'up' ? 'text-success-400' : 'text-danger-400'
                )}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-dark-500 text-sm">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            colors.icon,
            'bg-white/5'
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
