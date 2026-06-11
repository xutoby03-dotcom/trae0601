import type { LucideIcon } from 'lucide-react';
import { SEAT_STATUS_COLORS, SEAT_STATUS_LABELS } from '../types';
import type { SeatStatus } from '../types';
import { cn } from '../lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  status?: SeatStatus;
  label: string;
  count: number;
  customBg?: string;
  customColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  iconBg?: string;
  onClick?: () => void;
}

export function StatsCard({
  icon: Icon,
  status,
  label,
  count,
  customBg,
  customColor,
  gradientFrom,
  gradientTo,
  iconBg,
  onClick,
}: StatsCardProps) {
  const colors = status ? SEAT_STATUS_COLORS[status] : null;
  const finalLabel = status ? SEAT_STATUS_LABELS[status] : label;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 shadow-sm transition-all duration-300',
        onClick && 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5',
        gradientFrom && gradientTo
          ? `bg-gradient-to-br ${gradientFrom} ${gradientTo}`
          : customBg || 'bg-white',
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={cn('text-sm font-medium opacity-90', customColor || colors?.text || 'text-slate-600')}>
            {finalLabel}
          </p>
          <p className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-white">
            {count}
          </p>
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center',
            iconBg || 'bg-white/25 backdrop-blur',
          )}
        >
          <Icon className={cn('w-6 h-6 text-white')} />
        </div>
      </div>
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10" />
    </div>
  );
}
