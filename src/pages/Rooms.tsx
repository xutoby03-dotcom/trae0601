import { useState } from 'react'
import { useStore } from '@/store'
import type { MeetingRoom, RoomStatus } from '@/types'
import { EQUIPMENT_OPTIONS, FLOORS } from '@/types'
import {
  Plus,
  X,
  MapPin,
  Users,
  UserCircle,
  Wrench,
  Trash2,
  Edit3,
  Check,
  Search,
  Building2,
} from 'lucide-react'

function RoomForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: MeetingRoom
  onSubmit: (data: Omit<MeetingRoom, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name || '')
  const [floor, setFloor] = useState(initial?.floor || '3F')
  const [capacity, setCapacity] = useState(initial?.capacity || 8)
  const [equipment, setEquipment] = useState<string[]>(initial?.equipment || [])
  const [responsiblePerson, setResponsiblePerson] = useState(initial?.responsiblePerson || '')
  const [status, setStatus] = useState<RoomStatus>(initial?.status || 'active')
  const [customEquip, setCustomEquip] = useState('')

  const toggleEquip = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    )
  }

  const addCustomEquip = () => {
    if (customEquip.trim() && !equipment.includes(customEquip.trim())) {
      setEquipment((prev) => [...prev, customEquip.trim()])
      setCustomEquip('')
    }
  }

  const handleSubmit = () => {
    if (!name.trim() || !responsiblePerson.trim()) return
    onSubmit({ name: name.trim(), floor, capacity, equipment, responsiblePerson: responsiblePerson.trim(), status })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        {initial ? '编辑会议室' : '新增会议室'}
      </h3>
      <div className="mt-5 grid grid-cols-2 gap-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">会议室名称</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：朝阳厅"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">所在楼层</label>
          <select
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
          >
            {FLOORS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">容纳人数</label>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">负责人</label>
          <input
            value={responsiblePerson}
            onChange={(e) => setResponsiblePerson(e.target.value)}
            placeholder="负责人姓名"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">状态</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RoomStatus)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
          >
            <option value="active">正常</option>
            <option value="maintenance">维护中</option>
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-xs font-medium text-slate-500">设备清单</label>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map((item) => (
            <button
              key={item}
              onClick={() => toggleEquip(item)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                equipment.includes(item)
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {equipment.includes(item) && <Check className="h-3 w-3" />}
              {item}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={customEquip}
            onChange={(e) => setCustomEquip(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomEquip()}
            placeholder="自定义设备名称"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
          />
          <button
            onClick={addCustomEquip}
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
          >
            添加
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !responsiblePerson.trim()}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-40"
        >
          {initial ? '保存修改' : '添加会议室'}
        </button>
      </div>
    </div>
  )
}

function RoomCard({ room }: { room: MeetingRoom }) {
  const [isEditing, setIsEditing] = useState(false)
  const allTickets = useStore((s) => s.tickets)
  const tickets = allTickets.filter((t) => t.roomId === room.id)
  const updateRoom = useStore((s) => s.updateRoom)
  const deleteRoom = useStore((s) => s.deleteRoom)
  const activeTickets = tickets.filter(
    (t) => t.status === 'pending' || t.status === 'repairing' || t.status === 'procurement'
  )

  if (isEditing) {
    return (
      <RoomForm
        initial={room}
        onSubmit={(data) => {
          updateRoom(room.id, data)
          setIsEditing(false)
        }}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div
      className={`group relative rounded-2xl border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        room.status === 'maintenance' ? 'border-amber-200' : 'border-slate-200'
      }`}
    >
      {room.status === 'maintenance' && (
        <div className="absolute right-4 top-4 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
          维护中
        </div>
      )}
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
            <span className="flex items-center gap-1">
              <UserCircle className="h-3 w-3" />
              {room.responsiblePerson}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {room.equipment.map((eq) => (
          <span
            key={eq}
            className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
          >
            <Wrench className="h-2.5 w-2.5" />
            {eq}
          </span>
        ))}
      </div>

      {activeTickets.length > 0 && (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          当前有 {activeTickets.length} 个未完成报修工单
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
        >
          <Edit3 className="h-3 w-3" />
          编辑
        </button>
        <button
          onClick={() => deleteRoom(room.id)}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
        >
          <Trash2 className="h-3 w-3" />
          删除
        </button>
      </div>
    </div>
  )
}

export default function Rooms() {
  const rooms = useStore((s) => s.rooms)
  const addRoom = useStore((s) => s.addRoom)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFloor, setFilterFloor] = useState('')

  const filteredRooms = rooms.filter((r) => {
    const matchSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.responsiblePerson.toLowerCase().includes(searchQuery.toLowerCase())
    const matchFloor = !filterFloor || r.floor === filterFloor
    return matchSearch && matchFloor
  })

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">会议室管理</h2>
          <p className="mt-1 text-sm text-slate-500">登记和维护公司会议室信息及设备清单</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          新增会议室
        </button>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索会议室名称或负责人..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-400" />
          <select
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
          >
            <option value="">全部楼层</option>
            {FLOORS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <RoomForm
            onSubmit={(data) => {
              addRoom({ id: `room-${Date.now()}`, ...data })
              setShowForm(false)
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Building2 className="h-12 w-12 text-slate-200" />
          <p className="mt-3 text-sm text-slate-400">没有找到匹配的会议室</p>
        </div>
      )}
    </div>
  )
}
