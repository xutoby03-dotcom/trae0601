import { cn } from '@/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'critical' | 'info' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  default: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-semibold border leading-none',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
