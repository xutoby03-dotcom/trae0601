import { useState } from 'react'
import { useStore } from '@/store'
import { formatDateTime } from '@/utils/helpers'
import type { AppointmentStatus } from '@/types'

const PURPOSE_OPTIONS = ['商务洽谈', '面试', '供应商拜访', '合作洽谈', '其他']

const STATUS_TABS: { label: string; value: AppointmentStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已取消', value: 'cancelled' },
  { label: '已完成', value: 'completed' },
]

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-teal-100 text-teal-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  cancelled: '已取消',
  completed: '已完成',
}

const emptyForm = {
  visitorName: '',
  visitorCompany: '',
  visitorPhone: '',
  visitorLicensePlate: '',
  expectedArrival: '',
  expectedDeparture: '',
  hostId: '',
  meetingRoomId: '',
  purpose: '',
  hostConfirmed: false,
}

export default function Appointment() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [successMsg, setSuccessMsg] = useState('')

  const appointments = useStore((s) => s.appointments)
  const employees = useStore((s) => s.employees)
  const meetingRooms = useStore((s) => s.meetingRooms)
  const addAppointment = useStore((s) => s.addAppointment)
  const getEmployee = useStore((s) => s.getEmployee)
  const getMeetingRoom = useStore((s) => s.getMeetingRoom)
  const confirmHost = useStore((s) => s.confirmHost)
  const updateAppointmentStatus = useStore((s) => s.updateAppointmentStatus)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addAppointment({
      visitorName: form.visitorName,
      visitorCompany: form.visitorCompany,
      visitorPhone: form.visitorPhone,
      visitorLicensePlate: form.visitorLicensePlate,
      expectedArrival: form.expectedArrival ? new Date(form.expectedArrival).toISOString() : '',
      expectedDeparture: form.expectedDeparture ? new Date(form.expectedDeparture).toISOString() : '',
      hostId: form.hostId,
      meetingRoomId: form.meetingRoomId,
      purpose: form.purpose,
      hostConfirmed: form.hostConfirmed,
    })
    setForm(emptyForm)
    setShowForm(false)
    setSuccessMsg('预约创建成功！')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const filtered = appointments.filter((apt) => {
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return apt.visitorName.toLowerCase().includes(q) || apt.visitorCompany.toLowerCase().includes(q)
    }
    return true
  })

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">预约登记</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          新建预约
        </button>
      </div>

      {successMsg && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{successMsg}</div>
      )}

      {showForm && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">访客姓名 *</label>
                <input
                  type="text"
                  required
                  value={form.visitorName}
                  onChange={(e) => updateField('visitorName', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">访客公司 *</label>
                <input
                  type="text"
                  required
                  value={form.visitorCompany}
                  onChange={(e) => updateField('visitorCompany', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">联系电话</label>
                <input
                  type="text"
                  value={form.visitorPhone}
                  onChange={(e) => updateField('visitorPhone', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">车牌号</label>
                <input
                  type="text"
                  value={form.visitorLicensePlate}
                  onChange={(e) => updateField('visitorLicensePlate', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">来访时间 *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.expectedArrival}
                  onChange={(e) => updateField('expectedArrival', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">预计离开 *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.expectedDeparture}
                  onChange={(e) => updateField('expectedDeparture', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">接待人</label>
                <select
                  value={form.hostId}
                  onChange={(e) => updateField('hostId', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">请选择</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.department}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">会议室</label>
                <select
                  value={form.meetingRoomId}
                  onChange={(e) => updateField('meetingRoomId', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">请选择</option>
                  {meetingRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.floor}, {room.capacity}人)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">访问目的</label>
                <select
                  value={form.purpose}
                  onChange={(e) => updateField('purpose', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">请选择</option>
                  {PURPOSE_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="hostConfirmed"
                  checked={form.hostConfirmed}
                  onChange={(e) => updateField('hostConfirmed', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="hostConfirmed" className="text-sm font-medium text-gray-700">
                  接待人已确认
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                提交预约
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm) }}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  statusFilter === tab.value
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="搜索访客姓名或公司"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">访客姓名</th>
                <th className="px-6 py-3 font-medium">公司</th>
                <th className="px-6 py-3 font-medium">来访时间</th>
                <th className="px-6 py-3 font-medium">接待人</th>
                <th className="px-6 py-3 font-medium">会议室</th>
                <th className="px-6 py-3 font-medium">目的</th>
                <th className="px-6 py-3 font-medium">状态</th>
                <th className="px-6 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((apt) => {
                const host = getEmployee(apt.hostId)
                const room = getMeetingRoom(apt.meetingRoomId)
                return (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{apt.visitorName}</td>
                    <td className="px-6 py-3 text-gray-600">{apt.visitorCompany}</td>
                    <td className="px-6 py-3 text-gray-600">{formatDateTime(apt.expectedArrival)}</td>
                    <td className="px-6 py-3 text-gray-600">{host?.name ?? '-'}</td>
                    <td className="px-6 py-3 text-gray-600">{room?.name ?? '-'}</td>
                    <td className="px-6 py-3 text-gray-600">{apt.purpose}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[apt.status]}`}>
                        {STATUS_LABELS[apt.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        {apt.status === 'pending' && !apt.hostConfirmed && (
                          <button
                            onClick={() => confirmHost(apt.id)}
                            className="rounded px-2 py-1 text-xs font-medium text-teal-600 hover:bg-teal-50"
                          >
                            确认接待
                          </button>
                        )}
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                            className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            取消
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">暂无预约数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
