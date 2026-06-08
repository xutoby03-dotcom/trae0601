import type { UsageRecord } from '@/types'
import { USAGE_UNIT_LABELS } from '@/types'

interface TimelineProps {
  records: UsageRecord[]
  unit: string
}

export default function Timeline({ records, unit }: TimelineProps) {
  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (sorted.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-white/30">
        暂无使用记录
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
      {sorted.map((record, i) => {
        const value =
          unit === 'km'
            ? record.distance
            : unit === 'hours'
              ? record.duration
              : record.count
        return (
          <div key={record.id} className="relative flex items-start gap-4 py-3">
            <div
              className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                i === 0
                  ? 'border-[#FF6B35] bg-[#FF6B35]/30'
                  : 'border-white/20 bg-[#0F1F17]'
              }`}
            />
            <div className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#F5F0EB]">
                  {value} {USAGE_UNIT_LABELS[unit as keyof typeof USAGE_UNIT_LABELS] || unit}
                </span>
                <span className="text-[11px] text-white/30">{record.date}</span>
              </div>
              {record.note && (
                <p className="mt-1 text-xs text-white/40">{record.note}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
