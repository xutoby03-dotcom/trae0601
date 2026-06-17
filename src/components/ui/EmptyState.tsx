import { cn } from '@/utils/helpers';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-warm-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-warm-400" />
      </div>
      <h3 className="text-base font-medium text-warm-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-warm-500 mb-4 max-w-xs">{description}</p>
      )}
      {action}
    </div>
  );
}
