import { useGearStore } from '@/store/gearStore'
import { useUsageStore } from '@/store/usageStore'
import { GEAR_TYPE_LABELS, GEAR_TYPE_ICONS } from '@/types'
import { getTotalUsage } from '@/utils/statusCalc'

const typeColors: Record<string, string> = {
  running_shoe: '#34D399',
  racket: '#60A5FA',
  bicycle: '#FBBF24',
  yoga_mat: '#C084FC',
  other: '#94A3B8',
}

export default function Stats() {
  const gears = useGearStore((s) => s.gears)
  const usageRecords = useUsageStore((s) => s.records)

  const currentYear = new Date().getFullYear()
  const thisYearGears = gears.filter(
    (g) => new Date(g.purchaseDate).getFullYear() === currentYear
  )
  const totalSpent = thisYearGears.reduce((sum, g) => sum + g.price, 0)

  const spendingByType = Object.entries(
    thisYearGears.reduce<Record<string, number>>((acc, g) => {
      acc[g.type] = (acc[g.type] || 0) + g.price
      return acc
    }, {})
  ).map(([type, amount]) => ({
    type,
    amount,
    color: typeColors[type] || '#94A3B8',
  }))

  const usageRanking = gears
    .map((g) => ({
      gear: g,
      totalUsage: getTotalUsage(g, usageRecords),
      recordCount: usageRecords.filter((r) => r.gearId === g.id).length,
    }))
    .filter((item) => item.recordCount > 0)
    .sort((a, b) => b.recordCount - a.recordCount)

  const maxRecordCount =
    usageRanking.length > 0 ? usageRanking[0].recordCount : 1

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#F5F0EB]">
          年度统计
        </h1>
        <p className="mt-1 text-sm text-white/30">
          {currentYear} 年运动装备数据概览
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="text-[10px] uppercase tracking-wider text-white/30">
            今年购买
          </div>
          <div className="mt-2 text-2xl font-bold text-[#F5F0EB]">
            {thisYearGears.length}
            <span className="ml-1 text-sm font-normal text-white/30">件</span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="text-[10px] uppercase tracking-wider text-white/30">
            今年花费
          </div>
          <div className="mt-2 text-2xl font-bold text-[#FF6B35]">
            ¥{totalSpent.toLocaleString()}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="text-[10px] uppercase tracking-wider text-white/30">
            全部装备
          </div>
          <div className="mt-2 text-2xl font-bold text-[#F5F0EB]">
            {gears.length}
            <span className="ml-1 text-sm font-normal text-white/30">件</span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="text-[10px] uppercase tracking-wider text-white/30">
            使用记录
          </div>
          <div className="mt-2 text-2xl font-bold text-[#F5F0EB]">
            {usageRecords.length}
            <span className="ml-1 text-sm font-normal text-white/30">条</span>
          </div>
        </div>
      </div>

      {spendingByType.length > 0 && (
        <div className="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-5 text-sm font-medium text-white/60">
            今年花费分布
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative h-36 w-36 shrink-0">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                {spendingByType.reduce<
                  { type: string; amount: number; color: string; offset: number }[]
                >(
                  (acc, item, i) => {
                    const percent = totalSpent > 0 ? item.amount / totalSpent : 0
                    const offset = i === 0 ? 0 : acc[i - 1].offset + (totalSpent > 0 ? spendingByType[i - 1].amount / totalSpent : 0)
                    acc.push({ ...item, offset })
                    return acc
                  },
                  []
                ).map((item) => {
                  const percent = totalSpent > 0 ? item.amount / totalSpent : 0
                  const circumference = 2 * Math.PI * 14
                  const strokeDash = percent * circumference
                  const strokeOffset = item.offset * circumference
                  return (
                    <circle
                      key={item.type}
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="4"
                      strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                      strokeDashoffset={-strokeOffset}
                      strokeLinecap="round"
                      style={{ filter: `drop-shadow(0 0 2px ${item.color}40)` }}
                    />
                  )
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-[#F5F0EB]">
                  ¥{totalSpent.toLocaleString()}
                </span>
                <span className="text-[9px] text-white/30">总计</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {spendingByType.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-white/60">
                      {GEAR_TYPE_LABELS[item.type as keyof typeof GEAR_TYPE_LABELS] || item.type}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#F5F0EB]">
                    ¥{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {spendingByType.length === 0 && (
        <div className="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-white/30">
            今年还没有购买装备的记录
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="mb-5 text-sm font-medium text-white/60">
          装备使用排行
        </h2>
        {usageRanking.length === 0 ? (
          <div className="py-6 text-center text-sm text-white/30">
            还没有使用记录
          </div>
        ) : (
          <div className="space-y-3">
            {usageRanking.map((item, i) => (
              <div key={item.gear.id} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === 0
                      ? 'bg-[#FF6B35]/20 text-[#FF6B35]'
                      : i === 1
                        ? 'bg-white/10 text-white/60'
                        : i === 2
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-white/5 text-white/30'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm">{GEAR_TYPE_ICONS[item.gear.type]}</span>
                    <span className="text-xs font-medium text-[#F5F0EB]">
                      {item.gear.name}
                    </span>
                    <span className="text-[10px] text-white/30">
                      {item.gear.maxUsageUnit === 'hours' ? (Number.isInteger(item.totalUsage) ? item.totalUsage : Math.round(item.totalUsage * 10) / 10) : Math.round(item.totalUsage)} {item.gear.maxUsageUnit === 'km' ? 'km' : item.gear.maxUsageUnit === 'hours' ? '小时' : '次'}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(item.recordCount / maxRecordCount) * 100}%`,
                        background: `linear-gradient(90deg, ${typeColors[item.gear.type] || '#94A3B8'}60, ${typeColors[item.gear.type] || '#94A3B8'})`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-white/40">
                  {item.recordCount} 次
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
