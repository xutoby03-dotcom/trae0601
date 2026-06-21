import '../styles/components.css';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'onsite' | 'online' | 'muted';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

export function Badge({ variant = 'primary', children, showDot = true, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {showDot && <span className="badge-dot" />}
      {children}
    </span>
  );
}
