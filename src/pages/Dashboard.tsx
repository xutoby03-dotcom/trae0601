import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, UserCheck, LogOut, UserX, AlertTriangle, Link as LinkIcon } from 'lucide-react'
import { useStore } from '@/store'
import { formatTime } from '@/utils/helpers'
import type { VisitorStatus, Visitor } from '@/types'

const statusConfig: {
  status: VisitorStatus
  label: string
  icon: typeof Clock
  iconBg: string
  bgGradient: string
  textColor: string
}[] = [
  { status: 'expected', label: '待到访', icon: Clock, iconBg: 'bg-teal-100 text-teal-600', bgGradient: 'from-white to-teal-50', textColor: 'text-teal-600' },
  { status: 'checked-in', label: '已签到', icon: UserCheck, iconBg: 'bg-orange-100 text-orange-500', bgGradient: 'from-white to-orange-50', textColor: 'text-orange-500' },
  { status: 'departed', label: '已离开', icon: LogOut, iconBg: 'bg-emerald-100 text-emerald-600', bgGradient: 'from-white to-emerald-50', textColor: 'text-emerald-600' },
  { status: 'no-show', label: '爽约', icon: UserX, iconBg: 'bg-red-100 text-red-500', bgGradient: 'from-white to-red-50', textColor: 'text-red-500' },
]

const avatarBg: Record<VisitorStatus, string> = {
  expected: 'bg-teal-500',
  'checked-in': 'bg-orange-500',
  departed: 'bg-gray-400',
  'no-show': 'bg-red-500',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const getTodayVisitorsByStatus = useStore((s) => s.getTodayVisitorsByStatus)
  const getUnresolvedRisks = useStore((s) => s.getUnresolvedRisks)
  const checkIn = useStore((s) => s.checkIn)
  const checkOut = useStore((s) => s.checkOut)
  const markNoShow = useStore((s) => s.markNoShow)
  const getEmployee = useStore((s) => s.getEmployee)
  const getMeetingRoom = useStore((s) => s.getMeetingRoom)

  const [activeTab, setActiveTab] = useState<VisitorStatus>('expected')
  const [badgeModal, setBadgeModal] = useState<{ visitor: Visitor; badgeNumber: string } | null>(null)
  const [checkoutVisitor, setCheckoutVisitor] = useState<Visitor | null>(null)
  const [badgeReturned, setBadgeReturned] = useState(true)

  const visitorsByStatus = statusConfig.map((c) => ({
    ...c,
    visitors: getTodayVisitorsByStatus(c.status),
  }))

  const risks = getUnresolvedRisks()
  const activeVisitors = visitorsByStatus.find((g) => g.status === activeTab)?.visitors ?? []

  const handleCheckIn = (appointmentId: string) => {
    const visitor = checkIn(appointmentId)
    if (visitor && visitor.badgeNumber) {
      setBadgeModal({ visitor, badgeNumber: visitor.badgeNumber })
    }
  }

  const handleCheckOut = () => {
    if (!checkoutVisitor) return
    checkOut(checkoutVisitor.id, badgeReturned)
    setCheckoutVisitor(null)
    setBadgeReturned(true)
  }

  const handleMarkNoShow = (visitorId: string) => {
    markNoShow(visitorId)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {visitorsByStatus.map((g) => {
          const Icon = g.icon
          return (
            <div
              key={g.status}
              className={`rounded-xl p-5 bg-gradient-to-br ${g.bgGradient} shadow-sm border border-gray-100`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${g.iconBg}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${g.textColor}`}>{g.visitors.length}</div>
                  <div className="text-sm text-gray-500">{g.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {risks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-red-700 font-semibold">
              <AlertTriangle size={18} />
              <span>风险提醒</span>
              <span className="bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full">{risks.length}</span>
            </div>
            <button
              onClick={() => navigate('/alerts')}
              className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              查看全部 <LinkIcon size={14} />
            </button>
          </div>
          <ul className="space-y-1">
            {risks.slice(0, 3).map((r) => (
              <li key={r.id} className="text-sm text-red-600 flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {r.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="flex border-b border-gray-200">
          {visitorsByStatus.map((g) => (
            <button
              key={g.status}
              onClick={() => setActiveTab(g.status)}
              className={`px-4 py-3 text-sm font-medium relative transition-colors ${
                activeTab === g.status
                  ? 'text-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{g.label}</span>
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === g.status ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {g.visitors.length}
              </span>
              {activeTab === g.status && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {activeVisitors.length === 0 && (
            <div className="text-center py-12 text-gray-400">暂无访客记录</div>
          )}
          {activeVisitors.map((v) => {
            const host = getEmployee(v.hostId)
            const room = getMeetingRoom(v.meetingRoomId)
            return (
              <div
                key={v.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex items-center gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${avatarBg[v.status]}`}
                >
                  {v.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{v.name}</div>
                  <div className="text-sm text-gray-500">{v.company}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {formatTime(v.expectedArrival)}
                    {host && ` · 接待人: ${host.name}`}
                    {room && ` · ${room.name}`}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 shrink-0">
                  {v.purpose}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {v.status === 'expected' && (
                    <>
                      <button
                        onClick={() => handleCheckIn(v.appointmentId)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                      >
                        签到
                      </button>
                      <button
                        onClick={() => handleMarkNoShow(v.id)}
                        className="px-3 py-1.5 text-sm rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        爽约
                      </button>
                    </>
                  )}
                  {v.status === 'checked-in' && (
                    <>
                      <button
                        onClick={() => {
                          setBadgeReturned(true)
                          setCheckoutVisitor(v)
                        }}
                        className="px-3 py-1.5 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                      >
                        签退
                      </button>
                    </>
                  )}
                  {v.status === 'departed' && (
                    <span className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-500">
                      已离开
                    </span>
                  )}
                  {v.status === 'no-show' && (
                    <span className="px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-500">
                      爽约
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {badgeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setBadgeModal(null)}>
          <div
            className="bg-white rounded-2xl p-8 text-center shadow-xl min-w-[320px] animate-[scaleIn_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-gray-500 text-sm mb-2">访客牌号</div>
            <div className="text-5xl font-bold text-teal-600 mb-6 animate-[fadeInUp_0.3s_ease-out]">
              {badgeModal.badgeNumber}
            </div>
            <div className="text-gray-600 mb-1">{badgeModal.visitor.name}</div>
            <div className="text-sm text-gray-400 mb-6">{badgeModal.visitor.company}</div>
            <button
              onClick={() => setBadgeModal(null)}
              className="px-8 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              确认
            </button>
          </div>
        </div>
      )}

      {checkoutVisitor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setCheckoutVisitor(null)}>
          <div
            className="bg-white rounded-2xl p-6 shadow-xl min-w-[320px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-semibold text-gray-900 mb-4">确认签退</div>
            <div className="text-gray-600 mb-4">{checkoutVisitor.name} · {checkoutVisitor.company}</div>
            <label className="flex items-center gap-3 mb-6 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={badgeReturned}
                onChange={(e) => setBadgeReturned(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">访客牌已归还</span>
            </label>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCheckoutVisitor(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCheckOut}
                className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                确认签退
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
