import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface Props {
  children: ReactNode;
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  icon?: ReactNode;
}

const variants = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-red-50 text-red-600 border-red-100',
  info: 'bg-blue-50 text-blue-700 border-blue-100',
};

export function Badge({ children, variant = 'default', className, icon }: Props) {
  return (
    <span className={clsx('badge border', variants[variant], className)}>
      {icon}
      {children}
    </span>
  );
}
