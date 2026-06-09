import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePlansStore } from '@/store/plansStore'
import { formatCurrency, formatDate } from '@/utils/format'
import { ArrowLeft, RotateCcw, TrendingUp, Plus, DollarSign, FileText, AlertCircle, Receipt } from 'lucide-react'

export default function RefundBudget() {
  const { id } = useParams<{ id: string }>()
  const plan = usePlansStore((s) => s.plans.find((p) => p.id === id))
  const addRefundRecord = usePlansStore((s) => s.addRefundRecord)
  const addBudgetAdjustment = usePlansStore((s) => s.addBudgetAdjustment)

  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refundTo, setRefundTo] = useState('')
  const [customRefundTo, setCustomRefundTo] = useState('')

  const [budgetAmount, setBudgetAmount] = useState('')
  const [budgetReason, setBudgetReason] = useState('')

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-bark-300 mb-3" />
          <p className="text-bark-400">未找到该计划</p>
          <Link to="/" className="text-warm-600 hover:text-warm-700 mt-2 inline-block">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  const totalPledged = plan.participants.reduce((sum, p) => sum + p.pledgedAmount, 0)
  const totalAdvanced = plan.participants.reduce((sum, p) => sum + p.advancedAmount, 0)
  const totalRefunded = plan.refundRecords.reduce((sum, r) => sum + r.amount, 0)
  const totalBudgetAdjusted = plan.budgetAdjustments.reduce((sum, a) => sum + a.additionalAmount, 0)

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(refundAmount)
    if (!amount || amount <= 0) return
    const finalRefundTo = refundTo === '__custom__' ? customRefundTo : refundTo
    if (!finalRefundTo.trim()) return

    addRefundRecord(plan.id, {
      amount,
      reason: refundReason.trim(),
      refundTo: finalRefundTo.trim(),
    })
    setRefundAmount('')
    setRefundReason('')
    setRefundTo('')
    setCustomRefundTo('')
  }

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const additionalAmount = parseFloat(budgetAmount)
    if (!additionalAmount || additionalAmount <= 0) return

    addBudgetAdjustment(plan.id, {
      additionalAmount,
      reason: budgetReason.trim(),
    })
    setBudgetAmount('')
    setBudgetReason('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-bark-50">
      <nav className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-bark-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to={`/plan/${plan.id}`}
            className="p-2 rounded-xl hover:bg-bark-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-bark-600" />
          </Link>
          <h1 className="text-lg font-semibold text-bark-800">退款与预算调整</h1>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-bark-100">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-semibold text-bark-800">退款记录</h2>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-bark-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-bark-400 mb-1">总预算</p>
                  <p className="text-sm font-semibold text-bark-700">{formatCurrency(plan.totalBudget)}</p>
                </div>
                <div className="bg-bark-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-bark-400 mb-1">已认捐</p>
                  <p className="text-sm font-semibold text-bark-700">{formatCurrency(totalPledged)}</p>
                </div>
                <div className="bg-bark-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-bark-400 mb-1">已垫付</p>
                  <p className="text-sm font-semibold text-bark-700">{formatCurrency(totalAdvanced)}</p>
                </div>
              </div>

              <form onSubmit={handleRefundSubmit} className="space-y-3 mb-5">
                <div>
                  <label className="block text-sm text-bark-500 mb-1">退款金额</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bark-300" />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none bg-white/80 text-bark-800 placeholder:text-bark-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-bark-500 mb-1">退款原因</label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="输入退款原因..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none bg-white/80 text-bark-800 placeholder:text-bark-300 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-bark-500 mb-1">退给谁</label>
                  <select
                    value={refundTo}
                    onChange={(e) => setRefundTo(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none bg-white/80 text-bark-800"
                  >
                    <option value="">选择参与者...</option>
                    {plan.participants.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                    <option value="__custom__">自定义输入</option>
                  </select>
                  {refundTo === '__custom__' && (
                    <input
                      type="text"
                      value={customRefundTo}
                      onChange={(e) => setCustomRefundTo(e.target.value)}
                      placeholder="输入退款对象名称"
                      className="mt-2 w-full px-4 py-2.5 rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none bg-white/80 text-bark-800 placeholder:text-bark-300"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!refundAmount || parseFloat(refundAmount) <= 0 || (!refundTo || (refundTo === '__custom__' && !customRefundTo.trim()))}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:bg-bark-200 disabled:text-bark-400 text-white font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  记录退款
                </button>
              </form>

              {plan.refundRecords.length === 0 ? (
                <div className="text-center py-8">
                  <RotateCcw className="w-10 h-10 mx-auto text-bark-200 mb-2" />
                  <p className="text-sm text-bark-400">暂无退款记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plan.refundRecords.map((record) => (
                    <div
                      key={record.id}
                      className="bg-bark-50/60 rounded-xl p-4 border border-bark-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base font-semibold text-rose-500">
                          -{formatCurrency(record.amount)}
                        </span>
                        <span className="text-xs text-bark-400">{formatDate(record.createdAt)}</span>
                      </div>
                      {record.reason && (
                        <p className="text-sm text-bark-600 mb-1">{record.reason}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-bark-400">
                        <FileText className="w-3 h-3" />
                        <span>退给: {record.refundTo}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-bark-200 flex items-center justify-between">
                    <span className="text-sm text-bark-500">累计退款</span>
                    <span className="text-sm font-semibold text-rose-500">-{formatCurrency(totalRefunded)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-bark-100">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-mint-500" />
                <h2 className="text-base font-semibold text-bark-800">加预算</h2>
              </div>

              <div className="bg-bark-50 rounded-xl p-4 text-center mb-5">
                <p className="text-xs text-bark-400 mb-1">当前预算</p>
                <p className="text-2xl font-bold text-bark-800">{formatCurrency(plan.totalBudget)}</p>
              </div>

              <form onSubmit={handleBudgetSubmit} className="space-y-3 mb-5">
                <div>
                  <label className="block text-sm text-bark-500 mb-1">增加金额</label>
                  <div className="relative">
                    <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bark-300" />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none bg-white/80 text-bark-800 placeholder:text-bark-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-bark-500 mb-1">调整原因</label>
                  <textarea
                    value={budgetReason}
                    onChange={(e) => setBudgetReason(e.target.value)}
                    placeholder="输入调整原因..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none bg-white/80 text-bark-800 placeholder:text-bark-300 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!budgetAmount || parseFloat(budgetAmount) <= 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-mint-500 hover:bg-mint-600 disabled:bg-bark-200 disabled:text-bark-400 text-white font-medium transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  增加预算
                </button>
              </form>

              {plan.budgetAdjustments.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-10 h-10 mx-auto text-bark-200 mb-2" />
                  <p className="text-sm text-bark-400">暂无预算调整记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plan.budgetAdjustments.map((adjustment) => (
                    <div
                      key={adjustment.id}
                      className="bg-bark-50/60 rounded-xl p-4 border border-bark-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base font-semibold text-mint-500">
                          +{formatCurrency(adjustment.additionalAmount)}
                        </span>
                        <span className="text-xs text-bark-400">{formatDate(adjustment.createdAt)}</span>
                      </div>
                      {adjustment.reason && (
                        <p className="text-sm text-bark-600">{adjustment.reason}</p>
                      )}
                    </div>
                  ))}
                  <div className="pt-3 border-t border-bark-200 flex items-center justify-between">
                    <span className="text-sm text-bark-500">累计增加</span>
                    <span className="text-sm font-semibold text-mint-500">+{formatCurrency(totalBudgetAdjusted)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
