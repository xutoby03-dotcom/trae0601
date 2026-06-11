import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';

type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type TagSize = 'sm' | 'md';

export interface TagProps extends HTMLAttributes<HTMLDivElement> {
  variant?: TagVariant;
  size?: TagSize;
  closable?: boolean;
  onClose?: () => void;
  icon?: ReactNode;
}

const variantStyles: Record<TagVariant, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  primary: 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800',
  success: 'bg-success-50 text-success-600 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800',
  warning: 'bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-900/30 dark:text-accent-400 dark:border-accent-800',
  danger: 'bg-danger-50 text-danger-600 border-danger-200 dark:bg-danger-900/30 dark:text-danger-400 dark:border-danger-800',
  info: 'bg-info-50 text-info-600 border-info-200 dark:bg-info-900/30 dark:text-info-400 dark:border-info-800',
};

const sizeStyles: Record<TagSize, string> = {
  sm: 'h-6 px-2 text-xs gap-1 rounded',
  md: 'h-7 px-2.5 text-sm gap-1.5 rounded-md',
};

export default function Tag({
  variant = 'default',
  size = 'md',
  closable = false,
  onClose,
  icon,
  className,
  children,
  ...props
}: TagProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center border font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon}
      {children}
      {closable && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'inline-flex items-center justify-center rounded transition-colors',
            'hover:bg-black/10 dark:hover:bg-white/10',
            size === 'sm' ? 'h-3.5 w-3.5 -mr-0.5' : 'h-4 w-4 -mr-0.5'
          )}
        >
          <X className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        </button>
      )}
    </div>
  );
}
