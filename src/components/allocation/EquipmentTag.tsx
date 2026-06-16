import { Package, GripVertical, Star, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Equipment } from '../../types';
import { cn, equipmentCategoryConfig } from '../../utils/helpers';

interface EquipmentTagProps {
  equipment: Equipment;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  compact?: boolean;
}

export function EquipmentTag({ equipment, selected, onClick, onRemove, compact }: EquipmentTagProps) {
  const categoryConfig = equipmentCategoryConfig[equipment.category];

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
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', categoryConfig.color)}>
        <Package className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={cn('font-medium text-forest-900 truncate', compact ? 'text-sm' : '')}>
            {equipment.name}
          </p>
          {equipment.isCritical && (
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {!compact && (
            <span className={cn('text-xs px-1.5 py-0.5 rounded-md', categoryConfig.color)}>
              {categoryConfig.label}
            </span>
          )}
          <span className="text-xs text-gray-500">{equipment.size}L</span>
        </div>
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
