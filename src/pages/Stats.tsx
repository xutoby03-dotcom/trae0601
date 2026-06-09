import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { formatDate, getDaysBetween } from '@/utils/helpers'

export default function Stats() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fosters, pets, checkins } = useStore()

  const foster = fosters.find((f) => f.id === id)
  const pet = foster ? pets.find((p) => p.id === foster.petId) : undefined
  const fosterCheckins = checkins.filter((c) => c.fosterId === id)

  if (!foster || !pet) return null

  const days = getDaysBetween(foster.startDate, foster.endDate)
  const today = new Date().toISOString().split('T')[0]
  const elapsedDays = days.filter((d) => d <= today).length
  const completedCount = fosterCheckins.filter((c) => c.completed).length
  const percentage = days.length > 0 ? Math.round((completedCount / days.length) * 100) : 0

  const ringColor =
    percentage > 80
      ? 'stroke-leaf-300'
      : percentage >= 50
        ? 'stroke-warm-400'
        : 'stroke-coral-300'

  const abnormalDays = fosterCheckins.filter(
    (c) => c.abnormalNote && c.abnormalNote.trim() !== ''
  )

  const hasAbnormal = abnormalDays.length > 0
  const normalDays = fosterCheckins.filter((c) => !c.abnormalNote?.trim())

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-warm-500" />
        </button>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-leaf-400" />
          <h1 className="font-display text-xl text-warm-800">寄养统计</h1>
        </div>
      </div>

      <div className="section-card bg-white mb-4">
        <h2 className="font-display text-lg text-warm-700">{pet.name}</h2>
        <p className="text-sm text-warm-400 mt-1">
          {formatDate(foster.startDate)} - {formatDate(foster.endDate)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 rounded-full bg-warm-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-warm-400 transition-all"
              style={{ width: `${days.length > 0 ? (elapsedDays / days.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm text-warm-500">
            {elapsedDays}/{days.length} 天
          </span>
        </div>
      </div>

      <CheckinProgress percentage={percentage} completedCount={completedCount} totalDays={days.length} ringColor={ringColor} />

      <AbnormalTimeline abnormalDays={abnormalDays} normalDays={normalDays} hasAbnormal={hasAbnormal} />

      <SupplyBar supplies={foster.supplies} />
    </div>
  )
}

function CheckinProgress({
  percentage,
  completedCount,
  totalDays,
  ringColor,
}: {
  percentage: number
  completedCount: number
  totalDays: number
  ringColor: string
}) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="section-card bg-white mb-4 flex flex-col items-center py-6">
      <h3 className="font-display text-warm-700 mb-4 self-start">打卡完成率</h3>
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" className="stroke-warm-100" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            className={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-3xl text-warm-700">{percentage}%</span>
        </div>
      </div>
      <p className="text-sm text-warm-400 mt-3">
        已完成 {completedCount}/{totalDays} 天
      </p>
    </div>
  )
}

function AbnormalTimeline({
  abnormalDays,
  normalDays,
  hasAbnormal,
}: {
  abnormalDays: { date: string; abnormalNote: string }[]
  normalDays: { date: string }[]
  hasAbnormal: boolean
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (date: string) => {
    setExpanded((prev) => ({ ...prev, [date]: !prev[date] }))
  }

  const allDays = [...abnormalDays.map((d) => ({ ...d, isAbnormal: true })), ...normalDays.map((d) => ({ ...d, abnormalNote: '', isAbnormal: false }))]
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="section-card bg-white mb-4">
      <h3 className="font-display text-warm-700 mb-3">异常时间线</h3>
      {!hasAbnormal && allDays.length > 0 && (
        <p className="text-sm text-leaf-400 text-center py-4">一切正常 🎉</p>
      )}
      {!hasAbnormal && allDays.length === 0 && (
        <p className="text-sm text-warm-300 text-center py-4">暂无打卡记录</p>
      )}
      <div className="space-y-0">
        {allDays.map((day) => (
          <div key={day.date} className="flex gap-3 relative">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-3 h-3 rounded-full flex-shrink-0 mt-1.5',
                  day.isAbnormal ? 'bg-coral-300' : 'bg-leaf-300'
                )}
              />
              {day !== allDays[allDays.length - 1] && (
                <div className="w-0.5 flex-1 bg-warm-100 my-1" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-warm-500">{formatDate(day.date)}</span>
                {day.isAbnormal && (
                  <button onClick={() => toggle(day.date)} className="text-warm-300 hover:text-warm-500">
                    {expanded[day.date] ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
              {day.isAbnormal && expanded[day.date] && (
                <p className="text-sm text-coral-400 mt-1 animate-fade-in">{day.abnormalNote}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SupplyBar({ supplies }: { supplies: { id: string; name: string; remainingDays: number; totalDays: number }[] }) {
  if (supplies.length === 0) {
    return (
      <div className="section-card bg-white mb-4">
        <h3 className="font-display text-warm-700 mb-3">用品消耗</h3>
        <p className="text-sm text-warm-300 text-center py-4">暂无用品记录</p>
      </div>
    )
  }

  return (
    <div className="section-card bg-white mb-4">
      <h3 className="font-display text-warm-700 mb-3">用品消耗</h3>
      <div className="space-y-3">
        {supplies.map((supply) => {
          const ratio = supply.totalDays > 0 ? supply.remainingDays / supply.totalDays : 0
          const percentage = Math.round(ratio * 100)
          const barColor =
            ratio > 0.5
              ? 'bg-leaf-300'
              : ratio >= 0.3
                ? 'bg-warm-400'
                : 'bg-coral-300'
          const isLow = ratio < 0.3

          return (
            <div key={supply.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-warm-700">{supply.name}</span>
                  {isLow && <span className="tag bg-coral-100 text-coral-400">即将用完</span>}
                </div>
                <span className="text-xs text-warm-400">
                  {supply.remainingDays}/{supply.totalDays} 天
                </span>
              </div>
              <div className="h-2 rounded-full bg-warm-100 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', barColor)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
