import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { CATEGORIES, CATEGORY_COLORS, PRE_MOODS, MOOD_COLORS, MOOD_EMOJIS } from '@/types'
import type { PreMood, Category } from '@/types'
import { isCurrentMonth, formatAmount } from '@/utils/helpers'
import BudgetBar from '@/components/BudgetBar'
import { Link } from 'react-router-dom'
import { TrendingUp, Plus, Snowflake, Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { expenses, budgets, updateBudget } = useStore()
  const [showBudgetEditor, setShowBudgetEditor] = useState(false)
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  const monthExpenses = expenses.filter((e) => isCurrentMonth(e.createdAt))

  const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0)
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = totalBudget - totalSpent

  const categorySpent: Record<string, number> = {}
  CATEGORIES.forEach((cat) => {
    categorySpent[cat] = monthExpenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0)
  })

  const moodSpent: Record<PreMood, number> = {} as Record<PreMood, number>
  PRE_MOODS.forEach((m) => {
    moodSpent[m] = monthExpenses
      .filter((e) => e.preMood === m)
      .reduce((sum, e) => sum + e.amount, 0)
  })

  const activeMoods = PRE_MOODS.filter((m) => moodSpent[m] > 0)
  const maxMoodAmount = Math.max(...activeMoods.map((m) => moodSpent[m]), 1)
  const sortedMoods = [...activeMoods].sort((a, b) => moodSpent[b] - moodSpent[a])
  const dominantMood = sortedMoods[0]
  const hasExpenses = monthExpenses.length > 0

  return (
    <div className="animate-fade-in space-y-5">
      <div className="gradient-ocean rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-white/70" />
          <span className="text-sm text-white/70">本月预算</span>
        </div>
        <p className="text-xs text-white/50 mb-3">
          预算总额 ¥{formatAmount(totalBudget)}
        </p>
        <p className="text-4xl font-bold text-white">
          ¥{formatAmount(totalSpent)}
        </p>
        <p className={cn(
          'text-sm mt-2',
          remaining >= 0 ? 'text-[#6bcb77]' : 'text-[#ff6b6b]'
        )}>
          {remaining >= 0 ? '剩余' : '超支'} ¥{formatAmount(Math.abs(remaining))}
        </p>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-base font-medium text-white/90">分类预算</h2>
          <div className="flex-1 h-px bg-white/10" />
          <button
            onClick={() => {
              const init: Record<string, string> = {}
              budgets.forEach((b) => { init[b.category] = String(b.monthlyLimit) })
              setEditValues(init)
              setShowBudgetEditor(true)
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const budget = budgets.find((b) => b.category === cat)
            return (
              <BudgetBar
                key={cat}
                category={cat}
                spent={categorySpent[cat]}
                limit={budget?.monthlyLimit ?? 0}
                color={CATEGORY_COLORS[cat]}
              />
            )
          })}
        </div>
      </div>

      {hasExpenses ? (
        <div>
          <h2 className="text-base font-medium text-white/90 mb-3">情绪消费</h2>
          {dominantMood && (
            <div className="glass rounded-2xl p-4 mb-4 flex items-center gap-3">
              <span className="text-2xl">{MOOD_EMOJIS[dominantMood]}</span>
              <div>
                <p className="text-xs text-white/50">本月主情绪</p>
                <p className="text-white font-medium">
                  {MOOD_EMOJIS[dominantMood]} {dominantMood}
                </p>
              </div>
            </div>
          )}
          <div className="glass rounded-2xl p-4 space-y-3">
            {sortedMoods.map((mood) => (
              <div key={mood} className="flex items-center gap-3">
                <span className="text-lg w-7 text-center">{MOOD_EMOJIS[mood]}</span>
                <span className="text-sm text-white/70 w-10 shrink-0">{mood}</span>
                <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(moodSpent[mood] / maxMoodAmount) * 100}%`,
                      backgroundColor: MOOD_COLORS[mood],
                    }}
                  />
                </div>
                <span className="text-xs text-white/60 w-20 text-right shrink-0">
                  ¥{formatAmount(moodSpent[mood])}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <span className="text-5xl">🌙</span>
          <p className="text-white/50">本月还没有记录，记一笔吧～</p>
          <Link
            to="/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl gradient-coral text-white font-medium"
          >
            <Plus className="w-4 h-4" />
            记一笔
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/new"
          className="glass rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 text-[#ff6b6b]" />
          <span className="text-sm text-white/80">记一笔</span>
        </Link>
        <Link
          to="/cool-zone"
          className="glass rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform"
        >
          <Snowflake className="w-5 h-5 text-[#4d96ff]" />
          <span className="text-sm text-white/80">冷静区</span>
        </Link>
      </div>

      {showBudgetEditor && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowBudgetEditor(false)}
          />
          <div className="relative w-full max-w-md glass-strong rounded-t-3xl p-6 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-medium text-white">设置月度预算</h3>
              <button
                onClick={() => setShowBudgetEditor(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center gap-3">
                  <span
                    className="text-sm font-medium w-10 shrink-0"
                    style={{ color: CATEGORY_COLORS[cat] }}
                  >
                    {cat}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-white/40 text-sm">¥</span>
                    <input
                      type="number"
                      value={editValues[cat] ?? ''}
                      onChange={(e) =>
                        setEditValues((prev) => ({ ...prev, [cat]: e.target.value }))
                      }
                      className="flex-1 glass rounded-xl px-3 py-2 text-white text-sm outline-none focus:ring-1 focus:ring-white/20 placeholder:text-white/20"
                      placeholder="0"
                    />
                  </div>
                  <span className="text-xs text-white/30 w-6">/月</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                CATEGORIES.forEach((cat) => {
                  const val = Number(editValues[cat])
                  if (val > 0) {
                    updateBudget(cat, val)
                  }
                })
                setShowBudgetEditor(false)
              }}
              className="w-full gradient-coral rounded-2xl py-3 mt-6 text-white font-medium active:scale-[0.98] transition-transform"
            >
              保存预算
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
