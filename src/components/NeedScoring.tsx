import { usePlanStore } from '@/store/planStore'
import { calculateMatchScore } from '@/utils/needScore'
import { Gamepad2, Briefcase, Tv, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FamilyNeeds, MatchScore } from '@/types'

const NEED_CONFIG: { key: keyof FamilyNeeds; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'gaming', label: '打游戏', icon: <Gamepad2 size={16} />, color: '#8b5cf6' },
  { key: 'remoteWork', label: '远程办公', icon: <Briefcase size={16} />, color: '#3b82f6' },
  { key: 'elderlyTV', label: '老人看电视', icon: <Tv size={16} />, color: '#10b981' },
  { key: 'multiVideo', label: '多人刷视频', icon: <Users size={16} />, color: '#f59e0b' },
]

export default function NeedScoring() {
  const { plans, familyNeeds, setFamilyNeeds } = usePlanStore()

  const activeNeeds = Object.entries(familyNeeds)
    .filter(([, v]) => v)
    .map(([k]) => k as keyof FamilyNeeds)

  if (plans.length === 0) return null

  const scores = plans.map((plan) => ({
    plan,
    match: calculateMatchScore(plan, familyNeeds),
  }))

  const hasActiveNeeds = activeNeeds.length > 0
  const bestOverall = hasActiveNeeds
    ? Math.max(...scores.map((s) => s.match.overall))
    : 0

  return (
    <div>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
        <span className="text-xl">🎯</span>
        家庭需求匹配度
      </h3>

      <div className="mb-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-medium text-slate-600">
          选择你家的使用场景：
        </p>
        <div className="flex flex-wrap gap-3">
          {NEED_CONFIG.map((need) => (
            <button
              key={need.key}
              onClick={() =>
                setFamilyNeeds({ [need.key]: !familyNeeds[need.key] })
              }
              className={cn(
                'flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all active:scale-95',
                familyNeeds[need.key]
                  ? 'border-transparent text-white shadow-md'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              )}
              style={
                familyNeeds[need.key]
                  ? { backgroundColor: need.color, borderColor: need.color }
                  : undefined
              }
            >
              {need.icon}
              {need.label}
            </button>
          ))}
        </div>
      </div>

      {!hasActiveNeeds ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <p className="text-sm text-slate-400">请先选择使用场景查看匹配度</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scores.map(({ plan, match }) => (
            <ScoreCard
              key={plan.id}
              planName={plan.name}
              score={match}
              isBest={match.overall === bestOverall && plans.length > 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ScoreCard({
  planName,
  score,
  isBest,
}: {
  planName: string
  score: MatchScore
  isBest: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-5 shadow-sm transition-all',
        isBest
          ? 'border-emerald-200 bg-emerald-50/50 shadow-emerald-100'
          : 'border-slate-100 bg-white'
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-base font-bold text-slate-800">{planName}</h4>
        {isBest && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            最匹配
          </span>
        )}
      </div>

      <div className="mb-4 flex items-center justify-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke={isBest ? '#10b981' : '#ff6b35'}
              strokeWidth="6"
              strokeDasharray={`${(score.overall / 100) * 213.6} 213.6`}
              strokeLinecap="round"
            />
          </svg>
          <span
            className={cn(
              'absolute text-xl font-black',
              isBest ? 'text-emerald-600' : 'text-[#ff6b35]'
            )}
          >
            {score.overall}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {NEED_CONFIG.map((need) => {
          const val = score[need.key]
          return (
            <div key={need.key} className="flex items-center gap-2">
              <span className="w-16 text-xs text-slate-500">{need.label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${val}%`,
                    backgroundColor: need.color,
                  }}
                />
              </div>
              <span className="w-8 text-right text-xs font-semibold text-slate-700">
                {val}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
