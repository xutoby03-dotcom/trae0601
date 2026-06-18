import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatWeight, formatPercentage } from '../utils/formatters';

interface KpiCardProps {
  title: string;
  value: number;
  unit?: 'kg' | 'percentage' | 'count';
  icon: LucideIcon;
  trend?: number;
  color: 'green' | 'blue' | 'orange' | 'red';
  delay?: number;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit = 'count',
  icon: Icon,
  trend,
  color,
  delay = 0,
}) => {
  const colorClasses = {
    green: 'from-emerald-400 to-emerald-600',
    blue: 'from-blue-400 to-blue-600',
    orange: 'from-orange-400 to-orange-600',
    red: 'from-red-400 to-red-600',
  };

  const bgColorClasses = {
    green: 'bg-emerald-50',
    blue: 'bg-blue-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50',
  };

  const formatValue = () => {
    if (unit === 'kg') return formatWeight(value);
    if (unit === 'percentage') return formatPercentage(value);
    return value.toLocaleString();
  };

  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2 font-mono">
            {formatValue()}
          </p>
          {trend !== undefined && (
            <p
              className={`text-sm mt-2 font-medium ${
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% 较上月
            </p>
          )}
        </div>
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
      
      <div className={`mt-4 h-2 ${bgColorClasses[color]} rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-1000`}
          style={{
            width: `${Math.min((value / (unit === 'percentage' ? 1 : 5000)) * 100, 100)}%`,
          }}
        />
      </div>
    </div>
  );
};
