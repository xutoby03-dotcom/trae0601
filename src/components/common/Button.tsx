import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-coffee-900 text-white hover:bg-coffee-800 shadow-soft hover:shadow-soft-lg',
  secondary: 'bg-white text-coffee-900 border-2 border-coffee-900 hover:bg-coffee-50',
  accent: 'bg-coffee-700 text-white hover:bg-coffee-600 shadow-soft hover:shadow-soft-lg',
  ghost: 'bg-transparent text-coffee-700 hover:bg-coffee-50',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-soft',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'rounded-lg font-medium transition-all duration-200 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
