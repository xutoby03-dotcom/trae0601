import { useState } from 'react'
import { X, Camera, FileText } from 'lucide-react'
import type { Repayment } from '@/types'
import { formatMoney, formatDate } from '@/utils/helpers'

interface AddRepaymentModalProps {
  loanId: string
  maxAmount: number
  onAdd: (data: { loanId: string; amount: number; date: string; proof: string; note: string }) => void
  onClose: () => void
}

export default function AddRepaymentModal({ loanId, maxAmount, onAdd, onClose }: AddRepaymentModalProps) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [proof, setProof] = useState('')
  const [note, setNote] = useState('')

  const numAmount = parseFloat(amount) || 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (numAmount <= 0 || numAmount > maxAmount) return
    onAdd({ loanId, amount: numAmount, date, proof, note })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-apricot-900/30 backdrop-blur-sm" />
      <div
        className="relative bg-parchment-50 w-full max-w-md rounded-t-3xl p-6 pb-24 shadow-warm-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-apricot-900 text-lg">记录还款</h3>
          <button onClick={onClose} className="p-1 text-parchment-500 hover:text-apricot-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-parchment-700 mb-1 block">还款金额</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-apricot-400 font-bold">¥</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`最多 ¥${formatMoney(maxAmount)}`}
                className="w-full pl-8 pr-3 py-2.5 bg-white border border-parchment-300 rounded-xl text-apricot-900 font-display font-bold focus:outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-100 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-parchment-700 mb-1 block">还款日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-parchment-300 rounded-xl text-apricot-900 focus:outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-100 transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-parchment-700 mb-1 block flex items-center gap-1">
              <Camera size={12} /> 还款凭证
            </label>
            <input
              type="text"
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="截图文件名或备注"
              className="w-full px-3 py-2.5 bg-white border border-parchment-300 rounded-xl text-apricot-900 text-sm focus:outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-100 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-parchment-700 mb-1 block flex items-center gap-1">
              <FileText size={12} /> 备注
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可选备注..."
              rows={2}
              className="w-full px-3 py-2.5 bg-white border border-parchment-300 rounded-xl text-apricot-900 text-sm resize-none focus:outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-100 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={numAmount <= 0 || numAmount > maxAmount}
            className="w-full py-3 bg-apricot-400 hover:bg-apricot-500 disabled:bg-parchment-300 disabled:cursor-not-allowed text-white font-display font-bold rounded-xl shadow-warm hover:shadow-warm-md transition-all active:scale-[0.98]"
          >
            确认还款 ¥{numAmount > 0 ? formatMoney(numAmount) : '0.00'}
          </button>
        </form>
      </div>
    </div>
  )
}

interface RepaymentTimelineProps {
  repayments: Repayment[]
  onDelete: (id: string) => void
}

export function RepaymentTimeline({ repayments, onDelete }: RepaymentTimelineProps) {
  if (repayments.length === 0) {
    return (
      <div className="text-center py-8 text-parchment-400 text-sm">
        暂无还款记录
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {repayments.map((r, idx) => (
        <div key={r.id} className="flex items-start gap-3 card-enter" style={{ animationDelay: `${idx * 0.05}s` }}>
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-sage-300 border-2 border-white shadow-sm" />
            {idx < repayments.length - 1 && <div className="w-0.5 h-8 bg-parchment-200" />}
          </div>
          <div className="flex-1 bg-white rounded-xl p-3 shadow-warm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-sage-600">
                -¥{formatMoney(r.amount)}
              </span>
              <button
                onClick={() => onDelete(r.id)}
                className="text-parchment-400 hover:text-coral-400 text-xs transition-colors"
              >
                删除
              </button>
            </div>
            <div className="text-parchment-500 text-xs">{formatDate(r.date)}</div>
            {r.proof && (
              <div className="text-parchment-400 text-xs mt-1 flex items-center gap-1">
                <Camera size={10} /> {r.proof}
              </div>
            )}
            {r.note && (
              <div className="text-parchment-500 text-xs mt-1">{r.note}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
