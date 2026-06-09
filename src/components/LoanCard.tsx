import { useNavigate } from 'react-router-dom'
import { Clock, AlertTriangle, Layers, Pause, CheckCircle2 } from 'lucide-react'
import type { Loan } from '@/types'
import { formatMoney, daysUntil, daysOverdue, getSentimentEmoji } from '@/utils/helpers'

interface LoanCardProps {
  loan: Loan
  variant: 'overdue' | 'expiring' | 'installment' | 'settled'
}

export default function LoanCard({ loan, variant }: LoanCardProps) {
  const navigate = useNavigate()

  const variantStyles = {
    overdue: 'border-l-coral-300 bg-coral-50/30',
    expiring: 'border-l-sage-300 bg-white',
    installment: 'border-l-apricot-400 bg-apricot-50/20',
    settled: 'border-l-sage-400 bg-sage-50/30',
  }

  const daysInfo = () => {
    if (variant === 'settled') return null
    if (variant === 'overdue') {
      const d = daysOverdue(loan.dueDate)
      return (
        <span className="inline-flex items-center gap-1 text-coral-400 text-xs font-medium">
          <AlertTriangle size={12} />
          逾期 {d} 天
        </span>
      )
    }
    if (variant === 'installment') {
      if (loan.isPaused) {
        return (
          <span className="inline-flex items-center gap-1 text-parchment-500 text-xs font-medium">
            <Pause size={12} />
            已搁置
          </span>
        )
      }
      const d = daysUntil(loan.dueDate)
      if (d < 0) {
        return (
          <span className="inline-flex items-center gap-1 text-coral-400 text-xs font-medium">
            <AlertTriangle size={12} />
            逾期 {daysOverdue(loan.dueDate)} 天
          </span>
        )
      }
      return (
        <span className="inline-flex items-center gap-1 text-apricot-500 text-xs font-medium">
          <Layers size={12} />
          还款中 · {d <= 0 ? '今天到期' : `${d} 天后到期`}
        </span>
      )
    }
    const d = daysUntil(loan.dueDate)
    return (
      <span className="inline-flex items-center gap-1 text-sage-500 text-xs font-medium">
        <Clock size={12} />
        {d <= 0 ? '今天到期' : `${d} 天后到期`}
      </span>
    )
  }

  const progress = loan.totalAmount > 0
    ? ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100
    : 0

  return (
    <div
      onClick={() => navigate(`/loan/${loan.id}`)}
      className={`card-enter border-l-[3px] rounded-xl p-3.5 shadow-warm hover:shadow-warm-md transition-all cursor-pointer active:scale-[0.98] ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getSentimentEmoji(loan.sentiment)}</span>
          <span className="font-display font-bold text-apricot-900 text-base">
            {loan.borrowerName}
          </span>
          {loan.isPaused && variant === 'installment' && (
            <span className="text-[10px] bg-parchment-200 text-parchment-600 px-1.5 py-0.5 rounded-full">搁置</span>
          )}
        </div>
        <div className="text-right">
          <div className="font-display font-bold text-apricot-800 text-lg">
            ¥{formatMoney(loan.remainingAmount)}
          </div>
          {loan.remainingAmount < loan.totalAmount && (
            <div className="text-parchment-500 text-[10px]">
              原借 ¥{formatMoney(loan.totalAmount)}
            </div>
          )}
        </div>
      </div>

      {loan.purpose && (
        <div className="text-parchment-600 text-xs mb-2 truncate">
          {loan.purpose}
        </div>
      )}

      <div className="flex items-center justify-between">
        {daysInfo()}
        <div className="flex items-center gap-1.5">
          {variant !== 'settled' && (
            <div className="w-16 h-1.5 bg-parchment-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: progress >= 100 ? '#7BC47F' : '#E8A87C',
                }}
              />
            </div>
          )}
          {variant === 'settled' && (
            <span className="inline-flex items-center gap-1 text-sage-500 text-xs font-medium">
              <CheckCircle2 size={12} />
              已结清
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
