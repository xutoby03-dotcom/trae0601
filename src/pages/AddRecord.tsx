import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Syringe,
  Bug,
  Stethoscope,
  AlertTriangle,
  Scissors,
  Camera,
  Calendar,
  Hospital,
  User,
  DollarSign,
  FileText,
} from 'lucide-react'
import { usePetStore } from '@/store'
import { RECORD_TYPE_CONFIG } from '@/types'
import type { HealthRecordType } from '@/types'

import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  syringe: Syringe,
  bug: Bug,
  stethoscope: Stethoscope,
  'alert-triangle': AlertTriangle,
  scissors: Scissors,
}

export default function AddRecord() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const addRecord = usePetStore((s) => s.addRecord)

  const urlType = searchParams.get('type') as HealthRecordType | null
  const [type, setType] = useState<HealthRecordType>(
    urlType && RECORD_TYPE_CONFIG[urlType] ? urlType : 'vaccine'
  )
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [nextDate, setNextDate] = useState('')
  const [hospital, setHospital] = useState('')
  const [doctor, setDoctor] = useState('')
  const [cost, setCost] = useState('')
  const [certificatePhoto, setCertificatePhoto] = useState('')
  const [notes, setNotes] = useState('')

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCertificatePhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date || !id) return
    addRecord({
      petId: id,
      type,
      title: title.trim(),
      date,
      nextDate,
      hospital: hospital.trim(),
      doctor: doctor.trim(),
      cost: parseFloat(cost) || 0,
      certificatePhoto,
      notes: notes.trim(),
    })
    navigate(`/pet/${id}`)
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-24 animate-fade-in">
      <header className="sticky top-0 z-10 bg-warm-50/80 backdrop-blur-md border-b border-warm-100">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(`/pet/${id}`)}
            className="p-2 rounded-xl hover:bg-warm-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-warm-700" />
          </button>
          <h1 className="font-serif text-lg font-semibold text-warm-800">添加健康记录</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        <div>
          <label className="label-field">记录类型</label>
          <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible scrollbar-hide">
            {(Object.entries(RECORD_TYPE_CONFIG) as [HealthRecordType, (typeof RECORD_TYPE_CONFIG)[HealthRecordType]][]).map(
              ([key, config]) => {
                const Icon = ICON_MAP[config.icon]
                const selected = type === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all duration-200 min-w-[80px]"
                    style={{
                      borderColor: selected ? config.color : '#E8D5C0',
                      backgroundColor: selected ? config.bgColor : '#fff',
                      boxShadow: selected ? `0 2px 8px ${config.color}25` : 'none',
                    }}
                  >
                    {Icon && <Icon size={22} style={{ color: config.color }} />}
                    <span
                      className="text-xs font-medium whitespace-nowrap"
                      style={{ color: selected ? config.color : '#8C5E38' }}
                    >
                      {config.label}
                    </span>
                  </button>
                )
              }
            )}
          </div>
        </div>

        <div>
          <label className="label-field">
            名称 <span className="text-pet-red">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：狂犬疫苗、年度体检"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="label-field">
            日期 <span className="text-pet-red">*</span>
          </label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-300" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field pl-9"
              required
            />
          </div>
        </div>

        <div>
          <label className="label-field">下次时间</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-300" />
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>

        <div>
          <label className="label-field">医院</label>
          <div className="relative">
            <Hospital size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-300" />
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="医院名称"
              className="input-field pl-9"
            />
          </div>
        </div>

        <div>
          <label className="label-field">医生</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-300" />
            <input
              type="text"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              placeholder="医生姓名"
              className="input-field pl-9"
            />
          </div>
        </div>

        <div>
          <label className="label-field">费用/元</label>
          <div className="relative">
            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-300" />
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="input-field pl-9"
            />
          </div>
        </div>

        <div>
          <label className="label-field">凭证照片</label>
          <div className="card p-4">
            {certificatePhoto ? (
              <div className="relative">
                <img
                  src={certificatePhoto}
                  alt="凭证"
                  className="w-full max-h-48 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setCertificatePhoto('')}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/70 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 py-4 cursor-pointer text-warm-400 hover:text-warm-500 transition-colors">
                <Camera size={28} />
                <span className="text-sm">点击上传照片</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="label-field">备注</label>
          <div className="relative">
            <FileText size={16} className="absolute left-3 top-3 text-warm-300" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="其他备注信息..."
              rows={3}
              className="input-field pl-9 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Save size={18} />
          保存记录
        </button>
      </form>
    </div>
  )
}
