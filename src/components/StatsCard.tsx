import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  onClick,
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const bgColorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-emerald-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50',
  };

  const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl p-6 shadow-sm border border-gray-100',
          'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
          onClick && 'cursor-pointer'
        )
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                trend.isUp ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {trend.isUp ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">{trend.value}%</span>
              <span className="text-gray-400">较昨日</span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
