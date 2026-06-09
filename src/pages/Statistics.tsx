import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Receipt, Calculator, BarChart3, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { useAppState } from '../store/AppContext'
import { CATEGORY_CONFIG } from '../types'
import type { ExpenseCategory } from '../types'
import { calculatePersonExpenses, calculateBudgetUsage, calculateSettlements } from '../utils/settlement'

function formatAmount(amount: number) {
  return amount.toFixed(2)
}

export default function Statistics() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { state } = useAppState()

  const trip = state.trips.find(t => t.id === tripId)

  const budgetUsage = useMemo(() => trip ? calculateBudgetUsage(trip) : null, [trip])
  const settlements = useMemo(() => trip ? calculateSettlements(trip) : [], [trip])
  const personExpenses = useMemo(() => {
    if (!trip) return []
    return trip.participants
      .map(p => ({
        participant: p,
        ...calculatePersonExpenses(trip, p.id),
      }))
      .filter(ps => Math.abs(ps.netBalance) > 0.01 || ps.totalPaid > 0.01 || ps.totalShare > 0.01)
  }, [trip])

  if (!trip || !budgetUsage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">未找到该旅行</p>
          <Link to="/" className="text-orange-500 font-medium">返回首页</Link>
        </div>
      </div>
    )
  }

  const activeParticipants = trip.participants.filter(p => p.isActive)
  const budgetPct = Math.min(budgetUsage.percentage, 100)
  const barColor = budgetUsage.percentage > 100 ? '#ef4444' : budgetUsage.percentage > 80 ? '#f59e0b' : '#14b8a6'

  const categories = (Object.keys(CATEGORY_CONFIG) as ExpenseCategory[])
    .map(cat => ({
      key: cat,
      ...CATEGORY_CONFIG[cat],
      amount: budgetUsage.categorySpent[cat] || 0,
    }))
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const maxCategoryAmount = categories.length > 0 ? categories[0].amount : 0

  function getParticipantName(id: string) {
    const p = trip.participants.find(pp => pp.id === id)
    return p?.name ?? '未知'
  }

  function getParticipantColor(id: string) {
    const p = trip.participants.find(pp => pp.id === id)
    return p?.color ?? '#9ca3af'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-r from-orange-500 to-orange-400 text-white">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-white/90 hover:text-white">
            <ArrowLeft size={20} />
            <span className="text-sm">返回</span>
          </button>
          <span className="text-sm font-medium">统计分析</span>
          <div className="w-12" />
        </div>
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-bold">{trip.destination}</h1>
        </div>
      </header>

      <div className="px-4 -mt-2 space-y-4 mt-2">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-base font-bold text-gray-800 mb-3">统计总览</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">总预算</p>
              <p className="text-lg font-bold text-gray-800">¥{formatAmount(trip.budget)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">已花费</p>
              <p className="text-lg font-bold text-orange-500">¥{formatAmount(budgetUsage.totalSpent)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">剩余</p>
              <p className={`text-lg font-bold ${budgetUsage.remaining >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                ¥{formatAmount(budgetUsage.remaining)}
              </p>
            </div>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${budgetPct}%`, backgroundColor: barColor }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">已使用</span>
            <span
              className="text-xs font-semibold"
              style={{
                color: budgetUsage.percentage > 100 ? '#ef4444' : budgetUsage.percentage > 80 ? '#f59e0b' : '#14b8a6',
              }}
            >
              {budgetUsage.percentage.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-base font-bold text-gray-800 mb-3">分类支出</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">暂无分类支出数据</p>
          ) : (
            <div className="space-y-3">
              {categories.map(cat => {
                const pct = budgetUsage.totalSpent > 0 ? (cat.amount / budgetUsage.totalSpent) * 100 : 0
                const barWidth = maxCategoryAmount > 0 ? (cat.amount / maxCategoryAmount) * 100 : 0
                const isOverBudget = budgetUsage.budget > 0 && cat.amount > budgetUsage.budget * 0.3

                return (
                  <div key={cat.key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                        {isOverBudget && (
                          <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                            超预算
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">¥{formatAmount(cat.amount)}</span>
                        <span className="text-xs text-gray-400">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-base font-bold text-gray-800 mb-3">个人花费</h2>
          {personExpenses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">暂无参与者</p>
          ) : (
            <div className="space-y-3">
              {personExpenses.map(({ participant, totalPaid, totalShare, netBalance, categoryBreakdown }) => {
                const cats = (Object.keys(categoryBreakdown) as ExpenseCategory[])
                  .map(key => ({
                    key,
                    ...CATEGORY_CONFIG[key],
                    paid: categoryBreakdown[key].paid,
                    share: categoryBreakdown[key].share,
                  }))
                  .filter(c => c.paid > 0 || c.share > 0)

                const maxCatValue = cats.length > 0
                  ? Math.max(...cats.map(c => Math.max(c.paid, c.share)))
                  : 0

                return (
                  <div key={participant.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: participant.color }}
                      />
                      <span className="text-sm font-semibold text-gray-800">{participant.name}</span>
                      {!participant.isActive && (
                        <span className="text-[10px] bg-gray-200 text-gray-400 px-1.5 py-0.5 rounded-full font-medium">已退团</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400">垫付</p>
                        <p className="text-sm font-bold text-gray-800">¥{formatAmount(totalPaid)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400">分摊</p>
                        <p className="text-sm font-bold text-gray-800">¥{formatAmount(totalShare)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400">
                          {netBalance >= 0 ? '应收' : '应付'}
                        </p>
                        <p className={`text-sm font-bold flex items-center justify-center gap-0.5 ${netBalance >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                          {netBalance >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          ¥{formatAmount(Math.abs(netBalance))}
                        </p>
                      </div>
                    </div>

                    {cats.length > 0 && (
                      <div className="space-y-1.5">
                        {cats.map(c => {
                          const paidWidth = maxCatValue > 0 ? (c.paid / maxCatValue) * 100 : 0
                          const shareWidth = maxCatValue > 0 ? (c.share / maxCatValue) * 100 : 0

                          return (
                            <div key={c.key} className="flex items-center gap-2">
                              <span className="text-xs w-5 text-center shrink-0">{c.icon}</span>
                              <div className="flex-1 space-y-0.5">
                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${Math.max(paidWidth, shareWidth)}%`, backgroundColor: c.color, opacity: 0.7 }}
                                  />
                                </div>
                              </div>
                              <span className="text-[10px] text-gray-400 w-16 text-right shrink-0">
                                ¥{formatAmount(c.paid)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-base font-bold text-gray-800 mb-3">未结清金额</h2>
          {settlements.length === 0 ? (
            <div className="text-center py-4">
              <span className="text-2xl">✅</span>
              <p className="text-sm text-gray-500 mt-1">全部结清</p>
            </div>
          ) : (
            <div className="space-y-2">
              {settlements.map((s, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
                      style={{ backgroundColor: getParticipantColor(s.fromId) }}
                    >
                      {getParticipantName(s.fromId).charAt(0)}
                    </div>
                    <span className="text-sm text-gray-700 truncate">{getParticipantName(s.fromId)}</span>
                    <span className="text-xs text-gray-400 shrink-0">应付</span>
                  </div>
                  <span className="text-sm font-bold text-red-500 shrink-0">¥{formatAmount(s.amount)}</span>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-xs text-gray-400 shrink-0">给</span>
                    <span className="text-sm text-gray-700 truncate">{getParticipantName(s.toId)}</span>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
                      style={{ backgroundColor: getParticipantColor(s.toId) }}
                    >
                      {getParticipantName(s.toId).charAt(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30">
        <div className="max-w-md mx-auto flex">
          {[
            { to: `/trip/${trip.id}`, label: '账单', icon: Receipt, active: false },
            { to: `/trip/${trip.id}/settlement`, label: '结算', icon: Calculator, active: false },
            { to: `/trip/${trip.id}/statistics`, label: '统计', icon: BarChart3, active: true },
            { to: `/trip/${trip.id}/shared-fund`, label: '基金', icon: Wallet, active: false },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <Link
                key={tab.label}
                to={tab.to}
                className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors"
                style={{ color: tab.active ? '#f97316' : '#9ca3af' }}
              >
                <Icon size={20} />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
