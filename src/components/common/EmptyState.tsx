import { Package, Search, AlertCircle } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: 'package' | 'search' | 'alert';
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon = 'package', title, description, action }: EmptyStateProps) {
  const IconComponent = icon === 'search' ? Search : icon === 'alert' ? AlertCircle : Package;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <IconComponent className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm text-center max-w-sm mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
