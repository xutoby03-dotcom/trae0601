import { useMemo } from 'react'
import type { Member } from '@/types'
import { getEffectiveWater } from '@/types'
import { useFamilyStore } from '@/stores/familyStore'
import { getMemberStatus, getMemberProgress } from '@/utils/drinkUtils'
import { Plus, Droplets } from 'lucide-react'

interface CupCardProps {
  member: Member
  onQuickRecord: (memberId: string) => void
  onClick: (memberId: string) => void
}

export default function CupCard({ member, onQuickRecord, onClick }: CupCardProps) {
  const records = useFamilyStore((s) => s.records)

  const todayRecords = useMemo(() => {
    const today = new Date()
    return records.filter((r) => {
      const rd = new Date(r.timestamp)
      return r.memberId === member.id &&
        rd.getFullYear() === today.getFullYear() &&
        rd.getMonth() === today.getMonth() &&
        rd.getDate() === today.getDate()
    })
  }, [records, member.id])

  const effectiveWater = useMemo(() => {
    return todayRecords.reduce((sum, r) => sum + getEffectiveWater(r.amount, r.drinkType), 0)
  }, [todayRecords])

  const progress = getMemberProgress(member, effectiveWater)
  const percent = Math.round(progress * 100)
  const hour = new Date().getHours()
  const status = getMemberStatus(member, effectiveWater, hour)
  const lastRecord = todayRecords.length > 0
    ? todayRecords[todayRecords.length - 1]
    : null

  const isCompleted = progress >= 1
  const fillColor = isCompleted ? '#81C784' : member.color
  const fillHeight = `${Math.min(percent, 100)}%`

  return (
    <div
      className="relative glass-card rounded-2xl p-4 pb-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
      onClick={() => onClick(member.id)}
    >
      <div className="absolute top-3 right-3 z-10">
        <button
          className="btn-ripple w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ background: fillColor }}
          onClick={(e) => {
            e.stopPropagation()
            onQuickRecord(member.id)
          }}
          title="快捷记录一杯"
        >
          <Plus size={18} strokeWidth={3} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="text-3xl animate-float" style={{ animationDelay: `${Math.random() * 2}s` }}>
          {member.avatar}
        </div>

        <div className="font-display font-semibold text-gray-700 text-sm">
          {member.name}
        </div>

        <div className="relative w-16 h-24 rounded-b-2xl rounded-t-lg overflow-hidden border-2 border-gray-200/60"
          style={{ borderColor: `${fillColor}40` }}
        >
          <div
            className="absolute bottom-0 left-0 right-0 water-fill rounded-b-xl"
            style={{
              height: fillHeight,
              background: `linear-gradient(180deg, ${fillColor}90 0%, ${fillColor} 100%)`,
            }}
          >
            {percent > 15 && (
              <div className="absolute top-0 left-0 right-0 h-2 overflow-hidden opacity-40">
                <div
                  className="w-[200%] h-full animate-wave"
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)`,
                  }}
                />
              </div>
            )}
            {percent > 30 && (
              <>
                <div className="absolute w-1.5 h-1.5 bg-white/40 rounded-full animate-bubble left-[20%] top-[30%]" />
                <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-bubble left-[60%] top-[50%]" style={{ animationDelay: '0.8s' }} />
              </>
            )}
          </div>

          {isCompleted && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-lg">🎉</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Droplets size={12} style={{ color: fillColor }} />
          <span className="text-xs font-bold font-display" style={{ color: fillColor }}>
            {percent}%
          </span>
        </div>

        <div className="text-xs text-gray-400 font-body text-center leading-tight">
          {status}
        </div>

        {lastRecord && (
          <div className="text-[10px] text-gray-300 flex items-center gap-1">
            <span>{getEffectiveWater(lastRecord.amount, lastRecord.drinkType)}ml</span>
            <span>·</span>
            <span>{new Date(lastRecord.timestamp).getHours()}:{String(new Date(lastRecord.timestamp).getMinutes()).padStart(2, '0')}</span>
          </div>
        )}
      </div>
    </div>
  )
}
