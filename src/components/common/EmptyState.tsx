import { Package } from 'lucide-react';

interface EmptyStateProps {
  icon?: typeof Package;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon = Package, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center mb-4">
        <Icon size={32} className="text-bark-500/40" />
      </div>
      <h3 className="text-lg font-semibold text-bark-500 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-bark-500/60 max-w-sm">{description}</p>
      )}
    </div>
  );
}
