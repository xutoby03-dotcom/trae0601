import { useMemo } from 'react'
import { useStore } from '@/store'
import { STATUS_LABELS } from '@/types'
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Wrench,
  Building2,
  Package,
  Zap,
} from 'lucide-react'

export default function Stats() {
  const rooms = useStore((s) => s.rooms)
  const tickets = useStore((s) => s.tickets)

  const stats = useMemo(() => {
    const resolvedTickets = tickets.filter((t) => t.status === 'resolved' && t.completedAt && t.createdAt)
    const avgRepairMs = resolvedTickets.length
      ? resolvedTickets.reduce((acc, t) => {
          const repairTime = new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime()
          return acc + repairTime
        }, 0) / resolvedTickets.length
      : 0
    const avgRepairHours = Math.round(avgRepairMs / (1000 * 60 * 60) * 10) / 10

    const roomTicketCount: Record<string, number> = {}
    tickets.forEach((t) => {
      roomTicketCount[t.roomId] = (roomTicketCount[t.roomId] || 0) + 1
    })
    const roomRanking = Object.entries(roomTicketCount)
      .map(([roomId, count]) => {
        const room = rooms.find((r) => r.id === roomId)
        return { roomId, name: room?.name || '未知', floor: room?.floor || '', count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const equipFaultCount: Record<string, number> = {}
    tickets.forEach((t) => {
      equipFaultCount[t.equipmentType] = (equipFaultCount[t.equipmentType] || 0) + 1
    })
    const equipRanking = Object.entries(equipFaultCount)
      .map(([equipment, count]) => ({ equipment, count }))
      .sort((a, b) => b.count - a.count)

    const statusCount: Record<string, number> = {}
    tickets.forEach((t) => {
      statusCount[t.status] = (statusCount[t.status] || 0) + 1
    })

    const floorCount: Record<string, number> = {}
    tickets.forEach((t) => {
      const room = rooms.find((r) => r.id === t.roomId)
      if (room) {
        floorCount[room.floor] = (floorCount[room.floor] || 0) + 1
      }
    })
    const floorRanking = Object.entries(floorCount)
      .map(([floor, count]) => ({ floor, count }))
      .sort((a, b) => b.count - a.count)

    const maxRoomCount = roomRanking.length > 0 ? roomRanking[0].count : 1
    const maxEquipCount = equipRanking.length > 0 ? equipRanking[0].count : 1
    const maxFloorCount = floorRanking.length > 0 ? floorRanking[0].count : 1

    const urgentCount = tickets.filter((t) => t.urgency === 'urgent').length
    const vendorCount = tickets.filter((t) => t.needVendor).length

    return {
      total: tickets.length,
      avgRepairHours,
      roomRanking,
      equipRanking,
      statusCount,
      floorRanking,
      maxRoomCount,
      maxEquipCount,
      maxFloorCount,
      urgentCount,
      vendorCount,
      resolvedTickets: resolvedTickets.length,
    }
  }, [tickets, rooms])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">统计概览</h2>
        <p className="mt-1 text-sm text-slate-500">会议室设备报修数据分析与排行</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">工单总数</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <BarChart3 className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">平均修复时间</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {stats.avgRepairHours}<span className="text-base font-medium text-slate-400">h</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">紧急工单</p>
              <p className="mt-1 text-3xl font-bold text-red-600">{stats.urgentCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <Zap className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">需外部供应商</p>
              <p className="mt-1 text-3xl font-bold text-purple-600">{stats.vendorCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <Package className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-600" />
            <h3 className="text-base font-semibold text-slate-900">问题最多会议室 Top 5</h3>
          </div>
          {stats.roomRanking.length === 0 ? (
            <p className="text-sm text-slate-400">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {stats.roomRanking.map((item, idx) => (
                <div key={item.roomId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold ${
                          idx === 0
                            ? 'bg-red-100 text-red-700'
                            : idx === 1
                            ? 'bg-orange-100 text-orange-700'
                            : idx === 2
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-900">{item.name}</span>
                      <span className="text-xs text-slate-400">{item.floor}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{item.count} 次</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-red-400' : idx === 1 ? 'bg-orange-400' : idx === 2 ? 'bg-amber-400' : 'bg-slate-300'
                      }`}
                      style={{ width: `${(item.count / stats.maxRoomCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-slate-600" />
            <h3 className="text-base font-semibold text-slate-900">最常故障设备排行</h3>
          </div>
          {stats.equipRanking.length === 0 ? (
            <p className="text-sm text-slate-400">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {stats.equipRanking.map((item, idx) => (
                <div key={item.equipment}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold ${
                          idx === 0
                            ? 'bg-red-100 text-red-700'
                            : idx === 1
                            ? 'bg-orange-100 text-orange-700'
                            : idx === 2
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-900">{item.equipment}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{item.count} 次</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-red-400' : idx === 1 ? 'bg-orange-400' : idx === 2 ? 'bg-amber-400' : 'bg-slate-300'
                      }`}
                      style={{ width: `${(item.count / stats.maxEquipCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-slate-600" />
            <h3 className="text-base font-semibold text-slate-900">各楼层报修数</h3>
          </div>
          {stats.floorRanking.length === 0 ? (
            <p className="text-sm text-slate-400">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {stats.floorRanking.map((item, idx) => (
                <div key={item.floor}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900">{item.floor}</span>
                    <span className="font-semibold text-slate-700">{item.count} 次</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-400 transition-all duration-500"
                      style={{ width: `${(item.count / stats.maxFloorCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-slate-600" />
            <h3 className="text-base font-semibold text-slate-900">工单状态分布</h3>
          </div>
          <div className="space-y-3">
            {(['pending', 'repairing', 'resolved', 'procurement'] as const).map((status) => {
              const count = stats.statusCount[status] || 0
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
              const colors: Record<string, string> = {
                pending: 'bg-amber-400',
                repairing: 'bg-blue-400',
                resolved: 'bg-emerald-400',
                procurement: 'bg-purple-400',
              }
              const textColors: Record<string, string> = {
                pending: 'text-amber-700',
                repairing: 'text-blue-700',
                resolved: 'text-emerald-700',
                procurement: 'text-purple-700',
              }
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className={`font-medium ${textColors[status]}`}>{STATUS_LABELS[status]}</span>
                    <span className="font-semibold text-slate-700">
                      {count} <span className="text-xs text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${colors[status]} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
