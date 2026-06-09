import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppState } from '../store/AppContext'
import { CATEGORY_CONFIG, STATUS_CONFIG } from '../types'
import type { Expense, ExpenseStatus, Participant } from '../types'
import { calculateBudgetUsage } from '../utils/settlement'
import { ArrowLeft, Plus, Check, AlertTriangle, Clock, Trash2, Edit, Users, UserMinus, UserPlus, Receipt, Calculator, BarChart3, Wallet, ChevronDown, ChevronUp } from 'lucide-react'

type StatusTab = 'pending' | 'confirmed' | 'disputed'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  return `${s.getMonth() + 1}月${s.getDate()}日 - ${e.getMonth() + 1}月${e.getDate()}日`
}

function formatAmount(amount: number) {
  return amount.toFixed(2)
}

function AvatarCircle({ name, color, size = 24 }: { name: string; color: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-medium shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.45, backgroundColor: color }}
    >
      {name.charAt(0)}
    </div>
  )
}

function StatusBadge({ status }: { status: ExpenseStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  )
}

export default function TripDetail() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useAppState()

  const [activeTab, setActiveTab] = useState<StatusTab>('pending')
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null)
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const [newParticipantName, setNewParticipantName] = useState('')
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const trip = state.trips.find(t => t.id === tripId)

  const budgetUsage = useMemo(() => trip ? calculateBudgetUsage(trip) : null, [trip])

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
  const totalExpenses = trip.expenses.length
  const totalAmount = trip.expenses.reduce((sum: number, e: Expense) => sum + e.amount, 0)

  const expensesByStatus: Record<StatusTab, Expense[]> = {
    pending: trip.expenses.filter((e: Expense) => e.status === 'pending'),
    confirmed: trip.expenses.filter((e: Expense) => e.status === 'confirmed'),
    disputed: trip.expenses.filter((e: Expense) => e.status === 'disputed'),
  }

  const statusCounts = {
    pending: expensesByStatus.pending.length,
    confirmed: expensesByStatus.confirmed.length,
    disputed: expensesByStatus.disputed.length,
  }

  function getParticipant(id: string) {
    return trip.participants.find((p: Participant) => p.id === id)
  }

  function handleDeleteExpense(expenseId: string) {
    dispatch({ type: 'DELETE_EXPENSE', payload: { tripId: trip.id, expenseId } })
  }

  function handleSetStatus(expenseId: string, status: ExpenseStatus) {
    dispatch({ type: 'SET_EXPENSE_STATUS', payload: { tripId: trip.id, expenseId, status } })
  }

  function handleAddParticipant() {
    if (!newParticipantName.trim()) return
    dispatch({ type: 'ADD_PARTICIPANT', payload: { tripId: trip.id, name: newParticipantName.trim() } })
    setNewParticipantName('')
    setShowAddParticipant(false)
  }

  function handleLeaveTrip(participantId: string) {
    dispatch({ type: 'REMOVE_PARTICIPANT', payload: { tripId: trip.id, participantId, leftDate: new Date().toISOString() } })
    setShowLeaveConfirm(false)
  }

  const statusTabConfig: { key: StatusTab; label: string; icon: typeof Clock; accentColor: string }[] = [
    { key: 'pending', label: '待确认', icon: Clock, accentColor: '#f59e0b' },
    { key: 'confirmed', label: '已分摊', icon: Check, accentColor: '#10b981' },
    { key: 'disputed', label: '有争议', icon: AlertTriangle, accentColor: '#ef4444' },
  ]

  const currentExpenses = expensesByStatus[activeTab]

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-r from-orange-500 to-orange-400 text-white">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-white/90 hover:text-white">
            <ArrowLeft size={20} />
            <span className="text-sm">返回</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddParticipant(true)}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <UserPlus size={18} />
            </button>
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <UserMinus size={18} />
            </button>
          </div>
        </div>
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-bold">{trip.destination}</h1>
          <p className="text-white/80 text-sm mt-1">{formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
      </header>

      <div className="px-4 -mt-2">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">预算使用</span>
            <span className="text-sm font-medium">
              <span className="text-orange-500">¥{formatAmount(budgetUsage!.totalSpent)}</span>
              <span className="text-gray-400"> / ¥{formatAmount(trip.budget)}</span>
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(budgetUsage!.percentage, 100)}%`,
                backgroundColor: budgetUsage!.percentage > 90 ? '#ef4444' : budgetUsage!.percentage > 70 ? '#f59e0b' : '#f97316',
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-400">已用 {budgetUsage!.percentage.toFixed(0)}%</span>
            <span className="text-xs text-gray-400">剩余 ¥{formatAmount(budgetUsage!.remaining)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{totalExpenses}</p>
            <p className="text-xs text-gray-400 mt-0.5">笔消费</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-orange-500">¥{formatAmount(totalAmount)}</p>
            <p className="text-xs text-gray-400 mt-0.5">总金额</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{activeParticipants.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">位成员</p>
          </div>
        </div>
      </div>

      <div className="px-4 mb-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {statusTabConfig.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: isActive ? 'white' : 'transparent',
                  color: isActive ? tab.accentColor : '#9ca3af',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <Icon size={16} />
                {tab.label}
                {statusCounts[tab.key] > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: tab.accentColor }}
                  >
                    {statusCounts[tab.key]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4">
        {currentExpenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">
              {activeTab === 'pending' ? '⏳' : activeTab === 'confirmed' ? '✅' : '⚠️'}
            </div>
            <p className="text-gray-400">暂无{STATUS_CONFIG[activeTab].label}的消费</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentExpenses.map(expense => {
              const categoryConfig = CATEGORY_CONFIG[expense.category]
              const payer = getParticipant(expense.payerId)
              const isExpanded = expandedExpenseId === expense.id
              const splitMembers = expense.splitAmong
                .map((id: string) => getParticipant(id))
                .filter(Boolean) as { id: string; name: string; color: string }[]

              return (
                <div
                  key={expense.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                  style={{ borderLeft: `3px solid ${categoryConfig.color}` }}
                >
                  <button
                    onClick={() => setExpandedExpenseId(isExpanded ? null : expense.id)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl shrink-0">{categoryConfig.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 truncate">{expense.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
                            {payer && (
                              <span className="text-xs text-gray-400">
                                {payer.name} 支付
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="font-bold text-gray-800">¥{formatAmount(expense.amount)}</p>
                        <StatusBadge status={expense.status} />
                      </div>
                    </div>

                    {splitMembers.length > 0 && (
                      <div className="flex items-center gap-1 mt-3">
                        <Users size={12} className="text-gray-300 shrink-0" />
                        <div className="flex -space-x-1.5">
                          {splitMembers.slice(0, 5).map(member => (
                            <AvatarCircle key={member.id} name={member.name} color={member.color} size={20} />
                          ))}
                          {splitMembers.length > 5 && (
                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] text-gray-500 font-medium">
                              +{splitMembers.length - 5}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 ml-1">{splitMembers.length}人分摊</span>
                      </div>
                    )}

                    <div className="flex items-center justify-center mt-2">
                      {isExpanded ? <ChevronUp size={16} className="text-gray-300" /> : <ChevronDown size={16} className="text-gray-300" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      {expense.notes && (
                        <p className="text-sm text-gray-500 mt-3 mb-3">{expense.notes}</p>
                      )}

                      {expense.useSharedFund && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <Wallet size={14} className="text-orange-500" />
                          <span className="text-xs text-orange-500 font-medium">使用共享基金支付</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-400">分摊详情：</span>
                        <div className="flex flex-wrap gap-1">
                          {splitMembers.map(member => (
                            <span key={member.id} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {member.name} ¥{formatAmount(expense.amount / splitMembers.length)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {expense.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSetStatus(expense.id, 'confirmed') }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-colors"
                            >
                              <Check size={14} />
                              确认分摊
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSetStatus(expense.id, 'disputed') }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
                            >
                              <AlertTriangle size={14} />
                              提出争议
                            </button>
                          </>
                        )}
                        {expense.status === 'disputed' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSetStatus(expense.id, 'pending') }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium hover:bg-amber-100 transition-colors"
                          >
                            <Clock size={14} />
                            重新待确认
                          </button>
                        )}
                        {expense.status === 'confirmed' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSetStatus(expense.id, 'pending') }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium hover:bg-amber-100 transition-colors"
                          >
                            <Clock size={14} />
                            撤回确认
                          </button>
                        )}

                        <div className="flex-1" />

                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/trip/${trip.id}/edit-expense/${expense.id}`) }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-500 text-xs font-medium hover:bg-gray-100 transition-colors"
                        >
                          <Edit size={14} />
                          编辑
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteExpense(expense.id) }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={14} />
                          删除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Link
        to={`/trip/${trip.id}/add-expense`}
        className="fixed right-4 bottom-24 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-20"
      >
        <Plus size={28} />
      </Link>

      {showAddParticipant && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowAddParticipant(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">添加成员</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newParticipantName}
                onChange={e => setNewParticipantName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddParticipant()}
                placeholder="输入成员姓名"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
                autoFocus
              />
              <button
                onClick={handleAddParticipant}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                添加
              </button>
            </div>
            <button
              onClick={() => setShowAddParticipant(false)}
              className="w-full mt-3 py-2.5 text-gray-400 text-sm hover:text-gray-600"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowLeaveConfirm(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">退团</h3>
            <p className="text-sm text-gray-500 mb-4">选择要退出的成员：</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeParticipants.map((p: Participant) => (
                <button
                  key={p.id}
                  onClick={() => handleLeaveTrip(p.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-red-50 transition-colors text-left"
                >
                  <AvatarCircle name={p.name} color={p.color} />
                  <span className="text-sm font-medium text-gray-700">{p.name}</span>
                  <UserMinus size={16} className="ml-auto text-red-400" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLeaveConfirm(false)}
              className="w-full mt-4 py-2.5 text-gray-400 text-sm hover:text-gray-600"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30">
        <div className="max-w-md mx-auto flex">
          {[
            { to: `/trip/${trip.id}`, label: '账单', icon: Receipt, active: true },
            { to: `/trip/${trip.id}/settlement`, label: '结算', icon: Calculator, active: false },
            { to: `/trip/${trip.id}/statistics`, label: '统计', icon: BarChart3, active: false },
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
