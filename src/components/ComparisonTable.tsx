import { usePlanStore } from '@/store/planStore'
import { calculateCost, getMonthlyAvg } from '@/utils/costCalc'
import { cn } from '@/lib/utils'
import type { Plan } from '@/types'

export default function ComparisonTable() {
  const { plans } = usePlanStore()

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-16">
        <div className="mb-3 text-5xl">📊</div>
        <p className="text-base font-medium text-slate-500">
          请先录入套餐
        </p>
        <p className="mt-1 text-sm text-slate-400">
          至少添加一个套餐才能查看对比
        </p>
      </div>
    )
  }

  const cost12 = plans.map((p) => calculateCost(p, 12))
  const cost24 = plans.map((p) => calculateCost(p, 24))
  const avg12 = plans.map((p) => getMonthlyAvg(p, 12))
  const avg24 = plans.map((p) => getMonthlyAvg(p, 24))

  const minCost12 = Math.min(...cost12.map((c) => c.months12))
  const minCost24 = Math.min(...cost24.map((c) => c.months24))
  const maxSpeed = Math.max(...plans.map((p) => p.speed))
  const minFee = Math.min(...plans.map((p) => p.monthlyFee))
  const minContract = Math.min(...plans.map((p) => p.contractMonths))
  const minEarlyFee = Math.min(...plans.map((p) => p.earlyTerminationFee))

  const rows: { label: string; getValues: (p: Plan, i: number) => { text: string; best?: boolean; worst?: boolean } }[] = [
    {
      label: '月租（元/月）',
      getValues: (p) => ({
        text: p.monthlyFee.toString(),
        best: p.monthlyFee === minFee && plans.length > 1,
      }),
    },
    {
      label: '优惠月租（元/月）',
      getValues: (p) => ({
        text: p.discountedFee > 0 ? p.discountedFee.toString() : '无',
        best: false,
      }),
    },
    {
      label: '宽带速率',
      getValues: (p) => ({
        text: `${p.speed}Mbps`,
        best: p.speed === maxSpeed && plans.length > 1,
      }),
    },
    {
      label: '上传速率',
      getValues: (p) => ({
        text: p.uploadSpeed > 0 ? `${p.uploadSpeed}Mbps` : '未标注',
        best: false,
        worst: p.speed >= 200 && !p.uploadSpeed,
      }),
    },
    {
      label: '合约期',
      getValues: (p) => ({
        text: `${p.contractMonths}个月`,
        best: p.contractMonths === minContract && plans.length > 1,
      }),
    },
    {
      label: '安装费',
      getValues: (p) => ({
        text: p.installFee > 0 ? `${p.installFee}元` : '免费',
        best: p.installFee === 0,
      }),
    },
    {
      label: '路由器费',
      getValues: (p) => ({
        text: p.routerFee > 0 ? `${p.routerFee}元` : '免费',
        best: p.routerFee === 0,
      }),
    },
    {
      label: '赠送流量/话费',
      getValues: (p) => ({
        text: p.freeData || '无',
        best: false,
      }),
    },
    {
      label: '电视包',
      getValues: (p) => ({
        text: p.tvPackage || '无',
        best: false,
      }),
    },
    {
      label: '提前解约费',
      getValues: (p) => ({
        text: p.earlyTerminationFee > 0 ? `${p.earlyTerminationFee}元` : '无',
        best: p.earlyTerminationFee === minEarlyFee && plans.length > 1,
        worst: p.earlyTerminationFee >= 500,
      }),
    },
    {
      label: '优惠截止',
      getValues: (p) => ({
        text: p.discountEndDate || '无',
        best: false,
      }),
    },
    {
      label: '12个月总成本',
      getValues: (p, i) => ({
        text: `${cost12[i].months12}元`,
        best: cost12[i].months12 === minCost12 && plans.length > 1,
      }),
    },
    {
      label: '24个月总成本',
      getValues: (p, i) => ({
        text: `${cost24[i].months24}元`,
        best: cost24[i].months24 === minCost24 && plans.length > 1,
      }),
    },
    {
      label: '12月均月费',
      getValues: (_, i) => ({
        text: `${avg12[i]}元/月`,
      }),
    },
    {
      label: '24月均月费',
      getValues: (_, i) => ({
        text: `${avg24[i]}元/月`,
      }),
    },
  ]

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
      <table className="w-full min-w-[600px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-600">
              对比项
            </th>
            {plans.map((p) => (
              <th
                key={p.id}
                className="px-4 py-3 text-center font-bold text-slate-800"
              >
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={cn(
                'border-b border-slate-50 transition-colors hover:bg-orange-50/30',
                ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
              )}
            >
              <td className="sticky left-0 z-10 bg-inherit px-4 py-2.5 font-medium text-slate-600">
                {row.label}
              </td>
              {plans.map((p, pi) => {
                const val = row.getValues(p, pi)
                return (
                  <td
                    key={p.id}
                    className={cn(
                      'px-4 py-2.5 text-center',
                      val.best && 'font-bold text-emerald-600',
                      val.worst && 'font-bold text-red-500'
                    )}
                  >
                    <span className="relative">
                      {val.text}
                      {val.best && (
                        <span className="ml-1 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700">
                          最优
                        </span>
                      )}
                      {val.worst && (
                        <span className="ml-1 inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">
                          注意
                        </span>
                      )}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
