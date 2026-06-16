import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

const variantClasses = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-700',
  purple: 'bg-violet-100 text-violet-700',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs rounded-lg',
  md: 'px-3 py-1 text-xs rounded-xl',
};

export function Badge({ children, variant = 'default', size = 'md', pulse, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium',
        variantClasses[variant],
        sizeClasses[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  );
}
