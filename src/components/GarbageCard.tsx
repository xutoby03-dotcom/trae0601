import { motion } from 'framer-motion'
import type { GarbageRecord } from '../types'
import { categoryConfig } from '../utils/category'
import { formatDisposalTime } from '../utils/time'
import { Check, X, AlertTriangle } from 'lucide-react'
import { useFamilyStore } from '../stores/useFamilyStore'

interface GarbageCardProps {
  record: GarbageRecord
  onMarkDisposed: (id: string) => void
  onCorrect: (id: string) => void
}

export default function GarbageCard({ record, onMarkDisposed, onCorrect }: GarbageCardProps) {
  const { members } = useFamilyStore()
  const config = categoryConfig[record.category]
  const member = members.find((m) => m.id === record.memberId)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`relative rounded-2xl border-2 ${record.disposed ? 'border-stone-200 opacity-60' : config.borderColor} ${config.bgColor} p-4 transition-all`}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl mt-0.5">{config.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-stone-800 ${record.disposed ? 'line-through' : ''}`}>
              {record.name}
            </h3>
            {!record.isCorrect && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-100 px-2 py-0.5 rounded-full"
              >
                <AlertTriangle className="w-3 h-3" />
                分错
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-stone-400">|</span>
            <span className="text-xs text-stone-500">
              {member?.avatar} {member?.name}
            </span>
            <span className="text-xs text-stone-400">|</span>
            <span className="text-xs text-stone-400">
              {formatDisposalTime(record.disposalTime)}
            </span>
          </div>
          {record.notes && (
            <p className="text-xs text-stone-400 mt-1 truncate">{record.notes}</p>
          )}
          {!record.isCorrect && record.correctedCategory && (
            <p className="text-xs text-emerald-600 mt-1">
              已纠正为 → {categoryConfig[record.correctedCategory].emoji} {categoryConfig[record.correctedCategory].label}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {!record.isCorrect && !record.correctedCategory && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onCorrect(record.id)}
              className="p-2 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
          {!record.disposed && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onMarkDisposed(record.id)}
              className="p-2 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
            >
              <Check className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
