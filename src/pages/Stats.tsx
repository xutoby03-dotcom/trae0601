import { useStore } from '@/store/useStore'
import { CATEGORIES, PRE_MOODS, CATEGORY_COLORS, MOOD_COLORS, MOOD_EMOJIS } from '@/types'
import type { Category, PreMood, Expense, CoolItem, BudgetConfig } from '@/types'
import { formatAmount } from '@/utils/helpers'
import { BarChart3, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react'

interface MoodStat {
  mood: PreMood
  total: number
  count: number
}

interface HeatmapCell {
  category: Category
  mood: PreMood
  total: number
}

interface CatNonPlanned {
  category: Category
  pct: number
  total: number
}

interface MoodRegretRate {
  mood: PreMood
  rate: number
  total: number
}

interface BudgetUsage {
  category: Category
  pct: number
  spent: number
  limit: number
}

export default function Stats() {
  const { expenses, coolItems, budgets } = useStore()

  const moodStats: MoodStat[] = PRE_MOODS.map((mood: PreMood) => {
    const moodExpenses = expenses.filter((e: Expense) => e.preMood === mood)
    return {
      mood,
      total: moodExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0),
      count: moodExpenses.length,
    }
  })
    .filter((s: MoodStat) => s.total > 0)
    .sort((a: MoodStat, b: MoodStat) => b.total - a.total)

  const maxMoodTotal = moodStats.length > 0 ? moodStats[0].total : 0

  const heatmapData: HeatmapCell[] = []
  let heatmapMax = 0
  for (const cat of CATEGORIES) {
    for (const mood of PRE_MOODS) {
      const total = expenses
        .filter((e: Expense) => e.category === cat && e.preMood === mood)
        .reduce((sum: number, e: Expense) => sum + e.amount, 0)
      if (total > 0) {
        heatmapData.push({ category: cat, mood, total })
        if (total > heatmapMax) heatmapMax = total
      }
    }
  }

  const getHeatmapValue = (cat: Category, mood: PreMood): number => {
    const cell = heatmapData.find((c: HeatmapCell) => c.category === cat && c.mood === mood)
    return cell ? cell.total : 0
  }

  const reviewedExpenses = expenses.filter((e: Expense) => e.regretStatus)
  const regretCount = reviewedExpenses.filter((e: Expense) => e.regretStatus === '后悔').length
  const noRegretCount = reviewedExpenses.filter((e: Expense) => e.regretStatus === '不后悔').length
  const replaceableCount = reviewedExpenses.filter((e: Expense) => e.regretStatus === '可替代').length
  const reviewedTotal = reviewedExpenses.length

  const regretAvg =
    regretCount > 0
      ? reviewedExpenses
          .filter((e: Expense) => e.regretStatus === '后悔')
          .reduce((s: number, e: Expense) => s + e.amount, 0) / regretCount
      : 0

  const noRegretAvg =
    noRegretCount > 0
      ? reviewedExpenses
          .filter((e: Expense) => e.regretStatus === '不后悔')
          .reduce((s: number, e: Expense) => s + e.amount, 0) / noRegretCount
      : 0

  const reminders: string[] = []

  if (moodStats.length > 0) {
    const topMood = moodStats[0]
    reminders.push(
      `你在${topMood.mood}时最容易花钱，已花¥${formatAmount(topMood.total)}。下次${topMood.mood}时试试先冷静24小时。`
    )
  }

  const categoryNonPlanned: CatNonPlanned[] = CATEGORIES.map((cat: Category) => {
    const catExpenses = expenses.filter((e: Expense) => e.category === cat)
    const nonPlanned = catExpenses.filter((e: Expense) => !e.isPlanned)
    const pct = catExpenses.length > 0 ? (nonPlanned.length / catExpenses.length) * 100 : 0
    return { category: cat, pct, total: catExpenses.length }
  })
    .filter((c: CatNonPlanned) => c.total > 0)
    .sort((a: CatNonPlanned, b: CatNonPlanned) => b.pct - a.pct)

  if (categoryNonPlanned.length > 0 && categoryNonPlanned[0].pct > 0) {
    const top = categoryNonPlanned[0]
    reminders.push(
      `你的${top.category}消费中${top.pct.toFixed(0)}%是非计划的，试试提前规划。`
    )
  }

  const moodRegretRates: MoodRegretRate[] = PRE_MOODS.map((mood: PreMood) => {
    const moodReviewed = reviewedExpenses.filter((e: Expense) => e.preMood === mood)
    const moodRegret = moodReviewed.filter((e: Expense) => e.regretStatus === '后悔')
    const rate = moodReviewed.length > 0 ? (moodRegret.length / moodReviewed.length) * 100 : 0
    return { mood, rate, total: moodReviewed.length }
  })
    .filter((m: MoodRegretRate) => m.total >= 2)
    .sort((a: MoodRegretRate, b: MoodRegretRate) => b.rate - a.rate)

  if (moodRegretRates.length > 0 && moodRegretRates[0].rate > 0) {
    const top = moodRegretRates[0]
    reminders.push(
      `你在${top.mood}时花的钱最容易后悔（${top.rate.toFixed(0)}%），注意觉察这个模式。`
    )
  }

  const budgetUsage: BudgetUsage[] = budgets.map((b: BudgetConfig) => {
    const spent = expenses
      .filter((e: Expense) => e.category === b.category)
      .reduce((s: number, e: Expense) => s + e.amount, 0)
    const pct = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0
    return { category: b.category, pct, spent, limit: b.monthlyLimit }
  })

  const nearBudget = budgetUsage
    .filter((b: BudgetUsage) => b.pct >= 50)
    .sort((a: BudgetUsage, b: BudgetUsage) => b.pct - a.pct)

  if (nearBudget.length > 0) {
    const top = nearBudget[0]
    reminders.push(
      `你的${top.category}预算已用${top.pct.toFixed(0)}%，注意控制。`
    )
  }

  const savedByCoolZone = coolItems
    .filter((i: CoolItem) => i.decision === '不买')
    .reduce((s: number, i: CoolItem) => s + i.estimatedPrice, 0)

  if (savedByCoolZone > 0) {
    reminders.push(
      `冷静区帮你省了¥${formatAmount(savedByCoolZone)}，继续保持！`
    )
  }

  if (reminders.length === 0) {
    reminders.push('记录越多，提醒越精准。坚持记录你的情绪消费吧！')
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-coral" />
        <h2 className="text-xl font-display text-white">统计分析</h2>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gold" />
          <h3 className="text-base font-medium text-white/90">情绪消费分布</h3>
        </div>
        <div className="glass rounded-2xl p-4 space-y-3">
          {moodStats.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">暂无消费数据</p>
          ) : (
            moodStats.map((stat) => (
              <div key={stat.mood} className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 w-16 shrink-0">
                  <span className="text-lg">{MOOD_EMOJIS[stat.mood]}</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: MOOD_COLORS[stat.mood] }}
                  >
                    {stat.mood}
                  </span>
                </div>
                <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${maxMoodTotal > 0 ? (stat.total / maxMoodTotal) * 100 : 0}%`,
                      backgroundColor: MOOD_COLORS[stat.mood],
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span className="text-xs text-white/60 w-8 text-right shrink-0">
                  {stat.count}笔
                </span>
                <span className="text-sm font-medium text-white w-20 text-right shrink-0">
                  ¥{formatAmount(stat.total)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-lavender" />
          <h3 className="text-base font-medium text-white/90">类别×情绪 热力图</h3>
        </div>
        <div className="glass rounded-2xl p-4 overflow-x-auto">
          {expenses.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">暂无消费数据</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-white/40 pb-2 pr-2 font-normal"></th>
                  {PRE_MOODS.map((mood: PreMood) => (
                    <th key={mood} className="pb-2 px-1 text-center font-normal">
                      <span className="text-base">{MOOD_EMOJIS[mood]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((cat: Category) => (
                  <tr key={cat}>
                    <td
                      className="py-1 pr-2 font-medium whitespace-nowrap"
                      style={{ color: CATEGORY_COLORS[cat] }}
                    >
                      {cat}
                    </td>
                    {PRE_MOODS.map((mood: PreMood) => {
                      const value = getHeatmapValue(cat, mood)
                      const opacity =
                        heatmapMax > 0
                          ? 0.05 + (value / heatmapMax) * 0.95
                          : 0.05
                      return (
                        <td key={mood} className="py-1 px-1">
                          <div
                            className="rounded-md h-8 flex items-center justify-center transition-colors"
                            style={{ backgroundColor: `rgba(77, 150, 255, ${opacity})` }}
                          >
                            {value > 0 && (
                              <span className="text-[10px] text-white/80">
                                {value >= 1000
                                  ? `${(value / 1000).toFixed(1)}k`
                                  : value.toFixed(0)}
                              </span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-coral" />
          <h3 className="text-base font-medium text-white/90">后悔分析</h3>
        </div>
        {reviewedTotal === 0 ? (
          <div className="glass rounded-2xl p-4">
            <p className="text-white/40 text-sm text-center py-4">暂无复盘数据</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-2xl p-3 text-center">
                <div className="text-2xl font-bold text-coral">{regretCount}</div>
                <div className="text-xs text-coral/70 mt-0.5">后悔</div>
                <div className="text-[10px] text-white/40 mt-0.5">
                  {((regretCount / reviewedTotal) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="glass rounded-2xl p-3 text-center">
                <div className="text-2xl font-bold text-mint">{noRegretCount}</div>
                <div className="text-xs text-mint/70 mt-0.5">不后悔</div>
                <div className="text-[10px] text-white/40 mt-0.5">
                  {((noRegretCount / reviewedTotal) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="glass rounded-2xl p-3 text-center">
                <div className="text-2xl font-bold text-gold">{replaceableCount}</div>
                <div className="text-xs text-gold/70 mt-0.5">可替代</div>
                <div className="text-[10px] text-white/40 mt-0.5">
                  {((replaceableCount / reviewedTotal) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            {regretCount > 0 || noRegretCount > 0 ? (
              <div className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">后悔平均金额</span>
                  <span className="text-coral font-medium">¥{formatAmount(regretAvg)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-white/60">不后悔平均金额</span>
                  <span className="text-mint font-medium">¥{formatAmount(noRegretAvg)}</span>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-gold" />
          <h3 className="text-base font-medium text-white/90">💡 个性化提醒</h3>
        </div>
        <div className="space-y-3">
          {reminders.map((text, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-4 flex items-start gap-3"
              style={{ borderLeftColor: '#ffd93d', borderLeftWidth: '3px', borderLeftStyle: 'solid' }}
            >
              <Lightbulb className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <p className="text-sm text-white/80 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
