import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, CheckCircle2, PackageX } from 'lucide-react'
import { useMedicineStore } from '@/store/medicineStore'
import { useMemberStore } from '@/store/memberStore'
import RestockItemCard from '@/components/RestockItemCard'
import { cn } from '@/lib/utils'

export default function RestockList() {
  const { restockItems, medicines, resolveRestockItem, resolveRestockAndRestock } = useMedicineStore()
  const { members } = useMemberStore()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const matchesMember = (suitableFor: string[]) => {
    if (!selectedTag) return true
    return suitableFor.includes(selectedTag) || suitableFor.includes('all')
  }

  const pendingItems = useMemo(
    () => restockItems.filter(r => {
      if (r.resolved) return false
      const med = medicines.find(m => m.id === r.medicineId)
      if (!med) return false
      return matchesMember(med.suitableFor)
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [restockItems, medicines, selectedTag]
  )

  const resolvedItems = useMemo(
    () => restockItems.filter(r => {
      if (!r.resolved) return false
      const med = medicines.find(m => m.id === r.medicineId)
      if (!med) return false
      return matchesMember(med.suitableFor)
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [restockItems, medicines, selectedTag]
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

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedTag(null)}
          className={cn(
            'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
            !selectedTag
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
              : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
          )}
        >
          全部
        </button>
        {members.map(member => (
          <button
            key={member.id}
            onClick={() => setSelectedTag(selectedTag === member.tag ? null : member.tag)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
              selectedTag === member.tag
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
            )}
          >
            <span className="text-base">{member.avatar}</span>
            {member.name}
          </button>
        ))}
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
                members={members}
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
                members={members}
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
