import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, CheckCircle2, PackageX } from 'lucide-react'
import { useMedicineStore } from '@/store/medicineStore'
import RestockItemCard from '@/components/RestockItemCard'

export default function RestockList() {
  const { restockItems, medicines, resolveRestockItem, resolveRestockAndRestock } = useMedicineStore()

  const pendingItems = useMemo(
    () => restockItems.filter(r => !r.resolved),
    [restockItems]
  )

  const resolvedItems = useMemo(
    () => restockItems.filter(r => r.resolved),
    [restockItems]
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingCart className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl font-bold text-amber-900">补货清单</h1>
        </div>
        <p className="text-sm text-gray-400">
          库存不足或即将过期的药品会自动出现在这里
        </p>
      </div>

      {pendingItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-amber-800 mb-3">
            待处理 · {pendingItems.length}项
          </h2>
          <div className="space-y-2.5">
            {pendingItems.map(item => (
              <RestockItemCard
                key={item.id}
                item={item}
                medicine={medicines.find(m => m.id === item.medicineId)}
                onResolve={resolveRestockItem}
                onRestock={resolveRestockAndRestock}
              />
            ))}
          </div>
        </div>
      )}

      {resolvedItems.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            已处理 · {resolvedItems.length}项
          </h2>
          <div className="space-y-2.5">
            {resolvedItems.map(item => (
              <RestockItemCard
                key={item.id}
                item={item}
                medicine={medicines.find(m => m.id === item.medicineId)}
                onResolve={resolveRestockItem}
                onRestock={resolveRestockAndRestock}
              />
            ))}
          </div>
        </div>
      )}

      {pendingItems.length === 0 && resolvedItems.length === 0 && (
        <div className="text-center py-20">
          <PackageX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">暂无需要补货的药品</p>
          <p className="text-gray-300 text-xs mt-1">库存不足或即将过期的药品会自动出现在这里</p>
        </div>
      )}
    </motion.div>
  )
}
