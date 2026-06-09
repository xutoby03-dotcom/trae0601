import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GarbageCategory, GarbageRecord } from '../types'
import { categoryConfig, categoryList } from '../utils/category'
import { ArrowRight } from 'lucide-react'

interface CorrectModalProps {
  isOpen: boolean
  onClose: () => void
  onCorrect: (correctedBinType: GarbageCategory) => void
  record: GarbageRecord | undefined
}

export default function CorrectModal({ isOpen, onClose, onCorrect, record }: CorrectModalProps) {
  const [selected, setSelected] = useState<GarbageCategory | null>(null)

  if (!record) return null

  const catConfig = categoryConfig[record.category]
  const binConfig = categoryConfig[record.binType]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-stone-200 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold text-stone-800 mb-2">纠正桶类型</h3>
            <div className="flex items-center gap-2 mb-4 bg-stone-50 rounded-xl p-3">
              <span className="text-sm font-medium text-stone-600">{record.name}</span>
              <span className="text-stone-300">|</span>
              <span className={`text-xs font-medium ${catConfig.color}`}>
                {catConfig.emoji}{catConfig.label}
              </span>
              <ArrowRight className="w-3 h-3 text-stone-300" />
              <span className={`text-xs font-medium ${binConfig.color}`}>
                {binConfig.emoji}{binConfig.label}桶
              </span>
            </div>
            <p className="text-sm text-stone-400 mb-4">选择正确的桶类型：</p>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {categoryList.map((cat) => {
                const config = categoryConfig[cat]
                const isSelected = selected === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setSelected(cat)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `${config.bgColor} ${config.borderColor} shadow-md`
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-2xl">{config.emoji}</span>
                    <span className="text-xs font-medium text-stone-600">{config.label}</span>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => {
                if (selected) {
                  onCorrect(selected)
                  setSelected(null)
                  onClose()
                }
              }}
              disabled={!selected}
              className="w-full py-3 rounded-2xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-200 disabled:text-stone-400 transition-colors"
            >
              确认纠正
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
