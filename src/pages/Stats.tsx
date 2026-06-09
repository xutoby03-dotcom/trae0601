import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePlansStore } from '@/store/plansStore'
import { formatCurrency, formatDate, getStatusLabel, getPackagingStatusLabel } from '@/utils/format'
import { BarChart3, Gift, Calendar, TrendingUp, Users, Cake, ArrowLeft, ChevronRight, Award, Truck, Package, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpendingEntry {
  name: string
  paid: number
  advanced: number
  refunded: number
  net: number
}

export default function Stats() {
  const plans = usePlansStore((s) => s.plans)

  const { currentYear, yearPlans, completedPlans, totalSpent, participantSpending, popularGifts, refundRecords } = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const yearPlans = plans.filter((p) => new Date(p.createdAt).getFullYear() === currentYear)
    const completedPlans = yearPlans.filter((p) => p.status === 'completed')

    const totalSpent = completedPlans.reduce((sum, p) => sum + p.totalBudget, 0)

    const spendingMap = new Map<string, SpendingEntry>()
    yearPlans.forEach((plan) => {
      plan.participants.forEach((pt) => {
        const existing = spendingMap.get(pt.name) ?? { name: pt.name, paid: 0, advanced: 0, refunded: 0, net: 0 }
        if (pt.hasPaid) {
          existing.paid += pt.pledgedAmount
        }
        existing.advanced += pt.advancedAmount
        spendingMap.set(pt.name, existing)
      })
      plan.refundRecords.forEach((r) => {
        const existing = spendingMap.get(r.refundTo) ?? { name: r.refundTo, paid: 0, advanced: 0, refunded: 0, net: 0 }
        existing.refunded += r.amount
        spendingMap.set(r.refundTo, existing)
      })
    })
    const participantSpending = Array.from(spendingMap.values())
      .map((entry) => ({ ...entry, net: entry.paid + entry.advanced - entry.refunded }))
      .filter((e) => e.net !== 0 || e.paid !== 0 || e.advanced !== 0 || e.refunded !== 0)
      .sort((a, b) => b.net - a.net)

    const allCandidates = yearPlans.flatMap((plan) =>
      plan.giftCandidates.map((c) => ({
        name: c.name,
        votes: c.votes.length,
        planName: plan.birthdayPerson,
        planId: plan.id,
      }))
    )
    const popularGifts = allCandidates.sort((a, b) => b.votes - a.votes).slice(0, 10)

    const refundRecords = yearPlans.flatMap((plan) =>
      plan.refundRecords.map((r) => ({
        id: r.id,
        amount: r.amount,
        reason: r.reason,
        refundTo: r.refundTo,
        createdAt: r.createdAt,
        planName: plan.birthdayPerson,
        planId: plan.id,
      }))
    )

    return { currentYear, yearPlans, completedPlans, totalSpent, participantSpending, popularGifts, refundRecords }
  }, [plans])

  const maxGross = participantSpending.length > 0 ? Math.max(...participantSpending.map((s) => s.paid + s.advanced)) : 0
  const uniqueParticipants = new Set(yearPlans.flatMap((p) => p.participants.map((pt) => pt.name))).size

  if (yearPlans.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <nav className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-warm-100">
          <Link to="/" className="p-1.5 rounded-xl hover:bg-warm-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-bark-600" />
          </Link>
          <h1 className="text-lg font-bold text-bark-800 flex-1 text-center">年度统计</h1>
          <Cake className="w-5 h-5 text-warm-500" />
        </nav>
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-warm-50 flex items-center justify-center mb-4">
            <BarChart3 className="w-10 h-10 text-warm-300" />
          </div>
          <p className="text-bark-500 text-lg mb-6">还没有任何计划，快去创建一个吧！</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-warm-500 text-white rounded-2xl font-medium hover:bg-warm-600 transition-colors"
          >
            创建计划 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pb-8">
      <nav className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-warm-100">
        <Link to="/" className="p-1.5 rounded-xl hover:bg-warm-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-bark-600" />
        </Link>
        <h1 className="text-lg font-bold text-bark-800 flex-1 text-center">年度统计</h1>
        <Cake className="w-5 h-5 text-warm-500" />
      </nav>

      <div className="px-4 pt-6 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-bark-500 uppercase tracking-wider mb-3">{currentYear} 年度概览</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-warm-100 text-center">
              <div className="w-9 h-9 rounded-xl bg-warm-50 flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-4.5 h-4.5 text-warm-500" />
              </div>
              <div className="text-2xl font-bold text-bark-800">{yearPlans.length}</div>
              <div className="text-xs text-bark-400 mt-0.5">计划数</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-mint-100 text-center">
              <div className="w-9 h-9 rounded-xl bg-mint-50 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4.5 h-4.5 text-mint-400" />
              </div>
              <div className="text-2xl font-bold text-bark-800">{formatCurrency(totalSpent)}</div>
              <div className="text-xs text-bark-400 mt-0.5">总花费</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-rose-100 text-center">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center mx-auto mb-2">
                <Users className="w-4.5 h-4.5 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-bark-800">{uniqueParticipants}</div>
              <div className="text-xs text-bark-400 mt-0.5">参与人</div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-bark-500 uppercase tracking-wider mb-3">送礼记录时间线</h2>
          {completedPlans.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-warm-100 text-center">
              <Gift className="w-8 h-8 text-bark-300 mx-auto mb-2" />
              <p className="text-bark-400 text-sm">今年还没有完成送礼</p>
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-warm-200" />
              <div className="space-y-4">
                {completedPlans.map((plan) => {
                  const topCandidate = plan.giftCandidates.length > 0
                    ? [...plan.giftCandidates].sort((a, b) => b.votes.length - a.votes.length)[0]
                    : null
                  const orderInfo = plan.orderInfo
                  return (
                    <div key={plan.id} className="relative flex items-start gap-4">
                      <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-warm-500 border-2 border-white shadow-sm z-10" />
                      <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-warm-100">
                        <div className="text-xs text-bark-400 mb-1">{formatDate(plan.birthdayDate)}</div>
                        <div className="font-semibold text-bark-800">{plan.birthdayPerson}</div>
                        {topCandidate && (
                          <div className="flex items-center gap-1.5 mt-1 text-sm text-bark-500">
                            <Gift className="w-3.5 h-3.5 text-warm-500" />
                            <span>{topCandidate.name}</span>
                            <span className="text-bark-300 mx-0.5">·</span>
                            <span className="text-warm-600">{formatCurrency(topCandidate.price)}</span>
                          </div>
                        )}
                        {orderInfo && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            {orderInfo.orderNumber && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bark-50 text-bark-600">
                                <Truck className="w-3 h-3" />{orderInfo.courier || '快递'} {orderInfo.orderNumber}
                              </span>
                            )}
                            {orderInfo.actualArrival ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-mint-50 text-mint-700">
                                <Package className="w-3 h-3" />已到货 {orderInfo.actualArrival}
                              </span>
                            ) : orderInfo.estimatedArrival ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warm-50 text-warm-600">
                                <Package className="w-3 h-3" />预计 {orderInfo.estimatedArrival}
                              </span>
                            ) : null}
                            {orderInfo.packagingStatus !== 'none' && (
                              <span className={cn('px-2 py-0.5 rounded-full',
                                orderInfo.packagingStatus === 'packed' ? 'bg-mint-50 text-mint-700' : 'bg-warm-50 text-warm-600')}>
                                {getPackagingStatusLabel(orderInfo.packagingStatus)}
                              </span>
                            )}
                          </div>
                        )}
                        {!orderInfo && plan.status !== 'completed' && (
                          <div className="mt-2 text-xs text-bark-400">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bark-50 text-bark-500">
                              {getStatusLabel(plan.status)}
                            </span>
                          </div>
                        )}
                        <div className="text-sm text-warm-600 mt-1.5">{formatCurrency(plan.totalBudget)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-bark-500 uppercase tracking-wider mb-3">花费统计</h2>
          {participantSpending.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-warm-100 text-center">
              <p className="text-bark-400 text-sm">暂无花费数据</p>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-warm-100 space-y-4">
              <div className="flex items-center gap-4 text-xs text-bark-400 mb-1">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-warm-500 inline-block" />已付分摊</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-mint-400 inline-block" />垫付</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-rose-300 inline-block" />已退款</span>
              </div>
              {participantSpending.map((entry) => {
                const paidWidth = maxGross > 0 ? (entry.paid / maxGross) * 100 : 0
                const advWidth = maxGross > 0 ? (entry.advanced / maxGross) * 100 : 0
                return (
                  <div key={entry.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-bark-700 font-medium truncate max-w-[6rem]">{entry.name}</span>
                      <span className="text-sm font-semibold text-bark-800">{formatCurrency(entry.net)}</span>
                    </div>
                    <div className="flex h-5 rounded-full overflow-hidden bg-warm-50 gap-px">
                      <div
                        className="h-full bg-warm-500 rounded-l-full transition-all duration-500"
                        style={{ width: `${paidWidth}%` }}
                      />
                      <div
                        className="h-full bg-mint-400 transition-all duration-500"
                        style={{ width: `${advWidth}%` }}
                      />
                    </div>
                    <div className="flex gap-3 text-xs text-bark-400">
                      <span>分摊 <span className="text-warm-600 font-medium">{formatCurrency(entry.paid)}</span></span>
                      <span>垫付 <span className="text-mint-600 font-medium">{formatCurrency(entry.advanced)}</span></span>
                      {entry.refunded > 0 && (
                        <span>退款 <span className="text-rose-500 font-medium">-{formatCurrency(entry.refunded)}</span></span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-bark-500 uppercase tracking-wider mb-3">退款明细</h2>
          {refundRecords.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-warm-100 text-center">
              <p className="text-bark-400 text-sm">暂无退款记录</p>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-rose-100 divide-y divide-rose-50">
              {refundRecords.map((r) => (
                <div key={r.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="text-sm font-medium text-rose-600">-{formatCurrency(r.amount)}</span>
                      <span className="text-xs text-bark-400">→ {r.refundTo}</span>
                    </div>
                    <Link to={`/plan/${r.planId}`} className="text-xs text-bark-400 hover:text-warm-500 transition-colors">
                      {r.planName}
                    </Link>
                  </div>
                  {r.reason && (
                    <p className="text-xs text-bark-400 mt-1 pl-5.5 truncate">{r.reason}</p>
                  )}
                  <p className="text-xs text-bark-300 mt-0.5 pl-5.5">{new Date(r.createdAt).toLocaleDateString('zh-CN')}</p>
                </div>
              ))}
              <div className="px-4 py-2.5 flex items-center justify-between bg-rose-50/50 rounded-b-2xl">
                <span className="text-xs text-bark-500">退款合计</span>
                <span className="text-sm font-semibold text-rose-600">
                  -{formatCurrency(refundRecords.reduce((s, r) => s + r.amount, 0))}
                </span>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-bark-500 uppercase tracking-wider mb-3">热门礼物</h2>
          {popularGifts.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-warm-100 text-center">
              <p className="text-bark-400 text-sm">暂无投票数据</p>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-warm-100 divide-y divide-warm-50">
              {popularGifts.map((gift, index) => {
                const rankColors = ['text-yellow-500', 'text-gray-400', 'text-amber-700']
                return (
                  <Link
                    key={`${gift.planId}-${gift.name}-${index}`}
                    to={`/plan/${gift.planId}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-warm-50 transition-colors"
                  >
                    <div className="w-6 shrink-0 text-center">
                      {index < 3 ? (
                        <Award className={cn('w-5 h-5', rankColors[index])} />
                      ) : (
                        <span className="text-xs font-bold text-bark-400">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-bark-800 truncate">{gift.name}</div>
                      <div className="text-xs text-bark-400 truncate">{gift.planName} 的计划</div>
                    </div>
                    <div className="shrink-0 px-2 py-0.5 rounded-full bg-mint-50 text-mint-400 text-xs font-semibold">
                      {gift.votes} 票
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-bark-300 shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
