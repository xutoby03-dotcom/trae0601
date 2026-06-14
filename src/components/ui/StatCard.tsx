import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  trend?: number;
  trendLabel?: string;
}

const colorStyles = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
};

const iconBgStyles = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
};

export default function StatCard({ title, value, icon: Icon, color, trend, trendLabel }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-800 tracking-tight">
            {displayValue}
            <span className="text-lg font-normal text-gray-400 ml-1">条</span>
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-3">
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500" />
              )}
              <span className={cn(
                'text-sm font-medium',
                trend >= 0 ? 'text-red-500' : 'text-green-500'
              )}>
                {Math.abs(trend)}%
              </span>
              <span className="text-xs text-gray-400">{trendLabel || '较上周'}</span>
            </div>
          )}
        </div>
        <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', iconBgStyles[color])}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
      <div className={cn('h-1 mt-4 rounded-full bg-gradient-to-r', colorStyles[color])} />
    </div>
  );
}
