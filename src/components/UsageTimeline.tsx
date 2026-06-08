import { motion } from 'framer-motion'
import type { UsageRecord } from '@/types'

interface UsageTimelineProps {
  records: UsageRecord[]
  medicineName: string
}

export default function UsageTimeline({ records }: UsageTimelineProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">暂无使用记录</p>
      </div>
    )
  }

  const sorted = [...records].sort((a, b) =>
    new Date(b.usageDate).getTime() - new Date(a.usageDate).getTime()
  )

  return (
    <div className="relative pl-6">
      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-amber-100" />
      {sorted.map((record, i) => (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="relative mb-4 last:mb-0"
        >
          <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-emerald-400 z-10" />
          <div className="bg-white rounded-lg p-3 border border-amber-100/60 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{record.usageDate}</span>
              <span className="text-xs font-medium text-emerald-600">
                -{record.amount}
              </span>
            </div>
            {record.note && (
              <p className="text-sm text-gray-600 mt-1">{record.note}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
