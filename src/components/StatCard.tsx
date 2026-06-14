import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'amber' | 'purple';
  subtitle?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const colorClasses = {
  primary: {
    bg: 'bg-gradient-to-br from-primary-400 to-primary-600',
    iconBg: 'bg-white/20',
    text: 'text-white',
  },
  secondary: {
    bg: 'bg-gradient-to-br from-secondary-400 to-secondary-600',
    iconBg: 'bg-white/20',
    text: 'text-white',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    iconBg: 'bg-white/20',
    text: 'text-white',
  },
  purple: {
    bg: 'bg-gradient-to-br from-violet-400 to-purple-600',
    iconBg: 'bg-white/20',
    text: 'text-white',
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  subtitle,
  trend,
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        colors.bg,
        colors.text
      )}
    >
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-90 font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtitle && (
              <p className="text-xs opacity-80 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', colors.iconBg)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-1 text-sm">
            <span className={cn(
              'flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white/20',
              trend.isUp ? '' : ''
            )}>
              {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="opacity-80 text-xs">较上月</span>
          </div>
        )}
      </div>
    </div>
  );
}
