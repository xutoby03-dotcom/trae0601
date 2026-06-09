import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Wallet, Receipt, Calculator, BarChart3, Users, X, TrendingUp, TrendingDown, HandCoins } from 'lucide-react'
import { useAppState } from '../store/AppContext'
import { CATEGORY_CONFIG } from '../types'
import type { Participant, Expense } from '../types'
import { calculateSharedFundBalance } from '../utils/settlement'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

export default function SharedFund() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useAppState()

  const [showAddPanel, setShowAddPanel] = useState(false)
  const [selectedParticipantId, setSelectedParticipantId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(getToday)

  const trip = state.trips.find(t => t.id === tripId)

  const fundBalance = useMemo(() => trip ? calculateSharedFundBalance(trip) : null, [trip])

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">未找到该旅行</p>
          <Link to="/" className="text-orange-500 font-medium">返回首页</Link>
        </div>
      </div>
    )
  }

  const activeParticipants = trip.participants.filter((p: Participant) => p.isActive)
  const sharedFundExpenses = trip.expenses.filter((e: Expense) => e.useSharedFund && e.status === 'confirmed')
  const balance = fundBalance!

  const usagePct = balance.totalContributed > 0
    ? Math.min((balance.totalUsed / balance.totalContributed) * 100, 100)
    : 0

  function getParticipant(id: string) {
    return trip.participants.find((p: Participant) => p.id === id)
  }

  function handleAddContribution() {
    if (!selectedParticipantId || !amount || parseFloat(amount) <= 0) return
    dispatch({
      type: 'ADD_SHARED_FUND_CONTRIBUTION',
      payload: {
        tripId: trip.id,
        participantId: selectedParticipantId,
        amount: parseFloat(amount),
        date,
      },
    })
    setSelectedParticipantId('')
    setAmount('')
    setDate(getToday())
    setShowAddPanel(false)
  }

  function openAddPanel() {
    if (activeParticipants.length > 0 && !selectedParticipantId) {
      setSelectedParticipantId(activeParticipants[0].id)
    }
    setAmount('')
    setDate(getToday())
    setShowAddPanel(true)
  }

  const barColor = usagePct > 90 ? '#ef4444' : usagePct > 70 ? '#f59e0b' : '#f97316'

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-r from-orange-500 to-orange-400 text-white">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-white/90 hover:text-white">
            <ArrowLeft size={20} />
            <span className="text-sm">返回</span>
          </button>
        </div>
        <div className="px-4 pb-4 flex items-center gap-2">
          <Wallet size={24} />
          <h1 className="text-2xl font-bold">共同基金</h1>
        </div>
      </header>

      <div className="px-4 -mt-2">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">总充值</p>
              <p className="text-lg font-bold text-orange-500">¥{balance.totalContributed.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">已使用</p>
              <p className="text-lg font-bold text-amber-500">¥{balance.totalUsed.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">余额</p>
              <p className={`text-lg font-bold ${balance.remaining >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                ¥{balance.remaining.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${usagePct}%`, backgroundColor: barColor }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-400">已用 {usagePct.toFixed(0)}%</span>
            <span className="text-xs text-gray-400">
              {balance.remaining >= 0 ? '基金充裕' : '基金不足'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
            <HandCoins size={16} className="text-orange-500" />
            充值记录
          </h2>
          <button
            onClick={openAddPanel}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus size={14} />
            添加充值
          </button>
        </div>
        {trip.sharedFund.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl">
            <p className="text-3xl mb-2">💰</p>
            <p className="text-sm text-gray-400">暂无充值记录</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-50">
            {[...trip.sharedFund].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(c => {
              const p = getParticipant(c.participantId)
              return (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: p?.color || '#9ca3af' }}
                  />
                  <span className="text-sm text-gray-700 flex-1">{p?.name || '未知'}</span>
                  <span className="text-sm font-semibold text-orange-500">+¥{c.amount.toFixed(2)}</span>
                  <span className="text-xs text-gray-400">{formatDate(c.date)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="px-4 mb-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5 mb-3">
          <TrendingDown size={16} className="text-amber-500" />
          基金支出
        </h2>
        {sharedFundExpenses.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm text-gray-400">暂无基金支出</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sharedFundExpenses.map((expense: Expense) => {
              const categoryConfig = CATEGORY_CONFIG[expense.category]
              const splitMembers = expense.splitAmong
                .map((id: string) => getParticipant(id))
                .filter(Boolean) as { id: string; name: string; color: string }[]
              return (
                <div
                  key={expense.id}
                  className="bg-white rounded-xl shadow-sm p-3"
                  style={{ borderLeft: `3px solid ${categoryConfig.color}` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xl shrink-0">{categoryConfig.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{expense.description}</p>
                        <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-800 shrink-0 ml-2">¥{expense.amount.toFixed(2)}</span>
                  </div>
                  {splitMembers.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Users size={12} className="text-gray-300 shrink-0" />
                      <div className="flex -space-x-1.5">
                        {splitMembers.slice(0, 5).map(member => (
                          <div
                            key={member.id}
                            className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-medium shrink-0"
                            style={{ backgroundColor: member.color }}
                            title={member.name}
                          >
                            {member.name.charAt(0)}
                          </div>
                        ))}
                        {splitMembers.length > 5 && (
                          <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[9px] text-gray-500 shrink-0">
                            +{splitMembers.length - 5}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 ml-1">{splitMembers.length}人分摊</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="px-4 mb-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5 mb-3">
          <TrendingUp size={16} className="text-emerald-500" />
          每人基金余额
        </h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-50">
          {activeParticipants.map((p: Participant) => {
            const contributed = balance.contributions[p.id] || 0
            const net = balance.netContributions[p.id] || 0
            const used = contributed - net
            return (
              <div key={p.id} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{p.name}</span>
                  <span className="ml-auto text-sm font-bold">
                    {net > 0.01 ? (
                      <span className="text-emerald-500">+¥{net.toFixed(2)}</span>
                    ) : net < -0.01 ? (
                      <span className="text-red-500">-¥{Math.abs(net).toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400">¥0.00</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>充值 ¥{contributed.toFixed(2)}</span>
                  <span>分摊 ¥{used.toFixed(2)}</span>
                  <span className={net > 0.01 ? 'text-emerald-500' : net < -0.01 ? 'text-red-500' : 'text-gray-400'}>
                    {net > 0.01 ? '应收回' : net < -0.01 ? '需补入' : '已平衡'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showAddPanel && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddPanel(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-t-3xl shadow-xl animate-slide-up">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">添加充值</h3>
              <button
                onClick={() => setShowAddPanel(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">参与者</label>
                <select
                  value={selectedParticipantId}
                  onChange={e => setSelectedParticipantId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 text-gray-800 bg-white"
                >
                  <option value="">选择参与者</option>
                  {activeParticipants.map((p: Participant) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">金额 (¥)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 text-gray-800 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 text-gray-800"
                />
              </div>
            </div>
            <div className="border-t border-gray-100 px-5 py-4">
              <button
                onClick={handleAddContribution}
                disabled={!selectedParticipantId || !amount || parseFloat(amount) <= 0}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition-colors"
              >
                确认充值
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30">
        <div className="max-w-md mx-auto flex">
          {[
            { to: `/trip/${trip.id}`, label: '账单', icon: Receipt, active: false },
            { to: `/trip/${trip.id}/settlement`, label: '结算', icon: Calculator, active: false },
            { to: `/trip/${trip.id}/statistics`, label: '统计', icon: BarChart3, active: false },
            { to: `/trip/${trip.id}/shared-fund`, label: '基金', icon: Wallet, active: true },
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
