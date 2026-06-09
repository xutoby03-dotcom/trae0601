import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { EQUIPMENT_OPTIONS } from '@/types'
import {
  ArrowRightLeft,
  MapPin,
  Users,
  Wrench,
  Check,
  Search,
  Sparkles,
  Building2,
} from 'lucide-react'

export default function Alternatives() {
  const [requiredEquipment, setRequiredEquipment] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const rooms = useStore((s) => s.rooms)
  const tickets = useStore((s) => s.tickets)

  const availableRooms = useMemo(() => {
    const roomIdsWithActiveTickets = new Set(
      tickets
        .filter((t) => t.status === 'pending' || t.status === 'repairing' || t.status === 'procurement')
        .map((t) => t.roomId)
    )
    return rooms.filter((r) => {
      if (r.status !== 'active') return false
      if (roomIdsWithActiveTickets.has(r.id)) return false
      if (requiredEquipment && !r.equipment.includes(requiredEquipment)) return false
      return true
    })
  }, [rooms, tickets, requiredEquipment])

  const activeTickets = tickets.filter(
    (t) => t.status === 'pending' || t.status === 'repairing' || t.status === 'procurement'
  )
  const roomIdsWithIssues = new Set(activeTickets.map((t) => t.roomId))
  const roomsWithIssues = rooms.filter((r) => roomIdsWithIssues.has(r.id))

  const filteredAvailable = availableRooms.filter((r) => {
    if (!searchQuery) return true
    return (
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.floor.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">替代会议室建议</h2>
        <p className="mt-1 text-sm text-slate-500">设备故障时，快速找到可用的替代会议室</p>
      </div>

      <div className="mb-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
        <div className="flex items-center gap-2 text-amber-700">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">当前有 {activeTickets.length} 个活跃报修工单</span>
        </div>
        <p className="mt-1 text-sm text-amber-600">
          以下会议室当前有设备故障，建议使用右侧推荐的替代会议室
        </p>
        {roomsWithIssues.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {roomsWithIssues.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
              >
                <MapPin className="h-3 w-3" />
                {r.name} ({r.floor})
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索会议室名称或楼层..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-slate-400" />
          <select
            value={requiredEquipment}
            onChange={(e) => setRequiredEquipment(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
          >
            <option value="">全部设备</option>
            {EQUIPMENT_OPTIONS.map((eq) => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <ArrowRightLeft className="h-4 w-4" />
        <span>找到 {filteredAvailable.length} 个可用替代会议室</span>
      </div>

      {filteredAvailable.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16">
          <Building2 className="h-12 w-12 text-slate-200" />
          <p className="mt-3 text-sm text-slate-400">没有找到符合条件的空闲会议室</p>
          <p className="mt-1 text-xs text-slate-300">尝试更换设备筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAvailable.map((room) => {
            const matchedEquip = requiredEquipment
              ? room.equipment.includes(requiredEquipment)
              : true
            return (
              <div
                key={room.id}
                className="rounded-2xl border border-emerald-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{room.name}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {room.floor}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {room.capacity}人
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600">
                    <Check className="h-3 w-3" />
                    可用
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {room.equipment.map((eq) => (
                    <span
                      key={eq}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        matchedEquip && eq === requiredEquipment
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Wrench className="h-2.5 w-2.5" />
                      {eq}
                    </span>
                  ))}
                </div>

                <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  负责人：{room.responsiblePerson}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
