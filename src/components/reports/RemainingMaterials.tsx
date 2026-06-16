import { motion } from 'framer-motion';
import { Package, AlertTriangle, Check } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import type { Material } from '../../types';
import { MATERIAL_CATEGORY_LABELS } from '../../types';
import { cn } from '../../lib/utils';

interface RemainingMaterialsProps {
  materials: Material[];
}

export function RemainingMaterials({ materials }: RemainingMaterialsProps) {
  const totalRemaining = materials.reduce((sum, m) => sum + m.remainingQuantity, 0);
  const totalOriginal = materials.reduce((sum, m) => sum + m.totalQuantity, 0);
  const percentage = totalOriginal > 0 ? (totalRemaining / totalOriginal) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/20">
                <Package className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">剩余物料</h3>
                <p className="text-sm text-gray-500">
                  剩余 {totalRemaining} / {totalOriginal} 件
                </p>
              </div>
            </div>
            <span className="text-sm font-medium text-primary-400">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {materials.map((material, index) => {
              const pct = material.totalQuantity > 0
                ? (material.remainingQuantity / material.totalQuantity) * 100
                : 0;
              const isLow = pct < 30;

              return (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isLow ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                      <span className="text-sm font-medium text-white">
                        {material.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({MATERIAL_CATEGORY_LABELS[material.category]})
                      </span>
                    </div>
                    <span className={cn(
                      'text-sm font-semibold',
                      isLow ? 'text-red-400' : 'text-gray-300'
                    )}>
                      {material.remainingQuantity} / {material.totalQuantity}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={cn(
                        'progress-bar-fill',
                        isLow && 'bg-gradient-to-r from-red-500 to-orange-500'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
