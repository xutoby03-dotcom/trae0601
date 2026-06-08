import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PackageOpen } from 'lucide-react'
import { useMedicineStore } from '@/store/medicineStore'
import CategorySection from '@/components/CategorySection'
import ExpiryBanner from '@/components/ExpiryBanner'
import MemberFilter from '@/components/MemberFilter'
import MedicineCard from '@/components/MedicineCard'
import { getExpiryStatus } from '@/utils/expiry'
import type { MedicineCategory } from '@/types'
import { CATEGORY_CONFIG } from '@/types'

const CATEGORY_ORDER: MedicineCategory[] = ['regular', 'children', 'topical', 'chronic', 'emergency']

export default function Home() {
  const { medicines, getFilteredMedicines, getExpiredMedicines, getExpiringSoonMedicines } = useMedicineStore()

  const filteredMedicines = getFilteredMedicines()
  const expiredMedicines = getExpiredMedicines()
  const expiringSoonMedicines = getExpiringSoonMedicines()

  const categorizedMedicines = useMemo(() => {
    const map: Record<MedicineCategory, typeof filteredMedicines> = {
      regular: [],
      children: [],
      topical: [],
      chronic: [],
      emergency: [],
    }
    for (const m of filteredMedicines) {
      if (getExpiryStatus(m.expiryDate) === 'expired') continue
      map[m.category].push(m)
    }
    return map
  }, [filteredMedicines])

  const filteredExpired = useMemo(() => {
    const selectedTag = useMedicineStore.getState().selectedMemberTag
    if (!selectedTag) return expiredMedicines
    return expiredMedicines.filter(m =>
      m.suitableFor.length === 0
      || m.suitableFor.includes(selectedTag)
      || m.suitableFor.includes('all')
    )
  }, [expiredMedicines])

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4"
      >
        <h1 className="text-2xl font-bold text-amber-900">我的药箱</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          共{medicines.length}种药品
        </p>
      </motion.div>

      <ExpiryBanner
        expiringSoonCount={expiringSoonMedicines.length}
        expiredCount={expiredMedicines.length}
      />

      <MemberFilter />

      {CATEGORY_ORDER.map(category => (
        <CategorySection
          key={category}
          category={category}
          medicines={categorizedMedicines[category]}
        />
      ))}

      {filteredExpired.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <PackageOpen className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-base text-red-600">待处理区</h2>
            <span className="text-xs text-gray-400 ml-1">{filteredExpired.length}种</span>
          </div>
          <div className="p-4 rounded-xl border-2 border-dashed border-red-200 bg-red-50/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredExpired.map(m => (
                <MedicineCard key={m.id} medicine={m} />
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {filteredMedicines.length === 0 && filteredExpired.length === 0 && (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🏥</p>
          <p className="text-gray-400 text-sm">药箱还是空的，快添加一些药品吧</p>
        </div>
      )}
    </div>
  )
}
