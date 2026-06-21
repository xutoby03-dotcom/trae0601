import { useStore } from '@/store/useStore'
import AlertPanel from '@/components/AlertPanel'
import AlertSuggestion from '@/components/AlertSuggestion'
import { detectAnomalies } from '@/utils/anomaly'

export default function AlertPage() {
  const { plans, activePlanId, setActivePlan, observations, schedules } = useStore()
  const activePlan = plans.find(p => p.id === activePlanId)

  const planObservations = activePlan
    ? observations.filter(o => o.planId === activePlan.id)
    : []
  const planSchedules = activePlan
    ? schedules.filter(s => s.planId === activePlan.id)
    : []
  const anomalies = activePlan
    ? detectAnomalies(planObservations)
    : []

  const hasAnomalies = anomalies.length > 0

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            异常预警
          </h1>
          <p className="text-sm text-slate-400 mt-1">自动检测连续异常指标，提供调光节奏建议</p>
        </div>

        {!activePlan && plans.length > 0 && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {plans.map(plan => (
              <div
                key={plan.id}
                onClick={() => setActivePlan(plan.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/40 transition-all"
              >
                <span className="text-white text-sm font-medium">{plan.tankNumber}</span>
                <span className="text-slate-400 text-sm">·</span>
                <span className="text-slate-300 text-sm">{plan.species}</span>
              </div>
            ))}
          </div>
        )}

        {activePlan && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 text-sm">
                {activePlan.tankNumber}
              </span>
              <span className="text-slate-300">{activePlan.species}</span>
              {hasAnomalies && (
                <span className="px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/30 text-red-300 text-xs animate-pulse">
                  {anomalies.length} 项异常
                </span>
              )}
              {!hasAnomalies && planObservations.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-green-500/20 border border-green-500/30 text-green-300 text-xs">
                  状态正常
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlertPanel planId={activePlan.id} />
              <AlertSuggestion planId={activePlan.id} />
            </div>
          </div>
        )}

        {!activePlan && plans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500">
            <div className="text-6xl mb-4 opacity-50">⚠️</div>
            <p className="text-lg mb-2">请先创建驯化计划</p>
            <p className="text-sm">在「驯化计划」页面创建计划并记录观察数据后即可查看预警</p>
          </div>
        )}
      </div>
    </div>
  )
}
