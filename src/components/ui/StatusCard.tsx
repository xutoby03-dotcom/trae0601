import { ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface StatusCardProps {
  title: string;
  count: number;
  icon: ReactNode;
  color: 'danger' | 'warning' | 'success' | 'primary';
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const colorClasses = {
  danger: 'border-danger/30 hover:border-danger/50 [&_.count]:text-danger [&_.icon-bg]:bg-danger/10 [&_.icon-bg]:text-danger',
  warning: 'border-warning/30 hover:border-warning/50 [&_.count]:text-warning [&_.icon-bg]:bg-warning/10 [&_.icon-bg]:text-warning',
  success: 'border-success/30 hover:border-success/50 [&_.count]:text-success [&_.icon-bg]:bg-success/10 [&_.icon-bg]:text-success',
  primary: 'border-primary/30 hover:border-primary/50 [&_.count]:text-primary [&_.icon-bg]:bg-primary/10 [&_.icon-bg]:text-primary',
};

const pulseClasses = {
  danger: 'animate-pulse-soft [box-shadow:0_0_20px_rgba(231,29,54,0.3)]',
  warning: 'animate-pulse-soft [box-shadow:0_0_20px_rgba(255,183,3,0.3)]',
  success: '',
  primary: '',
};

export function StatusCard({
  title,
  count,
  icon,
  color,
  children,
  className = '',
  onClick,
}: StatusCardProps) {
  const hasIssue = count > 0 && (color === 'danger' || color === 'warning');

  return (
    <div
      className={cn(
        'card p-5 cursor-pointer group',
        colorClasses[color],
        hasIssue && pulseClasses[color],
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="icon-bg w-12 h-12 rounded-lg flex items-center justify-center transition-colors">
          {icon}
        </div>
        <span className="count text-3xl font-bold transition-colors">
          {count}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-neutral-100 mb-1">{title}</h3>
      {children && (
        <div className="mt-3 pt-3 border-t border-neutral-700/30">
          {children}
        </div>
      )}
      <div className="mt-2 text-xs text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
        点击查看详情 →
      </div>
    </div>
  );
}
