import type { GarbageCategory } from '../types'
import { categoryConfig, categoryList } from '../utils/category'
import { motion } from 'framer-motion'

interface CategoryPickerProps {
  value: GarbageCategory
  onChange: (category: GarbageCategory) => void
}

export default function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {categoryList.map((cat, i) => {
        const config = categoryConfig[cat]
        const isSelected = value === cat
        return (
          <motion.button
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onChange(cat)}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              isSelected
                ? `${config.bgColor} ${config.borderColor} shadow-lg scale-105`
                : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <span className="text-3xl">{config.emoji}</span>
            <span className={`text-xs font-semibold ${isSelected ? config.color : 'text-stone-500'}`}>
              {config.label}
            </span>
            {isSelected && (
              <motion.div
                layoutId="categoryIndicator"
                className={`absolute -top-1 -right-1 w-5 h-5 ${config.bgColor} ${config.borderColor} border-2 rounded-full flex items-center justify-center`}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              >
                <span className="text-xs">✓</span>
              </motion.div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
