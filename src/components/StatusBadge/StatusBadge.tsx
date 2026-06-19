import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
  size?: 'sm' | 'md';
  className?: string;
}

const StatusBadge = ({ label, variant = 'default', size = 'md', className }: StatusBadgeProps) => {
  const variantClasses = {
    default: 'bg-dark-200 text-dark-600',
    success: 'bg-success-500/15 text-success-500',
    warning: 'bg-warning-500/15 text-warning-500',
    danger: 'bg-danger-500/15 text-danger-500',
    info: 'bg-primary-500/15 text-primary-500',
    muted: 'bg-dark-700 text-dark-400',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
