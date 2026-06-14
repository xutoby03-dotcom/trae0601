import { type LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  delay?: number;
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 shadow-blue-200',
  green: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
  amber: 'from-amber-500 to-amber-600 shadow-amber-200',
  red: 'from-red-500 to-red-600 shadow-red-200',
  purple: 'from-purple-500 to-purple-600 shadow-purple-200',
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full -translate-y-16 translate-x-16" />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-800 font-mono tracking-tight">
              {value}
            </p>
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.positive ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {trend.positive ? '↑' : '↓'} {trend.value}%
                </span>
                <span className="text-xs text-slate-400">{trend.label}</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110',
              colorClasses[color]
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
