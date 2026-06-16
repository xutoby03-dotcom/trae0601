import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  showIcon?: boolean;
  children: ReactNode;
}

const variantConfig: Record<BadgeVariant, { classes: string; icon: typeof CheckCircle }> = {
  success: {
    classes: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle,
  },
  warning: {
    classes: 'bg-warning/10 text-warning border-warning/20',
    icon: AlertTriangle,
  },
  danger: {
    classes: 'bg-danger/10 text-danger border-danger/20',
    icon: XCircle,
  },
  info: {
    classes: 'bg-info/10 text-info border-info/20',
    icon: Info,
  },
};

export default function Badge({
  className,
  variant = 'info',
  showIcon = false,
  children,
  ...props
}: BadgeProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.classes,
        className,
      )}
      {...props}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
