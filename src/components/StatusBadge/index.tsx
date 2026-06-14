import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  variant?:
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'default'
    | 'pending'
    | 'processing';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  default: 'bg-slate-50 text-slate-600 border-slate-200',
  pending: 'bg-slate-100 text-slate-500 border-slate-200',
  processing: 'bg-blue-50 text-blue-600 border-blue-200',
};

export default function StatusBadge({
  variant = 'default',
  children,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
