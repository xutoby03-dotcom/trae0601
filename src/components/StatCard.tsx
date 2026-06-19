import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  delay?: number;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  delay = 0,
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-white text-warm-400',
    warning: 'bg-gradient-to-br from-sand-50 to-white border-sand-200 text-sand-400',
    danger: 'bg-gradient-to-br from-coral-50 to-white border-coral-300 text-coral-400 animate-pulse-soft',
    success: 'bg-gradient-to-br from-forest-50 to-white border-forest-200 text-forest-400',
  };

  const iconBgColors = {
    default: 'bg-cream-200',
    warning: 'bg-sand-100',
    danger: 'bg-coral-100',
    success: 'bg-forest-100',
  };

  return (
    <div
      className={`card border-2 ${variantStyles[variant]} opacity-0 animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-display mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs mt-1 opacity-70">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${iconBgColors[variant]}`}>
          <Icon size={24} className={variant === 'danger' ? 'text-coral-300' : variant === 'warning' ? 'text-sand-300' : variant === 'success' ? 'text-forest-300' : 'text-sand-300'} />
        </div>
      </div>
    </div>
  );
}
