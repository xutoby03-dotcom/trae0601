import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export default function Empty({ icon, title, description, className }: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center animate-fade-in', className)}>
      {icon && <div className="mb-4">{icon}</div>}
      {title && <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>}
      {description && <p className="text-gray-500 text-sm">{description}</p>}
      {!icon && !title && !description && (
        <div className="text-gray-400">Empty</div>
      )}
    </div>
  );
}
