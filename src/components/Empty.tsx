import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export default function Empty({ icon: Icon, title, description, className }: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-accent-copper/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-accent-copper" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary text-center max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}
