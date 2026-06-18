import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  accent?: 'fire' | 'soup' | 'broth' | 'green';
  className?: string;
}

export default function StatCard({ label, value, unit, icon, trend, accent = 'fire', className }: Props) {
  const accentBg = {
    fire: 'bg-fire-50 text-fire-500',
    soup: 'bg-soup-50 text-soup-600',
    broth: 'bg-broth-50 text-broth-500',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className={cn('card flex items-start gap-4', className)}>
      {icon && (
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', accentBg[accent])}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-broth-500 mb-0.5">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-2xl font-bold text-broth-800">{value}</span>
          {unit && <span className="text-sm text-broth-500">{unit}</span>}
        </div>
        {trend && (
          <p className={cn('text-xs mt-1', trend.value >= 0 ? 'text-green-600' : 'text-red-500')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
