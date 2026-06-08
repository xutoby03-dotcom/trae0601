import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { PRE_MOODS, CATEGORIES, MOOD_EMOJIS, MOOD_COLORS, CATEGORY_COLORS } from '@/types'
import type { PreMood, Category } from '@/types'
import ExpenseCard from '@/components/ExpenseCard'
import { Search, Filter } from 'lucide-react'

function getDateKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export default function Transactions() {
  const navigate = useNavigate()
  const expenses = useStore((s) => s.expenses)
  const [selectedMood, setSelectedMood] = useState<PreMood | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const filtered = expenses
    .filter((e) => !selectedMood || e.preMood === selectedMood)
    .filter((e) => !selectedCategory || e.category === selectedCategory)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const totalCount = filtered.length
  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0)

  const grouped: Record<string, typeof filtered> = {}
  for (const e of filtered) {
    const key = getDateKey(e.createdAt)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(e)
  }

  const dateKeys = Object.keys(grouped).sort((a, b) => {
    const [ay, am, ad] = a.split('-').map(Number)
    const [by, bm, bd] = b.split('-').map(Number)
    return new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()
  })

  const moodCounts: Record<string, number> = {}
  for (const e of expenses) {
    moodCounts[e.preMood] = (moodCounts[e.preMood] || 0) + 1
  }

  return (
    <div className="animate-fade-in min-h-screen pb-24">
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold text-white">流水明细</h1>
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-white/50" />
          <Filter className="w-5 h-5 text-white/50" />
        </div>
      </div>

      <div className="px-4 mb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setSelectedMood(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm border transition-all ${
              selectedMood === null
                ? 'bg-white/15 border-white/30 text-white'
                : 'bg-white/5 border-white/10 text-white/60'
            }`}
          >
            全部
          </button>
          {PRE_MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm border transition-all ${
                selectedMood === mood
                  ? 'text-white'
                  : 'bg-white/5 border-white/10 text-white/60'
              }`}
              style={
                selectedMood === mood
                  ? { backgroundColor: MOOD_COLORS[mood] + '33', borderColor: MOOD_COLORS[mood], color: MOOD_COLORS[mood] }
                  : undefined
              }
            >
              {MOOD_EMOJIS[mood]} {mood}
              {moodCounts[mood] ? (
                <span className="ml-1 text-xs opacity-60">{moodCounts[mood]}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs border transition-all ${
              selectedCategory === null
                ? 'bg-white/15 border-white/30 text-white'
                : 'bg-white/5 border-white/10 text-white/60'
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs border transition-all ${
                selectedCategory === cat
                  ? 'text-white'
                  : 'bg-white/5 border-white/10 text-white/60'
              }`}
              style={
                selectedCategory === cat
                  ? { backgroundColor: CATEGORY_COLORS[cat] + '33', borderColor: CATEGORY_COLORS[cat], color: CATEGORY_COLORS[cat] }
                  : undefined
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="px-4 mb-4">
          <div className="glass rounded-xl px-4 py-2.5 flex items-center justify-between">
            <span className="text-white/50 text-xs">共 {totalCount} 笔</span>
            <span className="text-white font-semibold text-sm">¥{totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 text-white/40">
          <span className="text-4xl mb-3">📝</span>
          <p className="text-sm">还没有任何记录，去记一笔吧～</p>
          <button
            onClick={() => navigate('/new')}
            className="mt-4 px-5 py-2 rounded-full bg-white/10 text-white/70 text-sm border border-white/10 hover:bg-white/20 transition-all"
          >
            去记账
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 text-white/40">
          <span className="text-4xl mb-3">🔍</span>
          <p className="text-sm">没有匹配的记录</p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {dateKeys.map((key) => (
            <div key={key}>
              <div className="text-white/40 text-xs mb-2 px-1">
                {formatDateHeader(grouped[key][0].createdAt)}
              </div>
              <div className="space-y-2">
                {grouped[key].map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onClick={() => navigate(`/transaction/${expense.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
