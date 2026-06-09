import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePlansStore } from '@/store/plansStore'
import { formatCurrency, formatDate, formatShortDate } from '@/utils/format'
import { BarChart3, Gift, Calendar, TrendingUp, Users, Heart, Cake, ArrowLeft, ChevronRight, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Stats() {
  const plans = usePlansStore((s) => s.plans)

  const { currentYear, yearPlans, completedPlans, totalSpent, participantSpending, popularGifts } = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const yearPlans = plans.filter((p) => new Date(p.createdAt).getFullYear() === currentYear)
    const completedPlans = yearPlans.filter((p) => p.status === 'completed')

    const totalSpent = completedPlans.reduce((sum, p) => sum + p.totalBudget, 0)

    const spendingMap = new Map<string, number>()
    yearPlans.forEach((plan) => {
      plan.participants.forEach((pt) => {
        spendingMap.set(pt.name, (spendingMap.get(pt.name) ?? 0) + pt.pledgedAmount)
      })
    })
    const participantSpending = Array.from(spendingMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)

    const allCandidates = yearPlans.flatMap((plan) =>
      plan.giftCandidates.map((c) => ({
        name: c.name,
        votes: c.votes.length,
        planName: plan.birthdayPerson,
        planId: plan.id,
      }))
    )
    const popularGifts = allCandidates.sort((a, b) => b.votes - a.votes).slice(0, 10)

    return { currentYear, yearPlans, completedPlans, totalSpent, participantSpending, popularGifts }
  }, [plans])

  const maxSpending = participantSpending.length > 0 ? participantSpending[0].amount : 0
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
                  return (
                    <div key={plan.id} className="relative flex items-start gap-4">
                      <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-warm-500 border-2 border-white shadow-sm z-10" />
                      <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-warm-100">
                        <div className="text-xs text-bark-400 mb-1">{formatDate(plan.birthdayDate)}</div>
                        <div className="font-semibold text-bark-800">{plan.birthdayPerson}</div>
                        {topCandidate && (
                          <div className="flex items-center gap-1.5 mt-1 text-sm text-bark-500">
                            <Gift className="w-3.5 h-3.5" />
                            <span>{topCandidate.name}</span>
                          </div>
                        )}
                        <div className="text-sm text-warm-600 mt-1">{formatCurrency(plan.totalBudget)}</div>
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
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-warm-100 space-y-3">
              {participantSpending.map(({ name, amount }) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-16 text-sm text-bark-700 truncate shrink-0">{name}</div>
                  <div className="flex-1 h-6 bg-warm-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warm-500 rounded-full transition-all duration-500"
                      style={{ width: maxSpending > 0 ? `${(amount / maxSpending) * 100}%` : '0%' }}
                    />
                  </div>
                  <div className="text-sm font-medium text-bark-700 shrink-0 w-20 text-right">{formatCurrency(amount)}</div>
                </div>
              ))}
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
                  <div key={`${gift.planId}-${gift.name}-${index}`} className="flex items-center gap-3 px-4 py-3">
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
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
