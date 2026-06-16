import { cn } from '@/lib/utils';

interface TagProps {
  variant?: 'pattern' | 'fabric' | 'workmanship' | 'comfort' | 'size' | 'status' | 'default';
  color?: string;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  pattern: 'bg-charcoal-700 text-white',
  fabric: 'bg-cream-200 text-charcoal-700',
  workmanship: 'bg-champagne-300 text-charcoal-700',
  comfort: 'bg-terracotta-100 text-terracotta-600',
  size: 'bg-moss-100 text-moss-600',
  status: 'bg-cream-100 text-charcoal-700',
  default: 'bg-charcoal-100 text-charcoal-600',
};

export default function Tag({
  variant = 'default', color, children, className }: TagProps) {
  return (
    <span
      className={cn('tag', variantClasses[variant], className)}
      style={color ? { backgroundColor: color } : undefined}
    >
      {children}
    </span>
  );
}
