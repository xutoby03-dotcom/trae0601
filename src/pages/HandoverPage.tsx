import { useStore } from '@/store/useStore'
import HandoverCard from '@/components/HandoverCard'

export default function HandoverPage() {
  const { plans, activePlanId, setActivePlan } = useStore()
  const activePlan = plans.find(p => p.id === activePlanId)

  return (
    <div className="min-h-screen p-6 print:p-0">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 print:hidden">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            交接卡
          </h1>
          <p className="text-sm text-slate-400 mt-1">生成可打印的灯谱交接卡，确保早晚班参数一致</p>
        </div>

        {!activePlan && plans.length > 0 && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2 print:hidden">
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
          <HandoverCard planId={activePlan.id} />
        )}

        {!activePlan && plans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 print:hidden">
            <div className="text-6xl mb-4 opacity-50">🖨️</div>
            <p className="text-lg mb-2">请先创建驯化计划</p>
            <p className="text-sm">创建计划并记录数据后即可生成交接卡</p>
          </div>
        )}
      </div>
    </div>
  )
}
