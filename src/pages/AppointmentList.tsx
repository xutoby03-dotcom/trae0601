import { useGroomingStore } from '@/store/useGroomingStore'
import { STATUS_LABELS, SERVICE_LABELS } from '@/types'
import { formatDateTime } from '@/utils/helpers'
import { useNavigate } from 'react-router-dom'
import { Clock, MapPin, PawPrint } from 'lucide-react'
import type { AppointmentStatus } from '@/types'

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-50 border-amber-200',
  today: 'bg-emerald-50 border-emerald-200',
  pickup: 'bg-sky-50 border-sky-200',
  completed: 'bg-gray-50 border-gray-200',
}

const STATUS_DOT: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-400',
  today: 'bg-emerald-400',
  pickup: 'bg-sky-400',
  completed: 'bg-gray-400',
}

export default function AppointmentList() {
  const navigate = useNavigate()
  const appointments = useGroomingStore((s) => s.appointments)
  const pets = useGroomingStore((s) => s.pets)
  const groomingRecords = useGroomingStore((s) => s.groomingRecords)

  const sorted = [...appointments].sort((a, b) => {
    const statusOrder: Record<AppointmentStatus, number> = { pending: 0, today: 1, pickup: 2, completed: 3 }
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status]
    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  })

  const getPetName = (petId: string) => pets.find((p) => p.id === petId)?.name ?? '未知'
  const getPetAvatar = (petId: string) => pets.find((p) => p.id === petId)?.avatar

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-[#3D2B1F]">预约记录</h2>
        <button
          onClick={() => navigate('/appointments/new')}
          className="bg-[#E8A87C] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#d4956a] transition-colors shadow-md"
        >
          + 新预约
        </button>
      </div>

      {appointments.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📅</div>
          <p className="text-[#8B7E74]">还没有预约记录</p>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((apt) => {
          const record = groomingRecords.find((r) => r.appointmentId === apt.id)
          return (
            <div
              key={apt.id}
              onClick={() => navigate(`/appointments/${apt.id}`)}
              className={`border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${STATUS_COLORS[apt.status]}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">
                  {getPetAvatar(apt.petId) || <PawPrint size={18} className="text-[#E8A87C]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-[#3D2B1F]">{getPetName(apt.petId)}</span>
                    <div className={`w-2 h-2 rounded-full ${STATUS_DOT[apt.status]}`} />
                    <span className="text-xs text-[#8B7E74]">{STATUS_LABELS[apt.status]}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#8B7E74] mt-1">
                    <span className="flex items-center gap-1"><Clock size={10} />{formatDateTime(apt.datetime)}</span>
                    {apt.shopName && <span className="flex items-center gap-1"><MapPin size={10} />{apt.shopName}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {apt.services.map((svc) => (
                      <span key={svc} className="text-[10px] bg-white/70 text-[#3D2B1F] px-1.5 py-0.5 rounded-md">
                        {SERVICE_LABELS[svc]}
                      </span>
                    ))}
                  </div>
                  {record && (
                    <div className="text-xs text-[#8B7E74] mt-1">
                      实际 ¥{record.actualCost} · 满意度 {record.satisfactionScore}/5
                      {record.hadStress && ' · ⚠ 应激'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
