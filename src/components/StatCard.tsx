import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  color?: 'default' | 'orange' | 'green' | 'red' | 'amber';
  trend?: {
    value: number;
    label: string;
  };
}

export function StatCard({ title, value, unit, icon, color = 'default', trend }: StatCardProps) {
  const colorClasses = {
    default: 'bg-stone-100 text-stone-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-stone-500 mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-stone-800">{value}</span>
            {unit && <span className="text-sm text-stone-400">{unit}</span>}
          </div>
          {trend && (
            <p className={`text-xs mt-2 ${
              trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
