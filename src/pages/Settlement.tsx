import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Download, Receipt, Calculator, BarChart3, Wallet } from 'lucide-react'
import { useAppState } from '../store/AppContext'
import type { Participant } from '../types'
import type { Settlement } from '../types'
import { calculateSettlements, calculatePersonExpenses } from '../utils/settlement'
import { downloadReport } from '../utils/export'

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

export default function Settlement() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { state } = useAppState()

  const trip = state.trips.find(t => t.id === tripId)

  const settlements = useMemo((): Settlement[] => trip ? calculateSettlements(trip) : [], [trip])

  interface PersonSummary {
    participant: Participant
    totalPaid: number
    totalShare: number
    netBalance: number
    categoryBreakdown: Record<string, { paid: number; share: number }>
  }

  const personSummaries = useMemo((): PersonSummary[] => {
    if (!trip) return []
    return trip.participants
      .map((p: Participant) => ({
        participant: p,
        ...calculatePersonExpenses(trip, p.id),
      }))
      .filter((ps: PersonSummary) => Math.abs(ps.netBalance) > 0.01 || ps.totalPaid > 0.01 || ps.totalShare > 0.01)
  }, [trip])

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

  function getParticipant(id: string) {
    return trip.participants.find((p: Participant) => p.id === id)
  }

  const activeParticipants = trip.participants.filter((p: Participant) => p.isActive)
  const totalSettlementAmount = settlements.reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-r from-orange-500 to-orange-400 text-white">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-white/90 hover:text-white">
            <ArrowLeft size={20} />
            <span className="text-sm">返回</span>
          </button>
        </div>
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-bold">结算方案</h1>
          <p className="text-white/80 text-sm mt-1">{trip.destination}</p>
        </div>
      </header>

      <div className="px-4 -mt-2">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">需结算笔数</span>
            <span className="text-sm font-medium">
              <span className="text-orange-500">{settlements.length}</span>
              <span className="text-gray-400"> 笔</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">待转账总额</span>
            <span className="text-sm font-medium">
              <span className="text-orange-500">¥{formatAmount(totalSettlementAmount)}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <h2 className="text-base font-semibold text-gray-800 mb-3">💸 结算明细</h2>
        {settlements.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-600 font-medium">所有费用已结清</p>
            <p className="text-gray-400 text-sm mt-1">无需转账，大家两清啦！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.map((settlement, index) => {
              const from = getParticipant(settlement.fromId)
              const to = getParticipant(settlement.toId)
              if (!from || !to) return null

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <AvatarCircle name={from.name} color={from.color} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{from.name}</p>
                        <p className="text-xs text-red-400">需支付</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 mx-3">
                      <span className="text-lg font-bold text-orange-500">¥{formatAmount(settlement.amount)}</span>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50">
                        <ArrowRight size={16} className="text-orange-500" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-0 justify-end">
                      <div className="min-w-0 text-right">
                        <p className="text-sm font-medium text-gray-800 truncate">{to.name}</p>
                        <p className="text-xs text-teal-500">将收到</p>
                      </div>
                      <AvatarCircle name={to.name} color={to.color} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="px-4 mb-4">
        <h2 className="text-base font-semibold text-gray-800 mb-3">👤 个人余额</h2>
        <div className="space-y-2">
          {personSummaries.map(({ participant, totalPaid, totalShare, netBalance }) => {
            const isPositive = netBalance > 0.01
            const isNegative = netBalance < -0.01
            const isSettled = !isPositive && !isNegative

            return (
              <div key={participant.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <AvatarCircle name={participant.name} color={participant.color} />
                  <span className="font-medium text-gray-800">{participant.name}</span>
                  {!participant.isActive && (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">已退团</span>
                  )}
                  {participant.isActive && isSettled && (
                    <span className="ml-auto text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">已结清</span>
                  )}
                  {isPositive && (
                    <span className="ml-auto text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-medium">应收</span>
                  )}
                  {isNegative && (
                    <span className="ml-auto text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">应付</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center bg-gray-50 rounded-lg py-2">
                    <p className="text-xs text-gray-400">已垫付</p>
                    <p className="text-sm font-semibold text-gray-700">¥{formatAmount(totalPaid)}</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg py-2">
                    <p className="text-xs text-gray-400">应分摊</p>
                    <p className="text-sm font-semibold text-gray-700">¥{formatAmount(totalShare)}</p>
                  </div>
                  <div className="text-center rounded-lg py-2"
                    style={{
                      backgroundColor: isPositive ? '#f0fdfa' : isNegative ? '#fef2f2' : '#f9fafb',
                    }}
                  >
                    <p className="text-xs text-gray-400">净余额</p>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: isPositive ? '#14b8a6' : isNegative ? '#ef4444' : '#6b7280',
                      }}
                    >
                      {isPositive ? '+' : ''}{formatAmount(netBalance)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {activeParticipants.length > 0 && (
        <div className="px-4 mb-6">
          <button
            onClick={() => downloadReport(trip)}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 active:from-orange-700 active:to-orange-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
          >
            <Download size={20} />
            导出结算单
          </button>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30">
        <div className="max-w-md mx-auto flex">
          {[
            { to: `/trip/${trip.id}`, label: '账单', icon: Receipt, active: false },
            { to: `/trip/${trip.id}/settlement`, label: '结算', icon: Calculator, active: true },
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
