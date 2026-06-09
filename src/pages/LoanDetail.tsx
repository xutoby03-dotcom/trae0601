import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Pencil, Trash2, Copy, Check, Pause, Play,
  Calendar, DollarSign, Tag, Image, FileText, HandCoins, MessageCircle
} from 'lucide-react'
import { useLoanStore } from '@/store/loanStore'
import { formatMoney, formatDate, daysUntil, daysOverdue, generateReminderText, getSentimentLabel, getSentimentEmoji } from '@/utils/helpers'
import AddRepaymentModal, { RepaymentTimeline } from '@/components/RepaymentModal'

export default function LoanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loans, repayments, getRepaymentsByLoanId, updateLoan, deleteLoan, addRepayment, deleteRepayment } = useLoanStore()

  const loan = loans.find((l) => l.id === id)
  const loanRepayments = loan ? getRepaymentsByLoanId(loan.id) : []

  const [showRepaymentModal, setShowRepaymentModal] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!loan) {
    return (
      <div className="text-center py-16 fade-in">
        <div className="text-4xl mb-3">🤔</div>
        <p className="text-parchment-500">找不到这条借款记录</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-apricot-500 font-medium text-sm"
        >
          返回首页
        </button>
      </div>
    )
  }

  const isSettled = loan.status === 'settled'
  const isOverdue = loan.status === 'overdue'
  const odDays = daysOverdue(loan.dueDate)
  const dueDays = daysUntil(loan.dueDate)
  const reminderText = generateReminderText(loan)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reminderText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = reminderText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDelete = () => {
    deleteLoan(loan.id)
    navigate('/')
  }

  const handleAddRepayment = (data: { loanId: string; amount: number; date: string; proof: string; note: string }) => {
    addRepayment(data)
  }

  const statusBadge = () => {
    if (isSettled) return <span className="bg-sage-100 text-sage-600 text-xs font-bold px-2.5 py-1 rounded-full">已结清</span>
    if (isOverdue) return <span className="bg-coral-100 text-coral-500 text-xs font-bold px-2.5 py-1 rounded-full">已逾期 {odDays} 天</span>
    if (dueDays <= 3) return <span className="bg-apricot-100 text-apricot-600 text-xs font-bold px-2.5 py-1 rounded-full">{dueDays} 天后到期</span>
    return <span className="bg-sage-50 text-sage-500 text-xs font-bold px-2.5 py-1 rounded-full">进行中</span>
  }

  const progress = loan.totalAmount > 0
    ? ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100
    : 0

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 text-parchment-500 hover:text-apricot-600 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          {!isSettled && (
            <button
              onClick={() => navigate(`/loan/${loan.id}/edit`)}
              className="p-2 text-parchment-500 hover:text-apricot-600 rounded-lg transition-colors"
            >
              <Pencil size={18} />
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-parchment-500 hover:text-coral-400 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-warm-md mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getSentimentEmoji(loan.sentiment)}</span>
            <div>
              <h2 className="font-display font-bold text-apricot-900 text-xl">{loan.borrowerName}</h2>
              <span className="text-parchment-400 text-xs">{getSentimentLabel(loan.sentiment)}</span>
            </div>
          </div>
          {statusBadge()}
        </div>

        <div className="text-center mb-4">
          <div className="text-parchment-400 text-xs mb-1">
            {isSettled ? '已全部归还' : '剩余待还'}
          </div>
          <div className="font-display font-bold text-apricot-800 text-3xl">
            ¥{formatMoney(loan.remainingAmount)}
          </div>
          {!isSettled && loan.remainingAmount < loan.totalAmount && (
            <div className="text-parchment-400 text-xs mt-1">
              共借 ¥{formatMoney(loan.totalAmount)}，已还 ¥{formatMoney(loan.totalAmount - loan.remainingAmount)}
            </div>
          )}
        </div>

        {progress > 0 && (
          <div className="w-full h-2 bg-parchment-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                backgroundColor: progress >= 100 ? '#7BC47F' : '#E8A87C',
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-parchment-600">
            <DollarSign size={14} className="text-apricot-400" />
            <span>借款 ¥{formatMoney(loan.totalAmount)}</span>
          </div>
          <div className="flex items-center gap-2 text-parchment-600">
            <Calendar size={14} className="text-apricot-400" />
            <span>{formatDate(loan.lendDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-parchment-600">
            <Calendar size={14} className="text-coral-400" />
            <span>约定 {formatDate(loan.dueDate)}</span>
          </div>
          {loan.purpose && (
            <div className="flex items-center gap-2 text-parchment-600">
              <Tag size={14} className="text-apricot-400" />
              <span>{loan.purpose}</span>
            </div>
          )}
        </div>

        {loan.hasScreenshot && (
          <div className="flex items-center gap-1.5 text-sage-500 text-xs mt-3">
            <Image size={12} /> 有转账截图
          </div>
        )}

        {loan.note && (
          <div className="mt-3 p-3 bg-parchment-50 rounded-xl">
            <div className="flex items-center gap-1 text-parchment-400 text-xs mb-1">
              <FileText size={10} /> 备注
            </div>
            <div className="text-parchment-600 text-sm">{loan.note}</div>
          </div>
        )}
      </div>

      {!isSettled && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowRepaymentModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-sage-300 hover:bg-sage-400 text-white font-display font-bold rounded-xl shadow-warm transition-all active:scale-[0.98]"
          >
            <HandCoins size={18} /> 记录还款
          </button>
          {!loan.isPaused && (
            <button
              onClick={() => setShowReminder(!showReminder)}
              className="flex items-center justify-center gap-1.5 py-3 px-4 bg-apricot-100 hover:bg-apricot-200 text-apricot-700 font-display font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              <MessageCircle size={16} /> 提醒
            </button>
          )}
          <button
            onClick={() => updateLoan(loan.id, { isPaused: !loan.isPaused })}
            className={`flex items-center justify-center p-3 rounded-xl transition-all active:scale-[0.98] ${
              loan.isPaused
                ? 'bg-sage-100 text-sage-600 hover:bg-sage-200'
                : 'bg-parchment-200 text-parchment-600 hover:bg-parchment-300'
            }`}
            title={loan.isPaused ? '取消搁置' : '搁置'}
          >
            {loan.isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      )}

      {showReminder && !isSettled && !loan.isPaused && (
        <div className="bg-apricot-50 border border-apricot-200 rounded-2xl p-4 mb-4 card-enter">
          <div className="text-xs font-medium text-apricot-600 mb-2 flex items-center gap-1">
            <MessageCircle size={12} /> 温和提醒文案
          </div>
          <div className="bg-white rounded-xl p-3 mb-3 text-sm text-parchment-700 leading-relaxed">
            {reminderText}
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
              copied
                ? 'bg-sage-300 text-white'
                : 'bg-apricot-400 hover:bg-apricot-500 text-white'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? '已复制' : '一键复制'}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-warm">
        <h3 className="font-display font-bold text-apricot-900 text-sm mb-3 flex items-center gap-1.5">
          <HandCoins size={14} className="text-sage-500" />
          还款记录
          {loanRepayments.length > 0 && (
            <span className="text-parchment-400 text-xs font-normal">({loanRepayments.length}笔)</span>
          )}
        </h3>
        <RepaymentTimeline repayments={loanRepayments} onDelete={deleteRepayment} />
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center fade-in" onClick={() => setShowDeleteConfirm(false)}>
          <div className="absolute inset-0 bg-apricot-900/30 backdrop-blur-sm" />
          <div className="relative bg-parchment-50 rounded-2xl p-6 mx-6 max-w-sm shadow-warm-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-apricot-900 text-lg mb-2">确认删除？</h3>
            <p className="text-parchment-600 text-sm mb-5">
              删除后将无法恢复「{loan.borrowerName}」的借款记录及所有还款记录。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-parchment-200 hover:bg-parchment-300 text-parchment-700 font-bold rounded-xl transition-all"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-coral-300 hover:bg-coral-400 text-white font-bold rounded-xl transition-all"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {showRepaymentModal && (
        <AddRepaymentModal
          loanId={loan.id}
          maxAmount={loan.remainingAmount}
          onAdd={handleAddRepayment}
          onClose={() => setShowRepaymentModal(false)}
        />
      )}
    </div>
  )
}
