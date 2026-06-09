import { useStore } from '@/store/useStore'
import { PROXIMITY_LABELS, PROXIMITY_COLORS, GIFT_CATEGORY_LABELS, GIFT_CATEGORY_COLORS } from '@/types'
import { DollarSign, Gift, TrendingUp, Users, AlertCircle, CheckCircle2, ShoppingCart } from 'lucide-react'
import { useMemo } from 'react'

const proximityBarColors: Record<string, string> = {
  close: 'bg-red-500',
  normal: 'bg-amber-500',
  distant: 'bg-stone-400',
}

const warmColors = [
  'bg-red-500',
  'bg-red-400',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-yellow-400',
  'bg-red-300',
  'bg-orange-400',
  'bg-amber-400',
  'bg-amber-300',
]

export default function Stats() {
  const { relatives, gifts, visits, visitGifts } = useStore()

  const stats = useMemo(() => {
    const totalSpending = visitGifts.reduce((sum, vg) => {
      const gift = gifts.find((g) => g.id === vg.giftId)
      return sum + (gift ? gift.unitPrice * vg.quantity : 0)
    }, 0)

    const relativeSpendings = relatives.map((r) => {
      const rVisits = visits.filter((v) => v.relativeId === r.id)
      const spending = rVisits.reduce((sum, v) => {
        const vgs = visitGifts.filter((vg) => vg.visitId === v.id)
        return sum + vgs.reduce((s, vg) => {
          const gift = gifts.find((g) => g.id === vg.giftId)
          return s + (gift ? gift.unitPrice * vg.quantity : 0)
        }, 0)
      }, 0)
      return { relative: r, spending }
    })

    const avgPerRelative = relatives.length > 0
      ? relativeSpendings.reduce((s, rs) => s + rs.spending, 0) / relatives.length
      : 0

    const totalRedEnvelope = visits.reduce((sum, v) => sum + v.childRedEnvelope, 0)

    const giftCounts = new Map<string, number>()
    visitGifts.forEach((vg) => {
      giftCounts.set(vg.giftId, (giftCounts.get(vg.giftId) || 0) + vg.quantity)
    })
    const giftPopularity = Array.from(giftCounts.entries())
      .map(([giftId, count]) => ({ gift: gifts.find((g) => g.id === giftId), count }))
      .filter((g) => g.gift)
      .sort((a, b) => b.count - a.count)

    const visitedRelativeIds = new Set(visits.map((v) => v.relativeId))
    const relativesWithVisits = relatives.filter((r) => visitedRelativeIds.has(r.id))
    const relativesWithoutVisits = relatives.filter((r) => !visitedRelativeIds.has(r.id))

    const visitsWithUnpurchased = visits.filter((v) => {
      const vgs = visitGifts.filter((vg) => vg.visitId === v.id)
      return vgs.some((vg) => {
        const gift = gifts.find((g) => g.id === vg.giftId)
        return gift && !gift.purchased
      })
    })

    return {
      totalSpending,
      avgPerRelative,
      totalRedEnvelope,
      netSpending: totalSpending - totalRedEnvelope,
      relativeSpendings,
      giftPopularity,
      relativesWithVisits,
      relativesWithoutVisits,
      visitsWithUnpurchased,
    }
  }, [relatives, gifts, visits, visitGifts])

  const maxRelativeSpending = Math.max(...stats.relativeSpendings.map((rs) => rs.spending), 1)
  const maxGiftCount = Math.max(...stats.giftPopularity.map((gp) => gp.count), 1)
  const progressPct = relatives.length > 0
    ? Math.round((stats.relativesWithVisits.length / relatives.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#FFFBEB]">
      <div className="px-4 pt-6 pb-20 max-w-lg mx-auto space-y-6">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-red-700 tracking-wide">📊 走亲统计</h1>
          <p className="text-sm text-amber-700/70 mt-1">一目了然 · 心中有数</p>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-red-600" />
            <h2 className="text-lg font-bold text-red-700">花费总览</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: '总花费', value: stats.totalSpending, icon: DollarSign, color: 'text-red-600' },
              { label: '人均花费', value: stats.avgPerRelative, icon: Users, color: 'text-amber-600' },
              { label: '收红包', value: stats.totalRedEnvelope, icon: TrendingUp, color: 'text-green-600' },
              { label: '净支出', value: stats.netSpending, icon: AlertCircle, color: stats.netSpending >= 0 ? 'text-red-600' : 'text-green-600' },
            ].map((item) => (
              <div key={item.label} className="bg-white/80 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span className="text-xs text-gray-500">{item.label}</span>
                </div>
                <p className={`text-xl font-bold ${item.color}`}>
                  ¥{item.value.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
          {stats.relativeSpendings.length > 0 && stats.relativeSpendings.some((rs) => rs.spending > 0) && (
            <div className="bg-white/80 rounded-xl p-4 shadow-sm space-y-2.5">
              <p className="text-xs text-gray-500 mb-1">各亲戚花费</p>
              {stats.relativeSpendings
                .filter((rs) => rs.spending > 0)
                .sort((a, b) => b.spending - a.spending)
                .map((rs) => (
                  <div key={rs.relative.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{rs.relative.title}</span>
                      <span className="text-xs text-gray-500">¥{rs.spending.toFixed(0)}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${proximityBarColors[rs.relative.proximity]}`}
                        style={{ width: `${(rs.spending / maxRelativeSpending) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-red-600" />
            <h2 className="text-lg font-bold text-red-700">礼品热度</h2>
          </div>
          {stats.giftPopularity.length === 0 ? (
            <div className="bg-white/60 rounded-xl p-4 text-center text-amber-700/60 text-sm">
              暂无礼品数据
            </div>
          ) : (
            <div className="bg-white/80 rounded-xl p-4 shadow-sm space-y-2.5">
              {stats.giftPopularity.slice(0, 8).map((gp, idx) => (
                <div key={gp.gift!.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-4">{idx + 1}</span>
                      <span className="text-sm font-medium text-gray-700">{gp.gift!.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{gp.count}件</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${warmColors[idx % warmColors.length]}`}
                      style={{ width: `${(gp.count / maxGiftCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-red-600" />
            <h2 className="text-lg font-bold text-red-700">安排进度</h2>
          </div>
          <div className="bg-white/80 rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">已安排 {stats.relativesWithVisits.length} / 共 {relatives.length} 位亲戚</span>
                <span className="text-sm font-bold text-red-600">{progressPct}%</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-400 transition-all duration-1000 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {stats.relativesWithoutVisits.length > 0 && (
              <div>
                <p className="text-xs text-amber-600 font-medium mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  未安排拜访
                </p>
                <div className="space-y-1.5">
                  {stats.relativesWithoutVisits.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg">
                      <span className="text-sm text-amber-800">{r.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${PROXIMITY_COLORS[r.proximity]}`}>
                        {PROXIMITY_LABELS[r.proximity]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.visitsWithUnpurchased.length > 0 && (
              <div>
                <p className="text-xs text-red-600 font-medium mb-2 flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  有未购买礼品
                </p>
                <div className="space-y-1.5">
                  {stats.visitsWithUnpurchased.map((v) => {
                    const rel = relatives.find((r) => r.id === v.relativeId)
                    const vgs = visitGifts.filter((vg) => vg.visitId === v.id)
                    const unpurchased = vgs
                      .map((vg) => gifts.find((g) => g.id === vg.giftId))
                      .filter((g) => g && !g.purchased)
                    return (
                      <div key={v.id} className="flex items-center justify-between px-3 py-2 bg-red-50 rounded-lg">
                        <span className="text-sm text-red-800">{rel?.title ?? '—'}</span>
                        <span className="text-xs text-red-500">
                          {unpurchased.map((g) => g!.name).join('、')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {stats.relativesWithoutVisits.length === 0 && stats.visitsWithUnpurchased.length === 0 && (
              <div className="text-center py-2 text-green-600 text-sm">
                <CheckCircle2 className="w-5 h-5 inline-block mr-1" />
                全部安排妥当！
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
