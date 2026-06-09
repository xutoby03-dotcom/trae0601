import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, User, DollarSign, Calendar, Tag, Image, FileText, Heart } from 'lucide-react'
import { useLoanStore } from '@/store/loanStore'
import type { Sentiment } from '@/types'

export default function LoanForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { loans, addLoan, updateLoan } = useLoanStore()
  const existingLoan = id ? loans.find((l) => l.id === id) : null

  const [borrowerName, setBorrowerName] = useState(existingLoan?.borrowerName ?? '')
  const [totalAmount, setTotalAmount] = useState(existingLoan?.totalAmount?.toString() ?? '')
  const [lendDate, setLendDate] = useState(existingLoan?.lendDate ?? new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(existingLoan?.dueDate ?? '')
  const [purpose, setPurpose] = useState(existingLoan?.purpose ?? '')
  const [hasScreenshot, setHasScreenshot] = useState(existingLoan?.hasScreenshot ?? false)
  const [note, setNote] = useState(existingLoan?.note ?? '')
  const [sentiment, setSentiment] = useState<Sentiment>(existingLoan?.sentiment ?? 'normal')

  const isEdit = !!existingLoan
  const isValid = borrowerName.trim() && parseFloat(totalAmount) > 0 && dueDate

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    const data = {
      borrowerName: borrowerName.trim(),
      totalAmount: parseFloat(totalAmount),
      lendDate,
      dueDate,
      purpose,
      hasScreenshot,
      note,
      sentiment,
      isPaused: existingLoan?.isPaused ?? false,
    }

    if (isEdit && existingLoan) {
      updateLoan(existingLoan.id, data)
    } else {
      addLoan(data)
    }
    navigate('/')
  }

  const sentimentOptions: { value: Sentiment; label: string; emoji: string; color: string }[] = [
    { value: 'close', label: '挚友', emoji: '❤️', color: 'border-coral-300 bg-coral-50 text-coral-600' },
    { value: 'normal', label: '普通', emoji: '💛', color: 'border-apricot-300 bg-apricot-50 text-apricot-600' },
    { value: 'distant', label: '疏远', emoji: '🤍', color: 'border-parchment-300 bg-parchment-100 text-parchment-700' },
  ]

  return (
    <div className="fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 text-parchment-500 hover:text-apricot-600 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-display font-bold text-apricot-900 text-xl">
          {isEdit ? '编辑借款' : '新增借款'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-warm space-y-4">
          <div>
            <label className="text-xs font-medium text-parchment-700 mb-1.5 flex items-center gap-1.5">
              <User size={12} className="text-apricot-400" /> 对方姓名
            </label>
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              placeholder="姓名或称呼"
              className="w-full px-3 py-2.5 bg-parchment-50 border border-parchment-200 rounded-xl text-apricot-900 focus:outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-100 transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-parchment-700 mb-1.5 flex items-center gap-1.5">
              <DollarSign size={12} className="text-apricot-400" /> 借款金额
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-apricot-400 font-bold">¥</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2.5 bg-parchment-50 border border-parchment-200 rounded-xl text-apricot-900 font-display font-bold text-lg focus:outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-100 transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-parchment-700 mb-1.5 flex items-center gap-1.5">
                <Calendar size={12} className="text-apricot-400" /> 借出日期
              </label>
              <input
                type="date"
                value={lendDate}
                onChange={(e) => setLendDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-parchment-50 border border-parchment-200 rounded-xl text-apricot-900 text-sm focus:outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-100 transition-all"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-parchment-700 mb-1.5 flex items-center gap-1.5">
                <Calendar size={12} className="text-coral-400" /> 约定还款日
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-parchment-50 border border-parchment-200 rounded-xl text-apricot-900 text-sm focus:outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-100 transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-warm space-y-4">
          <div>
            <label className="text-xs font-medium text-parchment-700 mb-1.5 flex items-center gap-1.5">
              <Tag size={12} className="text-apricot-400" /> 用途
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="如：周转、房租、急用..."
              className="w-full px-3 py-2.5 bg-parchment-50 border border-parchment-200 rounded-xl text-apricot-900 text-sm focus:outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-100 transition-all"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-parchment-700 flex items-center gap-1.5">
              <Image size={12} className="text-apricot-400" /> 有转账截图
            </label>
            <button
              type="button"
              onClick={() => setHasScreenshot(!hasScreenshot)}
              className={`relative w-11 h-6 rounded-full transition-all ${
                hasScreenshot ? 'bg-apricot-400' : 'bg-parchment-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
                  hasScreenshot ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-parchment-700 mb-1.5 flex items-center gap-1.5">
              <FileText size={12} className="text-apricot-400" /> 备注
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="其他要记的..."
              rows={2}
              className="w-full px-3 py-2.5 bg-parchment-50 border border-parchment-200 rounded-xl text-apricot-900 text-sm resize-none focus:outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-100 transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-warm">
          <label className="text-xs font-medium text-parchment-700 mb-3 flex items-center gap-1.5">
            <Heart size={12} className="text-coral-400" /> 亲友情分
          </label>
          <div className="flex gap-2">
            {sentimentOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSentiment(opt.value)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-display font-bold transition-all ${
                  sentiment === opt.value
                    ? opt.color
                    : 'border-parchment-200 bg-parchment-50 text-parchment-400'
                }`}
              >
                <span className="mr-1">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-3.5 bg-apricot-400 hover:bg-apricot-500 disabled:bg-parchment-300 disabled:cursor-not-allowed text-white font-display font-bold text-lg rounded-xl shadow-warm hover:shadow-warm-md transition-all active:scale-[0.98]"
        >
          {isEdit ? '保存修改' : '记录借款'}
        </button>
      </form>
    </div>
  )
}
