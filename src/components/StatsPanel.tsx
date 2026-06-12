import { Users, Target, DollarSign, TrendingUp } from 'lucide-react'
import { useReferralStore } from '@/store/referralStore'
import { POSITIONS, PIPELINE_STATUS_LABELS, PIPELINE_STATUS_DOT } from '@/types'
import { cn } from '@/lib/utils'
import type { PipelineStatus } from '@/types'

export default function StatsPanel() {
  const candidates = useReferralStore((s) => s.candidates)

  const total = candidates.length
  const hired = candidates.filter((c) => c.status === 'hired').length
  const conversionRate = total > 0 ? ((hired / total) * 100).toFixed(1) : '0'

  const positionCount = POSITIONS.reduce<Record<string, number>>((acc, p) => {
    acc[p] = candidates.filter((c) => c.targetPosition === p).length
    return acc
  }, {})
  const maxPositionCount = Math.max(1, ...Object.values(positionCount))

  const pendingBonus = candidates
    .filter((c) => c.bonusStatus === 'pending')
    .reduce((sum, c) => sum + c.bonusAmount, 0)
  const availableBonus = candidates
    .filter((c) => c.bonusStatus === 'available')
    .reduce((sum, c) => sum + c.bonusAmount, 0)

  const statusCounts: Record<PipelineStatus, number> = {
    pending: 0,
    scheduling: 0,
    technical: 0,
    final: 0,
    hired: 0,
    rejected: 0,
  }
  candidates.forEach((c) => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1
  })

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-warm-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-warm-600">内推总人数</p>
              <p className="text-2xl font-bold text-charcoal mt-0.5">{total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-warm-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-warm-600">内推转化率</p>
              <p className="text-2xl font-bold text-charcoal mt-0.5">
                {conversionRate}%
                <span className="text-sm font-normal text-warm-500 ml-1">
                  ({hired}/{total})
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-warm-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Target size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-warm-600">奖金待确认</p>
              <p className="text-2xl font-bold text-charcoal mt-0.5">
                ¥{pendingBonus.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-warm-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terra/10 flex items-center justify-center">
              <DollarSign size={20} className="text-terra" />
            </div>
            <div>
              <p className="text-sm text-warm-600">可发放奖金</p>
              <p className="text-2xl font-bold text-charcoal mt-0.5">
                ¥{availableBonus.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-warm-200 p-5">
          <h3 className="text-base font-semibold text-charcoal mb-4">
            各岗位候选量
          </h3>
          <div className="space-y-3">
            {POSITIONS.filter((p) => positionCount[p] > 0).length === 0 ? (
              <p className="text-center py-6 text-warm-500 text-sm">暂无数据</p>
            ) : (
              POSITIONS.filter((p) => positionCount[p] > 0).map((p) => {
                const count = positionCount[p]
                const percent = (count / maxPositionCount) * 100
                return (
                  <div key={p}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-warm-700 font-medium">{p}</span>
                      <span className="text-warm-500">{count} 人</span>
                    </div>
                    <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sand to-terra rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-warm-200 p-5">
          <h3 className="text-base font-semibold text-charcoal mb-4">
            流程状态分布
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(statusCounts) as PipelineStatus[]).map((s) => (
              <div
                key={s}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-warm-50/80 border border-warm-100"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      PIPELINE_STATUS_DOT[s]
                    )}
                  />
                  <span className="text-sm text-warm-700">
                    {PIPELINE_STATUS_LABELS[s]}
                  </span>
                </div>
                <span className="text-sm font-semibold text-charcoal">
                  {statusCounts[s]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
