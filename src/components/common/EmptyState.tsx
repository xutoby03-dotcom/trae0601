import { Flower2 } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center mb-4">
        {icon || <Flower2 className="w-10 h-10 text-rose-300" />}
      </div>
      <h3 className="text-lg font-medium text-forest-600 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-forest-400 max-w-xs">{description}</p>
      )}
    </div>
  );
}
