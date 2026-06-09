import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Bus,
  X,
  MapPin,
  Luggage as LuggageIcon,
  Users,
  User,
  Armchair,
} from 'lucide-react'
import { useRouteStore } from '@/stores/useRouteStore'
import { useReservationStore } from '@/stores/useReservationStore'
import { useEmployeeStore } from '@/stores/useEmployeeStore'
import { useAppStore } from '@/stores/useAppStore'
import type { Reservation, ReservationStatus } from '@/types'

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  reserved: { label: '已预约', bg: 'bg-white/10', text: 'text-white/50' },
  boarded: { label: '已上车', bg: 'bg-green-500/20', text: 'text-green-400' },
  late_no_show: { label: '迟到未上车', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  no_show: { label: '爽约', bg: 'bg-red-500/20', text: 'text-red-400' },
}

function PassengerDrawer({
  reservation,
  onClose,
}: {
  reservation: Reservation
  onClose: () => void
}) {
  const occupied = 1 + reservation.companions
  const sc = statusConfig[reservation.status] ?? statusConfig.reserved

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg bg-[#162d4a] rounded-t-2xl p-5 pb-8 animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">乘客详情</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-[#ff6b35]/20 flex items-center justify-center">
              <User className="w-5 h-5 text-[#ff6b35]" />
            </div>
            <div>
              <div className="text-white font-semibold">{reservation.employeeName}</div>
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${sc.bg} ${sc.text}`}>
                {sc.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#ff6b35]" />
                <span className="text-white/50 text-xs">上车站</span>
              </div>
              <span className="text-white text-sm font-medium">{reservation.boardingStop}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Armchair className="w-3.5 h-3.5 text-[#ff6b35]" />
                <span className="text-white/50 text-xs">占座数</span>
              </div>
              <span className="text-white text-sm font-medium">{occupied} 座</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <LuggageIcon className="w-3.5 h-3.5 text-[#ff6b35]" />
                <span className="text-white/50 text-xs">行李</span>
              </div>
              <span className="text-white text-sm font-medium">{reservation.hasLuggage ? '有' : '无'}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-[#ff6b35]" />
                <span className="text-white/50 text-xs">同行人</span>
              </div>
              <span className="text-white text-sm font-medium">
                {reservation.companions > 0 ? `${reservation.companions} 人` : '无'}
              </span>
            </div>
          </div>

          {reservation.isWaitlisted && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-yellow-300 text-sm">
                候补第 {reservation.waitlistPosition} 位，占 {occupied} 座
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const { routes, deleteRoute, toggleDelay, getTodayRoutes } = useRouteStore()
  const { getReservationsByRoute, getConfirmedByRoute, getWaitlistByRoute, updateStatus, getRemainingSeats, getOccupiedSeats } = useReservationStore()
  const { addCreditRecord } = useEmployeeStore()
  const { selectedDate } = useAppStore()

  const todayRoutes = getTodayRoutes(selectedDate)

  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)
  const [selectedPassengers, setSelectedPassengers] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [drawerReservation, setDrawerReservation] = useState<Reservation | null>(null)

  const toggleExpand = (routeId: string) => {
    setExpandedRoute(expandedRoute === routeId ? null : routeId)
    setSelectedPassengers(new Set())
  }

  const togglePassenger = (resId: string) => {
    const next = new Set(selectedPassengers)
    if (next.has(resId)) {
      next.delete(resId)
    } else {
      next.add(resId)
    }
    setSelectedPassengers(next)
  }

  const isActionable = (r: Reservation) => r.status === 'reserved'

  const toggleAllConfirmed = (confirmed: Reservation[]) => {
    const actionable = confirmed.filter(isActionable)
    const actionableIds = new Set(actionable.map((r) => r.id))
    const allActionableSelected = actionable.length > 0 && actionable.every((r) => selectedPassengers.has(r.id))
    if (allActionableSelected) {
      const next = new Set(selectedPassengers)
      actionableIds.forEach((id) => next.delete(id))
      setSelectedPassengers(next)
    } else {
      const next = new Set(selectedPassengers)
      actionableIds.forEach((id) => next.add(id))
      setSelectedPassengers(next)
    }
  }

  const batchUpdateStatus = (status: ReservationStatus) => {
    selectedPassengers.forEach((resId) => {
      updateStatus(resId, status)
    })
    if (status === 'no_show') {
      const allReservations = todayRoutes.flatMap((r) => getReservationsByRoute(r.id))
      selectedPassengers.forEach((resId) => {
        const res = allReservations.find((r) => r.id === resId)
        if (res) {
          addCreditRecord(res.employeeId, 'no_show', res.routeId, '爽约未上车', 3)
        }
      })
    }
    setSelectedPassengers(new Set())
  }

  const handleDelete = (routeId: string) => {
    if (deleteConfirm === routeId) {
      deleteRoute(routeId)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(routeId)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const typeLabel = (type: 'morning' | 'evening') => (type === 'morning' ? '早班' : '晚班')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2440] to-[#1e3a5f]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bus className="w-7 h-7 text-[#ff6b35]" />
            <h1 className="text-2xl font-bold text-white">管理面板</h1>
          </div>
          <button
            onClick={() => navigate('/admin/add-route?temporary=true')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            临时加车
          </button>
        </div>

        <div className="mb-4 px-1">
          <span className="text-white/60 text-sm">{selectedDate} 线路列表</span>
        </div>

        {todayRoutes.length === 0 && (
          <div className="text-center py-16">
            <Bus className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">今日暂无线路</p>
          </div>
        )}

        <div className="space-y-4">
          {todayRoutes.map((route) => {
            const confirmed = getConfirmedByRoute(route.id)
            const waitlist = getWaitlistByRoute(route.id)
            const remaining = getRemainingSeats(route.id, route.totalSeats)
            const occupied = getOccupiedSeats(route.id)
            const isExpanded = expandedRoute === route.id

            return (
              <div
                key={route.id}
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => toggleExpand(route.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span
                        className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          route.type === 'morning'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-indigo-500/20 text-indigo-400'
                        }`}
                      >
                        {typeLabel(route.type)}
                      </span>
                      {route.isTemporary && (
                        <span className="flex-shrink-0 px-2 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400">
                          临时
                        </span>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate">{route.name}</h3>
                        <p className="text-white/50 text-xs">
                          {route.departure} → {route.destination} · {route.departureTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-white/60 text-xs">
                        {occupied}/{route.totalSeats}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white/40" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/10 px-4 pb-4 pt-3 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => toggleDelay(route.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          route.isDelayed
                            ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/40'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {route.isDelayed ? '已晚点' : '标记晚点'}
                      </button>
                      <button
                        onClick={() => navigate(`/admin/edit-route/${route.id}`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(route.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          deleteConfirm === route.id
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deleteConfirm === route.id ? '确认删除?' : '删除'}
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70 text-xs font-semibold flex items-center gap-1.5">
                          <Armchair className="w-3.5 h-3.5 text-[#ff6b35]" />
                          正式座位 ({confirmed.length}人·{occupied}座{confirmed.filter(isActionable).length > 0 ? `，${confirmed.filter(isActionable).length}人待处理` : ''})
                        </span>
                        {confirmed.length > 0 && (
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                              confirmed.filter(isActionable).length > 0 &&
                              confirmed.filter(isActionable).every((r) => selectedPassengers.has(r.id))
                            }
                              onChange={() => toggleAllConfirmed(confirmed)}
                              className="accent-[#ff6b35] w-3.5 h-3.5 rounded"
                            />
                            <span className="text-white/40 text-xs">全选待处理</span>
                          </label>
                        )}
                      </div>

                      {confirmed.length === 0 && (
                        <p className="text-white/30 text-xs text-center py-3">暂无正式乘客</p>
                      )}

                      <div className="space-y-1.5">
                        {confirmed.map((res) => {
                          const sc = statusConfig[res.status] ?? statusConfig.reserved
                          const actionable = isActionable(res)
                          return (
                            <div
                              key={res.id}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                                actionable ? 'bg-white/5 hover:bg-white/8' : 'bg-white/[0.03]'
                              }`}
                              onClick={() => setDrawerReservation(res)}
                            >
                              <div
                                className="flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPassengers.has(res.id)}
                                  onChange={() => togglePassenger(res.id)}
                                  disabled={!actionable}
                                  className={`w-3.5 h-3.5 rounded ${
                                    actionable ? 'accent-[#ff6b35]' : 'opacity-30 cursor-not-allowed'
                                  }`}
                                />
                              </div>
                              <span className={`text-sm flex-1 truncate ${actionable ? 'text-white' : 'text-white/40'}`}>
                                {res.employeeName}
                              </span>
                              {res.companions > 0 && (
                                <span className="text-[#ff6b35] text-[10px] font-bold bg-[#ff6b35]/15 px-1.5 py-0.5 rounded">
                                  +{res.companions}人·{1 + res.companions}座
                                </span>
                              )}
                              <span className="text-white/40 text-xs truncate max-w-[72px]">
                                {res.boardingStop}
                              </span>
                              <span
                                className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${sc.bg} ${sc.text}`}
                              >
                                {sc.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {waitlist.length > 0 && (
                      <div>
                        <span className="text-white/70 text-xs font-semibold flex items-center gap-1.5 mb-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                          候补排队 ({waitlist.length}人)
                        </span>
                        <div className="space-y-1.5">
                          {waitlist.map((wl) => {
                            const wlSeats = 1 + wl.companions
                            return (
                              <div
                                key={wl.id}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10 hover:bg-yellow-500/10 transition-colors cursor-pointer"
                                onClick={() => setDrawerReservation(wl)}
                              >
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold flex items-center justify-center">
                                  {wl.waitlistPosition}
                                </span>
                                <span className="text-white text-sm flex-1 truncate">
                                  {wl.employeeName}
                                </span>
                                <span className="text-yellow-400/70 text-[10px] font-medium">
                                  占{wlSeats}座
                                </span>
                                <span className="text-white/40 text-xs truncate max-w-[72px]">
                                  {wl.boardingStop}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {selectedPassengers.size > 0 && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => batchUpdateStatus('boarded')}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-medium transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          标记已上车 ({selectedPassengers.size})
                        </button>
                        <button
                          onClick={() => batchUpdateStatus('late_no_show')}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-xs font-medium transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          迟到未上车 ({selectedPassengers.size})
                        </button>
                        <button
                          onClick={() => batchUpdateStatus('no_show')}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          爽约 ({selectedPassengers.size})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {drawerReservation && (
        <PassengerDrawer
          reservation={drawerReservation}
          onClose={() => setDrawerReservation(null)}
        />
      )}
    </div>
  )
}
