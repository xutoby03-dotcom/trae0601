import { User, GripVertical, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Person } from '../../types';
import { cn } from '../../utils/helpers';

interface PersonTagProps {
  person: Person;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  compact?: boolean;
}

export function PersonTag({ person, selected, onClick, onRemove, compact }: PersonTagProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-xl border-2 bg-white px-3 py-2 transition-all cursor-pointer select-none',
        compact ? 'px-2 py-1.5' : '',
        selected
          ? 'border-forest-500 bg-forest-50 shadow-md ring-2 ring-forest-200'
          : 'border-cream-200 hover:border-forest-300 hover:bg-cream-50',
        onClick ? '' : 'cursor-default'
      )}
    >
      {onClick && !compact && (
        <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
      <div className="w-7 h-7 rounded-full bg-forest-100 flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-forest-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-forest-900 truncate', compact ? 'text-sm' : '')}>
          {person.name}
        </p>
        {!compact && person.phone && (
          <p className="text-xs text-gray-500 truncate">{person.phone}</p>
        )}
      </div>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
