import { motion } from 'framer-motion'
import type { Medicine, MedicineCategory } from '@/types'
import { CATEGORY_CONFIG } from '@/types'
import MedicineCard from './MedicineCard'

interface CategorySectionProps {
  category: MedicineCategory
  medicines: Medicine[]
}

export default function CategorySection({ category, medicines }: CategorySectionProps) {
  const config = CATEGORY_CONFIG[category]
  if (medicines.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{config.icon}</span>
        <h2 className={cn('font-bold text-base', config.color)}>
          {config.label}
        </h2>
        <span className="text-xs text-gray-400 ml-1">{medicines.length}种</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {medicines.map(m => (
          <MedicineCard key={m.id} medicine={m} />
        ))}
      </div>
    </motion.section>
  )
}

function cn(...inputs: (string | undefined | false)[]) {
  return inputs.filter(Boolean).join(' ')
}
