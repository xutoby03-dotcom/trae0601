import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  accent?: string;
  suffix?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBg = 'bg-primary-50',
  iconColor = 'text-primary-600',
  accent = 'from-primary-500 to-primary-600',
  suffix,
  trend,
}: StatCardProps) {
  return (
    <div className="card p-5 relative overflow-hidden group">
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-800 flex items-baseline">
            {value}
            {suffix && <span className="text-lg font-medium text-slate-400 ml-1">{suffix}</span>}
          </p>
          {trend && (
            <p
              className={`text-xs mt-2 flex items-center gap-1 ${
                trend.positive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span>{trend.positive ? '↑' : '↓'}</span>
              {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
