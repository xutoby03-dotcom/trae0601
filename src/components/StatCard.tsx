import { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'red' | 'green' | 'yellow' | 'blue' | 'gray';
  className?: string;
}

const colorClasses = {
  red: 'from-red-500 to-red-600',
  green: 'from-emerald-500 to-emerald-600',
  yellow: 'from-amber-500 to-amber-600',
  blue: 'from-blue-500 to-blue-600',
  gray: 'from-gray-500 to-gray-600'
};

const iconBgClasses = {
  red: 'bg-red-500/20 text-red-100',
  green: 'bg-emerald-500/20 text-emerald-100',
  yellow: 'bg-amber-500/20 text-amber-100',
  blue: 'bg-blue-500/20 text-blue-100',
  gray: 'bg-gray-500/20 text-gray-100'
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color = 'blue',
  className
}: StatCardProps) {
  return (
    <div
      className={twMerge(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        colorClasses[color],
        className
      )}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="mt-2 text-4xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={twMerge('rounded-xl p-3', iconBgClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1 text-sm">
            <span
              className={twMerge(
                'font-medium',
                trendUp ? 'text-emerald-100' : 'text-red-100'
              )}
            >
              {trendUp ? '↑' : '↓'} {trend}
            </span>
            <span className="text-white/60">较上月</span>
          </div>
        )}
      </div>
      <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10" />
    </div>
  );
}
