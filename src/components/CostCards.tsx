import { usePlanStore } from '@/store/planStore'
import { calculateCost, getMonthlyAvg } from '@/utils/costCalc'
import { TrendingUp, Calendar, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CostCards() {
  const { plans } = usePlanStore()

  if (plans.length === 0) return null

  const planCosts = plans.map((plan) => ({
    plan,
    cost12: calculateCost(plan, 12),
    cost24: calculateCost(plan, 24),
    avg12: getMonthlyAvg(plan, 12),
    avg24: getMonthlyAvg(plan, 24),
  }))

  const minCost12 = Math.min(...planCosts.map((pc) => pc.cost12.months12))
  const minCost24 = Math.min(...planCosts.map((pc) => pc.cost24.months24))

  return (
    <div>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
        <Coins size={20} className="text-[#ff6b35]" />
        真实总成本
      </h3>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-500">12个月总成本</span>
          </div>
          <div className="space-y-3">
            {planCosts.map((pc) => (
              <CostBar
                key={pc.plan.id}
                name={pc.plan.name}
                total={pc.cost12.months12}
                avg={pc.avg12}
                breakdown={pc.cost12.breakdown}
                isBest={pc.cost12.months12 === minCost12 && plans.length > 1}
                maxTotal={Math.max(...planCosts.map((p) => p.cost12.months12))}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-500">24个月总成本</span>
          </div>
          <div className="space-y-3">
            {planCosts.map((pc) => (
              <CostBar
                key={pc.plan.id}
                name={pc.plan.name}
                total={pc.cost24.months24}
                avg={pc.avg24}
                breakdown={pc.cost24.breakdown}
                isBest={pc.cost24.months24 === minCost24 && plans.length > 1}
                maxTotal={Math.max(...planCosts.map((p) => p.cost24.months24))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CostBar({
  name,
  total,
  avg,
  breakdown,
  isBest,
  maxTotal,
}: {
  name: string
  total: number
  avg: number
  breakdown: { monthlyTotal: number; installFee: number; routerFee: number; discountSaving: number }
  isBest: boolean
  maxTotal: number
}) {
  const widthPercent = maxTotal > 0 ? (total / maxTotal) * 100 : 0

  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">
          {name}
          {isBest && (
            <span className="ml-2 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700">
              最省
            </span>
          )}
        </span>
        <span className={cn('text-base font-bold', isBest ? 'text-emerald-600' : 'text-slate-800')}>
          {total}元
        </span>
      </div>

      <div className="mb-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isBest ? 'bg-emerald-400' : 'bg-[#ff6b35]'
          )}
          style={{ width: `${widthPercent}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
        <span>月费合计 {breakdown.monthlyTotal}元</span>
        {breakdown.installFee > 0 && <span>安装 {breakdown.installFee}元</span>}
        {breakdown.routerFee > 0 && <span>路由器 {breakdown.routerFee}元</span>}
        {breakdown.discountSaving > 0 && (
          <span className="text-emerald-600">省 {breakdown.discountSaving}元</span>
        )}
        <span className="font-medium text-slate-700">均 {avg}元/月</span>
      </div>
    </div>
  )
}
