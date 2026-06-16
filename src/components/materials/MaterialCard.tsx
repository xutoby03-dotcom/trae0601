import { motion } from 'framer-motion';
import { Package, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import type { Material } from '../../types';
import { MATERIAL_CATEGORY_LABELS } from '../../types';
import { cn } from '../../lib/utils';

interface MaterialCardProps {
  material: Material;
  index?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdjustInventory?: () => void;
}

export function MaterialCard({
  material,
  index = 0,
  onEdit,
  onDelete,
  onAdjustInventory,
}: MaterialCardProps) {
  const percentage = material.totalQuantity > 0
    ? (material.remainingQuantity / material.totalQuantity) * 100
    : 0;

  const isLowStock = percentage < 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="h-full overflow-hidden">
        <div className="relative h-40 overflow-hidden">
          <img
            src={material.image}
            alt={material.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-accent-500/20">
            <Package className="w-12 h-12 text-white/50" />
          </div>
          <div className="absolute top-3 left-3">
            <Tag variant="purple">{MATERIAL_CATEGORY_LABELS[material.category]}</Tag>
          </div>
          {isLowStock && (
            <div className="absolute top-3 right-3">
              <Tag variant="red" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                库存不足
              </Tag>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white">{material.name}</h3>
              <p className="text-sm text-gray-400 mt-0.5">制作人: {material.producer}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gradient">¥{material.cost}</p>
              <p className="text-xs text-gray-500">单价</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">库存</span>
              <span className={cn(
                'font-medium',
                isLowStock ? 'text-red-400' : 'text-white'
              )}>
                {material.remainingQuantity} / {material.totalQuantity}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className={cn(
                  'progress-bar-fill',
                  isLowStock && 'bg-gradient-to-r from-red-500 to-orange-500'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>袋子编号: {material.bagNumber}</span>
          </div>

          <div className="flex gap-2 pt-2 border-t border-white/5">
            <button
              onClick={onAdjustInventory}
              className="flex-1 py-2 text-xs font-medium text-amber-400 bg-amber-500/10 rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              调整库存
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
