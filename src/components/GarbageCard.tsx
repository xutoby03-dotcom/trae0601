import { motion } from 'framer-motion'
import type { GarbageRecord } from '../types'
import { categoryConfig } from '../utils/category'
import { formatDisposalTime } from '../utils/time'
import { Check, X, AlertTriangle, ArrowRight } from 'lucide-react'
import { useFamilyStore } from '../stores/useFamilyStore'

interface GarbageCardProps {
  record: GarbageRecord
  onMarkDisposed: (id: string) => void
  onCorrect: (id: string) => void
}

export default function GarbageCard({ record, onMarkDisposed, onCorrect }: GarbageCardProps) {
  const { members } = useFamilyStore()
  const catConfig = categoryConfig[record.category]
  const binConfig = categoryConfig[record.binType]
  const member = members.find((m) => m.id === record.memberId)

  const correctedBinConfig = record.correctedBinType
    ? categoryConfig[record.correctedBinType]
    : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`relative rounded-2xl border-2 ${
        record.disposed ? 'border-stone-200 opacity-60' : catConfig.borderColor
      } ${catConfig.bgColor} p-4 transition-all`}
    >
      <div className="flex items-start gap-3">
        {record.photoUrl ? (
          <img
            src={record.photoUrl}
            alt={record.name}
            className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0"
          />
        ) : (
          <div className="text-3xl mt-0.5 flex-shrink-0">{catConfig.emoji}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-stone-800 ${record.disposed ? 'line-through' : ''}`}>
              {record.name}
            </h3>
            {!record.isCorrect && !record.correctedBinType && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-100 px-2 py-0.5 rounded-full"
              >
                <AlertTriangle className="w-3 h-3" />
                分错
              </motion.span>
            )}
            {record.correctedBinType && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                已纠正
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`text-xs font-medium ${catConfig.color} ${catConfig.bgColor} px-1.5 py-0.5 rounded-md`}>
              {catConfig.emoji}{catConfig.label}
            </span>
            <ArrowRight className="w-3 h-3 text-stone-300 flex-shrink-0" />
            <span className={`text-xs font-medium ${binConfig.color} ${binConfig.bgColor} px-1.5 py-0.5 rounded-md`}>
              {binConfig.emoji}{binConfig.label}桶
            </span>
          </div>

          {record.correctedBinType && correctedBinConfig && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-stone-400">正确桶：</span>
              <span className={`text-xs font-medium ${correctedBinConfig.color} ${correctedBinConfig.bgColor} px-1.5 py-0.5 rounded-md`}>
                {correctedBinConfig.emoji}{correctedBinConfig.label}桶
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-1">
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
        </div>

        <div className="flex gap-1 flex-shrink-0">
          {!record.isCorrect && !record.correctedBinType && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onCorrect(record.id)}
              className="p-2 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
              title="纠正分类"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
          {!record.disposed && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onMarkDisposed(record.id)}
              className="p-2 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
              title="标记已扔"
            >
              <Check className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
