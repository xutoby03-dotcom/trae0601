import type { ReactNode } from 'react';
import { BookX, BookPlus, SearchX, LibraryBig } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'no-books' | 'no-results' | 'no-records' | 'empty-shelf';
  action?: ReactNode;
}

export const EmptyState = ({ title, description, icon = 'no-books', action }: EmptyStateProps) => {
  const icons = {
    'no-books': BookPlus,
    'no-results': SearchX,
    'no-records': BookX,
    'empty-shelf': LibraryBig,
  };
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-wood-200/40 rounded-full blur-2xl scale-150" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-paper-100 to-paper-200 border border-wood-200 flex items-center justify-center shadow-paper">
          <Icon className="w-10 h-10 text-wood-400" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-lg font-bold text-wood-800 font-serif mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-wood-500 max-w-sm leading-relaxed mb-5">{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
