import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  subLabel?: string;
  gradient: string;
  showBadge?: boolean;
  pulseHighlight?: boolean;
  animationDelay?: number;
}

export default function StatCard({
  icon,
  label,
  value,
  subLabel,
  gradient,
  showBadge = false,
  pulseHighlight = false,
  animationDelay = 0,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-3xl-plus p-5 shadow-soft border border-gray-100/70 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 opacity-0 animate-fade-in-up',
        gradient,
        pulseHighlight && 'animate-pulse-glow border-alert-200'
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {showBadge && (
        <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-alert-400 animate-bounce-soft shadow-soft" />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="text-3xl md:text-4xl font-extrabold text-gray-800 font-display mb-1">
        {value}
      </div>
      <div className="text-sm font-semibold text-gray-600 mb-1">{label}</div>
      {subLabel && (
        <div className="text-xs text-gray-500">{subLabel}</div>
      )}
    </div>
  );
}
