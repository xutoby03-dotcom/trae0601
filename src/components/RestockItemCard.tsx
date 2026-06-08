import { motion } from 'framer-motion'
import { Package, Clock, Check } from 'lucide-react'
import type { RestockItem, Medicine, FamilyMember } from '@/types'
import { getRestockReasonLabel } from '@/utils/expiry'
import { cn } from '@/lib/utils'

interface RestockItemCardProps {
  item: RestockItem
  medicine: Medicine | undefined
  members: FamilyMember[]
  onResolve: (itemId: string) => void
  onRestock: (itemId: string, newQuantity: number) => void
}

export default function RestockItemCard({ item, medicine, members, onResolve, onRestock }: RestockItemCardProps) {
  if (!medicine) return null

  const suitableLabels = medicine.suitableFor.map(tag => {
    const member = members.find(m => m.tag === tag)
    return member ? { tag, label: `${member.avatar} ${member.name}` } : { tag, label: tag }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-xl border transition-all',
        item.resolved
          ? 'bg-gray-50 border-gray-200/60 opacity-60'
          : 'bg-white border-amber-100/60 shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          item.reason === 'low_stock' ? 'bg-sky-50' : 'bg-amber-50'
        )}>
          {item.reason === 'low_stock' ? (
            <Package className="w-5 h-5 text-sky-500" />
          ) : (
            <Clock className="w-5 h-5 text-amber-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-amber-900 text-sm truncate">{medicine.name}</h4>
            <span className={cn(
              'shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded-full',
              item.reason === 'low_stock'
                ? 'bg-sky-50 text-sky-600'
                : 'bg-amber-50 text-amber-600'
            )}>
              {getRestockReasonLabel(item.reason)}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            当前数量：{medicine.quantity}{medicine.unit}
          </p>
          {suitableLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {suitableLabels.map(s => (
                <span
                  key={s.tag}
                  className="px-1.5 py-0.5 text-[10px] rounded-full bg-sky-50 text-sky-600 border border-sky-100"
                >
                  {s.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {!item.resolved && (
        <div className="flex gap-2 mt-3 ml-13">
          <button
            onClick={() => onRestock(item.id, medicine.lowStockThreshold + 5)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <Package className="w-3.5 h-3.5" />
            补货
          </button>
          <button
            onClick={() => onResolve(item.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            标记完成
          </button>
        </div>
      )}
      {item.resolved && (
        <div className="mt-2 ml-13 flex items-center gap-1 text-xs text-gray-400">
          <Check className="w-3.5 h-3.5" />
          已处理
        </div>
      )}
    </motion.div>
  )
}
