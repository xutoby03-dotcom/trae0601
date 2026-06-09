import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGroomingStore } from '@/store/useGroomingStore'
import { SERVICE_LABELS, PICKUP_METHOD_LABELS, STATUS_LABELS } from '@/types'
import type { AppointmentStatus, GroomingRecord, Reminder } from '@/types'
import { formatDateTime } from '@/utils/helpers'
import { addDays } from 'date-fns'
import { ArrowLeft, Clock, MapPin, Truck, DollarSign, MessageSquare, CheckCircle, Star, Camera, AlertCircle, PawPrint, X, ImagePlus } from 'lucide-react'

const STATUS_FLOW: AppointmentStatus[] = ['pending', 'today', 'pickup', 'completed']

export default function AppointmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const appointments = useGroomingStore((s) => s.appointments)
  const pets = useGroomingStore((s) => s.pets)
  const groomingRecords = useGroomingStore((s) => s.groomingRecords)
  const updateAppointment = useGroomingStore((s) => s.updateAppointment)
  const addGroomingRecord = useGroomingStore((s) => s.addGroomingRecord)
  const addReminder = useGroomingStore((s) => s.addReminder)

  const appointment = appointments.find((a) => a.id === id)
  const record = groomingRecords.find((r) => r.appointmentId === id)
  const pet = appointment ? pets.find((p) => p.id === appointment.petId) : null

  const [showRecordForm, setShowRecordForm] = useState(false)
  const [actualCost, setActualCost] = useState(record?.actualCost ?? 0)
  const [satisfactionScore, setSatisfactionScore] = useState(record?.satisfactionScore ?? 4)
  const [hadStress, setHadStress] = useState(record?.hadStress ?? false)
  const [stressNote, setStressNote] = useState(record?.stressNote ?? '')
  const [photos, setPhotos] = useState<string[]>(record?.photos ?? [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!appointment) {
    return (
      <div className="text-center py-16">
        <p className="text-[#8B7E74]">预约不存在</p>
        <button onClick={() => navigate('/')} className="text-[#E8A87C] mt-2 underline">返回首页</button>
      </div>
    )
  }

  const currentStatusIdx = STATUS_FLOW.indexOf(appointment.status)
  const nextStatus = currentStatusIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentStatusIdx + 1] : null

  const handleAdvanceStatus = () => {
    if (!nextStatus) return
    updateAppointment(appointment.id, { status: nextStatus })
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        if (dataUrl) {
          setPhotos((prev) => [...prev, dataUrl])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCompleteWithRecord = () => {
    const groomRecord: GroomingRecord = {
      id: crypto.randomUUID(),
      appointmentId: appointment.id,
      actualCost,
      photos,
      satisfactionScore,
      hadStress,
      stressNote,
      completedAt: new Date().toISOString(),
    }
    addGroomingRecord(groomRecord)
    updateAppointment(appointment.id, { status: 'completed' })

    const bathReminder: Reminder = {
      id: crypto.randomUUID(),
      petId: appointment.petId,
      type: 'bath',
      dueDate: addDays(new Date(), 30).toISOString(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    }
    addReminder(bathReminder)

    const hasFleaTreatment = appointment.services.includes('flea_treatment')
    if (hasFleaTreatment) {
      const dewormReminder: Reminder = {
        id: crypto.randomUUID(),
        petId: appointment.petId,
        type: 'deworming',
        dueDate: addDays(new Date(), 90).toISOString(),
        isCompleted: false,
        createdAt: new Date().toISOString(),
      }
      addReminder(dewormReminder)
    }

    setShowRecordForm(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#8B7E74] hover:text-[#3D2B1F] transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h2 className="font-display text-2xl text-[#3D2B1F]">预约详情</h2>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8A87C]/20 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#E8A87C]/20 to-[#A8D5BA]/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-2xl shadow-md">
              {pet?.avatar || '🐾'}
            </div>
            <div>
              <h3 className="font-display text-xl text-[#3D2B1F]">{pet?.name ?? '未知'}</h3>
              {pet?.breed && <p className="text-xs text-[#8B7E74]">{pet.breed}</p>}
            </div>
            <div className="ml-auto">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                appointment.status === 'today' ? 'bg-emerald-100 text-emerald-700' :
                appointment.status === 'pickup' ? 'bg-sky-100 text-sky-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {STATUS_LABELS[appointment.status]}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Clock size={16} className="text-[#E8A87C]" />
            <span className="text-[#3D2B1F]">{formatDateTime(appointment.datetime)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {appointment.services.map((svc) => (
              <span key={svc} className="bg-[#FFF8F0] text-[#3D2B1F] px-3 py-1 rounded-full text-xs font-medium border border-[#E8A87C]/20">
                {SERVICE_LABELS[svc]}
              </span>
            ))}
          </div>

          {appointment.shopName && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={16} className="text-[#E8A87C]" />
              <span>{appointment.shopName}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <Truck size={16} className="text-[#E8A87C]" />
            <span>{PICKUP_METHOD_LABELS[appointment.pickupMethod]}</span>
          </div>

          {appointment.budget > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <DollarSign size={16} className="text-[#E8A87C]" />
              <span>预算 ¥{appointment.budget}</span>
            </div>
          )}

          {appointment.specialRequests && (
            <div className="bg-[#FFF3E0] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1 text-sm font-medium text-[#3D2B1F]">
                <MessageSquare size={14} className="text-[#E8A87C]" />
                特别要求
              </div>
              <p className="text-sm text-[#8B7E74]">{appointment.specialRequests}</p>
            </div>
          )}

          {pet?.allergies && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1 text-sm font-medium text-red-700">
                <AlertCircle size={14} />
                过敏注意
              </div>
              <p className="text-sm text-red-600">{pet.allergies}</p>
            </div>
          )}
        </div>
      </div>

      {appointment.status !== 'completed' && (
        <div className="space-y-3">
          {nextStatus && nextStatus !== 'completed' && (
            <button
              onClick={handleAdvanceStatus}
              className="w-full flex items-center justify-center gap-2 bg-[#A8D5BA] text-[#3D2B1F] py-3 rounded-xl font-medium hover:bg-[#96c9a8] transition-colors shadow-md"
            >
              <CheckCircle size={18} />
              标记为{STATUS_LABELS[nextStatus]}
            </button>
          )}

          {appointment.status === 'pickup' && (
            <button
              onClick={() => setShowRecordForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#E8A87C] text-white py-3 rounded-xl font-medium hover:bg-[#d4956a] transition-colors shadow-md"
            >
              <PawPrint size={18} />
              美容完成，记录结果
            </button>
          )}
        </div>
      )}

      {record && (
        <div className="bg-white rounded-2xl border border-[#A8D5BA]/30 shadow-sm p-5 space-y-3">
          <h3 className="font-display text-lg text-[#3D2B1F]">美容记录</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FFF8F0] rounded-xl p-3">
              <div className="text-xs text-[#8B7E74]">实际花费</div>
              <div className="text-lg font-bold text-[#3D2B1F]">¥{record.actualCost}</div>
            </div>
            <div className="bg-[#FFF8F0] rounded-xl p-3">
              <div className="text-xs text-[#8B7E74]">满意度</div>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={16} className={n <= record.satisfactionScore ? 'text-[#E8A87C] fill-[#E8A87C]' : 'text-gray-300'} />
                ))}
              </div>
            </div>
          </div>
          {record.hadStress && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
              ⚠ 有应激反应 {record.stressNote && `：${record.stressNote}`}
            </div>
          )}
          {record.photos.length > 0 && (
            <div>
              <div className="text-xs text-[#8B7E74] mb-2">美容照片</div>
              <div className="flex flex-wrap gap-2">
                {record.photos.map((src, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-[#E8A87C]/20 shadow-sm">
                    <img src={src} alt={`照片${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showRecordForm && (
        <div className="bg-white rounded-2xl border border-[#E8A87C]/30 shadow-sm p-5 space-y-4">
          <h3 className="font-display text-lg text-[#3D2B1F]">记录美容结果</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3D2B1F]">实际花费 (元)</label>
            <input
              type="number"
              value={actualCost || ''}
              onChange={(e) => setActualCost(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8A87C]/30 bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20 outline-none transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3D2B1F]">造型满意度</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setSatisfactionScore(n)}>
                  <Star size={28} className={n <= satisfactionScore ? 'text-[#E8A87C] fill-[#E8A87C]' : 'text-gray-300 hover:text-[#E8A87C]'} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3D2B1F]">是否有应激反应</label>
            <div className="flex gap-2">
              <button
                onClick={() => setHadStress(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                  hadStress ? 'bg-red-100 text-red-700 border-2 border-red-300' : 'bg-[#FFF8F0] text-[#8B7E74] border border-[#E8A87C]/30'
                }`}
              >
                有应激
              </button>
              <button
                onClick={() => setHadStress(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                  !hadStress ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' : 'bg-[#FFF8F0] text-[#8B7E74] border border-[#E8A87C]/30'
                }`}
              >
                无应激
              </button>
            </div>
          </div>

          {hadStress && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#3D2B1F]">应激情况说明</label>
              <textarea
                value={stressNote}
                onChange={(e) => setStressNote(e.target.value)}
                placeholder="如：洗澡时发抖、吹风机害怕..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8A87C]/30 bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20 outline-none transition-all text-sm resize-none"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3D2B1F]">美容照片</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2">
              {photos.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#E8A87C]/20 shadow-sm group">
                  <img src={src} alt={`预览${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-[#E8A87C]/40 flex flex-col items-center justify-center gap-1 text-[#8B7E74] hover:border-[#E8A87C] hover:text-[#E8A87C] transition-colors"
              >
                <ImagePlus size={20} />
                <span className="text-[10px]">添加</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleCompleteWithRecord}
            className="w-full flex items-center justify-center gap-2 bg-[#E8A87C] text-white py-3 rounded-xl font-medium hover:bg-[#d4956a] transition-colors shadow-md"
          >
            <CheckCircle size={18} />
            完成并保存记录
          </button>
        </div>
      )}
    </div>
  )
}
