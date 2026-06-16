import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  suffix?: string;
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
};

const iconBgClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
};

export const StatCard = ({ title, value, icon: Icon, trend, color = 'blue', suffix }: StatCardProps) => {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className={cn(
        'absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 -mr-8 -mt-8 rounded-full',
        colorClasses[color]
      )} />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className={cn(
                'text-3xl font-bold tracking-tight font-mono',
                color === 'red' ? 'text-red-600' : 'text-gray-900'
              )}>
                {value}
              </span>
              {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
            </div>
          </div>
          
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            iconBgClasses[color]
          )}>
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-1 mt-4">
            {trend.isUp ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={cn(
              'text-sm font-medium',
              trend.isUp ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.isUp ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-500">较上月</span>
          </div>
        )}
      </div>
    </div>
  );
};
