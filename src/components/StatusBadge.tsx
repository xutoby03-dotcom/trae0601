import { cn } from '@/utils';

interface StatusBadgeProps {
  status: string;
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

const variantClasses = {
  default: 'bg-slate-100 text-slate-700 ring-slate-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export default function StatusBadge({
  status,
  label,
  variant = 'default',
  size = 'md',
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full ring-1 ring-inset',
        variantClasses[variant],
        sizeClasses[size]
      )}
      data-status={status}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70 animate-pulse" />
      {label}
    </span>
  );
}
