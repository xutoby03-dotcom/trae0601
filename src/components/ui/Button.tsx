import { cn } from '@/utils';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
  danger:
    'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-md shadow-red-500/20',
  success:
    'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20',
  warning:
    'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/20',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
  icon: 'p-2 rounded-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
