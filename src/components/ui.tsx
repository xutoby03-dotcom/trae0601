import { cn } from '../lib/utils';

interface SoupLevelGaugeProps {
  level: number;
  size?: number;
  strokeWidth?: number;
}

export function SoupLevelGauge({ level, size = 120, strokeWidth = 10 }: SoupLevelGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (level / 100) * circumference;

  const getColor = () => {
    if (level < 30) return '#ef4444';
    if (level < 50) return '#f59e0b';
    return '#22c55e';
  };

  const color = getColor();

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e7e5e4"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-stone-800 font-mono">{level}%</span>
        <span className="text-xs text-stone-500">剩汤高度</span>
      </div>
    </div>
  );
}

interface AlertItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  type?: 'warning' | 'danger';
  action?: React.ReactNode;
}

export function AlertItem({ icon, title, description, type = 'danger', action }: AlertItemProps) {
  const bgClass = type === 'danger' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200';
  const iconClass = type === 'danger' ? 'text-red-600' : 'text-amber-600';
  const titleClass = type === 'danger' ? 'text-red-800' : 'text-amber-800';
  const descClass = type === 'danger' ? 'text-red-600' : 'text-amber-600';

  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-lg border', bgClass)}>
      <div className={cn('flex-shrink-0 mt-0.5', iconClass)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm', titleClass)}>{title}</p>
        <p className={cn('text-xs mt-0.5', descClass)}>{description}</p>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  onClick?: () => void;
}

export function Card({ title, children, className, action, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-stone-50/50">
          {title && <h3 className="font-semibold text-stone-800">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
