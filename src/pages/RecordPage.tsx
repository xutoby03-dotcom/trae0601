import { useStore } from '@/store/useStore'
import ObservationForm from '@/components/ObservationForm'
import ObservationChart from '@/components/ObservationChart'

export default function RecordPage() {
  const { plans, activePlanId, setActivePlan, observations } = useStore()
  const activePlan = plans.find(p => p.id === activePlanId)

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            观察记录
          </h1>
          <p className="text-sm text-slate-400 mt-1">每日记录水母行为指标，追踪驯化适应状态</p>
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
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 text-sm">
                {activePlan.tankNumber}
              </span>
              <span className="text-slate-300">{activePlan.species}</span>
              <span className="text-slate-500 text-sm">
                已记录 {observations.filter(o => o.planId === activePlan.id).length} / {activePlan.totalDays} 天
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ObservationForm planId={activePlan.id} />
              <ObservationChart planId={activePlan.id} />
            </div>
          </div>
        )}

        {!activePlan && plans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500">
            <div className="text-6xl mb-4 opacity-50">📋</div>
            <p className="text-lg mb-2">请先创建驯化计划</p>
            <p className="text-sm">在「驯化计划」页面创建计划后即可开始记录观察数据</p>
          </div>
        )}
      </div>
    </div>
  )
}
