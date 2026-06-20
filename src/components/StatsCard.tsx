import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'teal' | 'amber' | 'rose' | 'slate';
  trend?: { value: number; isUp: boolean };
  onClick?: () => void;
}

const colorClasses = {
  teal: 'from-teal-500 to-cyan-600 shadow-teal-500/20',
  amber: 'from-amber-500 to-orange-600 shadow-amber-500/20',
  rose: 'from-rose-500 to-pink-600 shadow-rose-500/20',
  slate: 'from-slate-600 to-slate-700 shadow-slate-500/20',
};

const iconBgClasses = {
  teal: 'bg-white/20',
  amber: 'bg-white/20',
  rose: 'bg-white/20',
  slate: 'bg-white/20',
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'teal',
  trend,
  onClick,
}: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-gradient-to-br',
        colorClasses[color],
        'shadow-lg',
        onClick && 'cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300'
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className={cn('p-3 rounded-xl', iconBgClasses[color])}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {subtitle && (
          <p className="text-white/70 text-sm">{subtitle}</p>
        )}
        
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span className={cn(
              'text-xs font-medium px-1.5 py-0.5 rounded-md',
              trend.isUp ? 'bg-white/20 text-white' : 'bg-white/20 text-white'
            )}>
              {trend.isUp ? '↑' : '↓'} {trend.value}%
            </span>
            <span className="text-white/60 text-xs">较上周</span>
          </div>
        )}
      </div>
    </div>
  );
}
