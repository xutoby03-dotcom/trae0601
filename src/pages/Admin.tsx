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
} from 'lucide-react'
import { useRouteStore } from '@/stores/useRouteStore'
import { useReservationStore } from '@/stores/useReservationStore'
import { useEmployeeStore } from '@/stores/useEmployeeStore'
import { useAppStore } from '@/stores/useAppStore'
import type { ReservationStatus } from '@/types'

export default function Admin() {
  const navigate = useNavigate()
  const { routes, deleteRoute, toggleDelay, getTodayRoutes } = useRouteStore()
  const { getReservationsByRoute, updateStatus, getRemainingSeats } = useReservationStore()
  const { addCreditRecord } = useEmployeeStore()
  const { selectedDate } = useAppStore()

  const todayRoutes = getTodayRoutes(selectedDate)

  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)
  const [selectedPassengers, setSelectedPassengers] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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

  const toggleAllPassengers = (reservations: { id: string }[]) => {
    if (selectedPassengers.size === reservations.length) {
      setSelectedPassengers(new Set())
    } else {
      setSelectedPassengers(new Set(reservations.map((r) => r.id)))
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
            const reservations = getReservationsByRoute(route.id)
            const remaining = getRemainingSeats(route.id, route.totalSeats)
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
                        {route.totalSeats - remaining}/{route.totalSeats}
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
                  <div className="border-t border-white/10 px-4 pb-4 pt-3 space-y-3">
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
                        <span className="text-white/60 text-xs font-medium">
                          乘客列表 ({reservations.length})
                        </span>
                        {reservations.length > 0 && (
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                reservations.length > 0 &&
                                selectedPassengers.size === reservations.length
                              }
                              onChange={() => toggleAllPassengers(reservations)}
                              className="accent-[#ff6b35] w-3.5 h-3.5 rounded"
                            />
                            <span className="text-white/40 text-xs">全选</span>
                          </label>
                        )}
                      </div>

                      {reservations.length === 0 && (
                        <p className="text-white/30 text-xs text-center py-3">暂无乘客</p>
                      )}

                      <div className="space-y-1.5">
                        {reservations.map((res) => (
                          <div
                            key={res.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPassengers.has(res.id)}
                              onChange={() => togglePassenger(res.id)}
                              className="accent-[#ff6b35] w-3.5 h-3.5 rounded flex-shrink-0"
                            />
                            <span className="text-white text-sm flex-1 truncate">
                              {res.employeeName}
                            </span>
                            <span className="text-white/40 text-xs truncate max-w-[80px]">
                              {res.boardingStop}
                            </span>
                            <span
                              className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                                res.status === 'boarded'
                                  ? 'bg-green-500/20 text-green-400'
                                  : res.status === 'late_no_show'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : res.status === 'no_show'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-white/10 text-white/50'
                              }`}
                            >
                              {res.status === 'reserved'
                                ? '已预约'
                                : res.status === 'boarded'
                                ? '已上车'
                                : res.status === 'late_no_show'
                                ? '迟到未上车'
                                : res.status === 'no_show'
                                ? '爽约'
                                : res.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

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
    </div>
  )
}
