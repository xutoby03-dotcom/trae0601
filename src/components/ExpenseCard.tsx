import type { Expense } from '@/types'
import { CATEGORY_COLORS, MOOD_EMOJIS, MOOD_COLORS, POST_FEELING_EMOJIS } from '@/types'
import { formatAmount, formatDate } from '@/utils/helpers'

interface ExpenseCardProps {
  expense: Expense
  onClick?: () => void
}

const REGRET_DOT_COLORS: Record<string, string> = {
  '后悔': 'bg-red-500',
  '不后悔': 'bg-green-500',
  '可替代': 'bg-yellow-500',
}

export default function ExpenseCard({ expense, onClick }: ExpenseCardProps) {
  const borderColor = CATEGORY_COLORS[expense.category]
  const categoryColor = CATEGORY_COLORS[expense.category]
  const moodColor = MOOD_COLORS[expense.preMood]

  return (
    <div
      className="glass rounded-2xl p-4 cursor-pointer hover:translate-y-[-2px] hover:shadow-lg transition-all"
      style={{ borderLeftColor: borderColor, borderLeftWidth: '4px', borderLeftStyle: 'solid' }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium" style={{ color: categoryColor }}>
          {expense.category}
        </span>
        <span className="text-white font-bold">
          ¥{formatAmount(expense.amount)}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-white/60 text-sm">{expense.merchant}</span>
        {!expense.isPlanned && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
            非计划
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs">{formatDate(expense.createdAt)}</span>
        <div className="flex items-center gap-1 text-xs">
          <span>{MOOD_EMOJIS[expense.preMood]}</span>
          <span style={{ color: moodColor }}>{expense.preMood}</span>
          <span>{POST_FEELING_EMOJIS[expense.postFeeling]}</span>
        </div>
      </div>

      {expense.regretStatus && (
        <span
          className={`inline-block w-2 h-2 rounded-full mt-2 ${REGRET_DOT_COLORS[expense.regretStatus]}`}
        />
      )}
    </div>
  )
}
