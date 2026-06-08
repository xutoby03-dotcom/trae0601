import { AlertTriangle } from 'lucide-react'

interface BudgetBarProps {
  category: string
  spent: number
  limit: number
  color: string
}

function formatYuan(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN')}`
}

export default function BudgetBar({ category, spent, limit, color }: BudgetBarProps) {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0
  const clampedWidth = Math.min(percentage, 100)

  let barColor = color
  let textColor = '#6bcb77'
  if (percentage >= 100) {
    barColor = '#ff4444'
    textColor = '#ff4444'
  } else if (percentage >= 80) {
    barColor = '#ff8c42'
    textColor = '#ff8c42'
  }

  let warningText = ''
  if (percentage >= 100) {
    const over = spent - limit
    warningText = `已超支 ¥${over.toLocaleString('zh-CN')}，需要控制${category}支出了`
  } else if (percentage >= 80) {
    const left = limit - spent
    warningText = `预算快见底，仅剩 ¥${left.toLocaleString('zh-CN')}`
  }

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white/80">{category}</span>
        <div className="flex items-center gap-1.5">
          {percentage >= 100 && (
            <AlertTriangle className="w-3.5 h-3.5 text-[#ff4444]" />
          )}
          <span className="text-sm text-white/70">
            {formatYuan(spent)}/{formatYuan(limit)}
          </span>
        </div>
      </div>

      <div className="bg-white/10 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage >= 100 ? 'animate-pulse-slow' : ''
          }`}
          style={{
            width: `${clampedWidth}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between">
        {warningText ? (
          <span className="text-xs" style={{ color: textColor }}>
            {warningText}
          </span>
        ) : (
          <span />
        )}
        <span className="text-xs font-medium" style={{ color: textColor }}>
          {percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}
