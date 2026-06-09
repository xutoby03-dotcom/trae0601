import { useGroomingStore } from '@/store/useGroomingStore'
import { groupByStatus, useAutoStatusUpdate, formatDateTime } from '@/utils/helpers'
import { STATUS_LABELS, SERVICE_LABELS, REMINDER_TYPE_LABELS } from '@/types'
import type { AppointmentStatus } from '@/types'
import { useNavigate } from 'react-router-dom'
import { Clock, MapPin, AlertTriangle, Bell, ChevronRight, PawPrint, Check } from 'lucide-react'
import { parse, startOfDay, differenceInDays, format, parseISO, isValid } from 'date-fns'

function parseReminderDate(dueDate: string): Date {
  const fromLocal = parse(dueDate, 'yyyy-MM-dd', new Date())
  if (isValid(fromLocal)) return fromLocal
  const fromIso = parseISO(dueDate)
  if (isValid(fromIso)) return startOfDay(fromIso)
  return new Date(dueDate)
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-50 border-amber-200',
  today: 'bg-emerald-50 border-emerald-200',
  pickup: 'bg-sky-50 border-sky-200',
  completed: 'bg-gray-50 border-gray-200',
}

const STATUS_DOT_COLORS: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-400',
  today: 'bg-emerald-400',
  pickup: 'bg-sky-400',
  completed: 'bg-gray-400',
}

const STATUS_HEADER_COLORS: Record<AppointmentStatus, string> = {
  pending: 'text-amber-700',
  today: 'text-emerald-700',
  pickup: 'text-sky-700',
  completed: 'text-gray-500',
}

export default function Home() {
  useAutoStatusUpdate()
  const navigate = useNavigate()
  const pets = useGroomingStore((s) => s.pets)
  const appointments = useGroomingStore((s) => s.appointments)
  const reminders = useGroomingStore((s) => s.reminders)
  const groomingRecords = useGroomingStore((s) => s.groomingRecords)
  const completeReminder = useGroomingStore((s) => s.completeReminder)

  const grouped = groupByStatus(appointments)
  const activeAppointments = appointments.filter((a) => a.status !== 'completed')

  const overdueReminders = reminders.filter((r) => {
    if (r.isCompleted) return false
    return parseReminderDate(r.dueDate) < startOfDay(new Date())
  })
  const upcomingReminders = reminders.filter((r) => {
    if (r.isCompleted) return false
    const diff = differenceInDays(parseReminderDate(r.dueDate), startOfDay(new Date()))
    return diff >= 0 && diff <= 7
  })

  const getPetName = (petId: string) => pets.find((p) => p.id === petId)?.name ?? '未知'
  const getPetAvatar = (petId: string) => pets.find((p) => p.id === petId)?.avatar

  return (
    <div className="space-y-6">
      {overdueReminders.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-red-500" />
            <span className="font-semibold text-red-700 text-sm">已过期提醒</span>
          </div>
          <div className="space-y-2">
            {overdueReminders.map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-sm text-red-600 bg-white/60 rounded-lg px-3 py-2">
                <Bell size={14} className="shrink-0" />
                <span className="flex-1">{getPetName(r.petId)} - {REMINDER_TYPE_LABELS[r.type]}</span>
                <span className="text-red-400 text-xs shrink-0">({format(parseReminderDate(r.dueDate), 'MM/dd')})</span>
                <button
                  onClick={(e) => { e.stopPropagation(); completeReminder(r.id) }}
                  className="shrink-0 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                  title="标记完成"
                >
                  <Check size={12} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingReminders.length > 0 && (
        <div className="bg-[#FFF3E0] border border-[#E8A87C]/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={18} className="text-[#E8A87C]" />
            <span className="font-semibold text-[#3D2B1F] text-sm">即将到期</span>
          </div>
          <div className="space-y-2">
            {upcomingReminders.map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-sm text-[#3D2B1F] bg-white/60 rounded-lg px-3 py-2">
                <Bell size={14} className="shrink-0 text-[#E8A87C]" />
                <span className="flex-1">{getPetName(r.petId)} - {REMINDER_TYPE_LABELS[r.type]}</span>
                <span className="text-[#8B7E74] text-xs shrink-0">({format(parseReminderDate(r.dueDate), 'MM/dd')})</span>
                <button
                  onClick={(e) => { e.stopPropagation(); completeReminder(r.id) }}
                  className="shrink-0 w-6 h-6 rounded-full bg-[#E8A87C]/20 hover:bg-[#E8A87C]/40 flex items-center justify-center transition-colors"
                  title="标记完成"
                >
                  <Check size={12} className="text-[#E8A87C]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pets.length === 0 && activeAppointments.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="font-display text-2xl text-[#3D2B1F] mb-2">还没有宠物档案</h2>
          <p className="text-[#8B7E74] mb-6">先添加你的毛孩，开始记录美容之旅吧</p>
          <button
            onClick={() => navigate('/pets')}
            className="bg-[#E8A87C] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#d4956a] transition-colors shadow-md"
          >
            添加宠物
          </button>
        </div>
      )}

      {(pets.length > 0 || activeAppointments.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(STATUS_LABELS) as AppointmentStatus[]).map((status) => {
            const items = grouped[status]
            if (status === 'completed') return null
            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                  <h3 className={`font-semibold text-sm ${STATUS_HEADER_COLORS[status]}`}>
                    {STATUS_LABELS[status]}
                  </h3>
                  <span className="text-xs text-[#8B7E74] bg-white/60 px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2 min-h-[120px]">
                  {items.length === 0 && (
                    <div className="text-xs text-[#8B7E74] text-center py-8 opacity-60">暂无</div>
                  )}
                  {items.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => navigate(`/appointments/${apt.id}`)}
                      className={`border rounded-xl p-3 cursor-pointer hover:shadow-md transition-all duration-200 ${STATUS_COLORS[status]}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">
                          {getPetAvatar(apt.petId) ? (
                            <img src={getPetAvatar(apt.petId)} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <PawPrint size={16} className="text-[#E8A87C]" />
                          )}
                        </div>
                        <span className="font-medium text-sm text-[#3D2B1F]">{getPetName(apt.petId)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {apt.services.slice(0, 3).map((svc) => (
                          <span key={svc} className="text-[10px] bg-white/70 text-[#3D2B1F] px-1.5 py-0.5 rounded-md">
                            {SERVICE_LABELS[svc]}
                          </span>
                        ))}
                        {apt.services.length > 3 && (
                          <span className="text-[10px] text-[#8B7E74]">+{apt.services.length - 3}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#8B7E74]">
                        <Clock size={10} />
                        <span>{formatDateTime(apt.datetime)}</span>
                      </div>
                      {apt.shopName && (
                        <div className="flex items-center gap-1 text-[10px] text-[#8B7E74] mt-0.5">
                          <MapPin size={10} />
                          <span>{apt.shopName}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {grouped.completed.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <h3 className="font-semibold text-sm text-gray-500">{STATUS_LABELS.completed}</h3>
              <span className="text-xs text-[#8B7E74] bg-white/60 px-2 py-0.5 rounded-full">{grouped.completed.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {grouped.completed.slice(0, 4).map((apt) => {
              const record = groomingRecords.find((r) => r.appointmentId === apt.id)
              return (
                <div
                  key={apt.id}
                  onClick={() => navigate(`/appointments/${apt.id}`)}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 cursor-pointer hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <PawPrint size={14} className="text-gray-400" />
                    <span className="font-medium text-sm text-gray-600">{getPetName(apt.petId)}</span>
                  </div>
                  <div className="text-[10px] text-gray-400">{formatDateTime(apt.datetime)}</div>
                  {record && (
                    <div className="text-[10px] text-gray-400 mt-1">
                      实际花费 ¥{record.actualCost}
                    </div>
                  )}
                </div>
              )
            })}
            {grouped.completed.length > 4 && (
              <div
                onClick={() => navigate('/appointments')}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-center cursor-pointer hover:shadow-md transition-all text-gray-400 text-sm"
              >
                查看全部 <ChevronRight size={14} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
