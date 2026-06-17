import { cn } from '@/utils/helpers';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variantClasses = {
    default: 'bg-warm-100 text-warm-600',
    primary: 'bg-sage-100 text-sage-700',
    success: 'bg-sage-100 text-sage-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-coral-100 text-coral-700',
    info: 'bg-sky-100 text-sky-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  );
}
