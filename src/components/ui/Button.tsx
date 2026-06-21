import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50',
          variant === 'default' && 'bg-cyan-500/80 hover:bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20',
          variant === 'secondary' && 'bg-slate-700 hover:bg-slate-600 text-slate-100',
          variant === 'ghost' && 'hover:bg-slate-700/50 text-slate-300 hover:text-white',
          variant === 'danger' && 'bg-red-500/80 hover:bg-red-400 text-white shadow-lg shadow-red-500/20',
          variant === 'warning' && 'bg-amber-500/80 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20',
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'md' && 'h-9 px-4',
          size === 'lg' && 'h-10 px-6',
          size === 'icon' && 'h-9 w-9',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
