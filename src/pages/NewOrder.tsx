import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X, UserPlus, Calendar, Camera, ImagePlus, Trash2 } from 'lucide-react'
import { ROOMS, URGENCY_CONFIG, CONTACT_TYPE_CONFIG } from '@/types'
import type { Urgency, RoomId } from '@/types'
import { useRepairStore } from '@/store/repairStore'
import PageHeader from '@/components/PageHeader'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function NewOrder() {
  const navigate = useNavigate()
  const { contacts, addOrder } = useRepairStore()
  const beforeInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [roomId, setRoomId] = useState<RoomId>('kitchen')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState<Urgency>('medium')
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [contactId, setContactId] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [beforePhotos, setBeforePhotos] = useState<string[]>([])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const results = await Promise.all(Array.from(files).map(fileToBase64))
    setBeforePhotos((prev) => [...prev, ...results])
    if (e.target) e.target.value = ''
  }

  const removePhoto = (idx: number) => {
    setBeforePhotos((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    const newId = addOrder({
      title,
      roomId,
      description,
      urgency,
      status: 'pending',
      beforePhotos,
      afterPhotos: [],
      estimatedCost,
      contactId,
      appointmentTime,
    })
    navigate(`/order/${newId}`)
  }

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <PageHeader showBack title="新增工单" />

      <div className="flex-1 px-4 py-4 pb-24 space-y-4 overflow-y-auto scrollbar-thin">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-dark-700">工单标题</label>
          <input className="input-field" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：厨房水龙头漏水" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-dark-700">维修房间</label>
          <select className="select-field" value={roomId} onChange={(e) => setRoomId(e.target.value as RoomId)}>
            {ROOMS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-dark-700">问题描述</label>
          <textarea className="input-field min-h-[80px] resize-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="详细描述维修问题…" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-dark-700">紧急程度</label>
          <select className="select-field" value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency)}>
            {(Object.entries(URGENCY_CONFIG) as [Urgency, typeof URGENCY_CONFIG[Urgency]][]).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-dark-700 flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" />维修前照片</label>
          <input ref={beforeInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
          <div className="flex flex-wrap gap-2">
            {beforePhotos.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-surface-200 group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <button onClick={() => beforeInputRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed border-surface-300 flex flex-col items-center justify-center gap-1 text-dark-700/40 hover:border-brand-400 hover:text-brand-500 transition-colors">
              <ImagePlus className="w-5 h-5" />
              <span className="text-[10px]">上传</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-dark-700">预估费用</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-700/50 text-sm">¥</span>
            <input className="input-field pl-7" type="number" min={0} value={estimatedCost || ''} onChange={(e) => setEstimatedCost(Number(e.target.value))} placeholder="0" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-dark-700 flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5" />联系人</label>
          <select className="select-field" value={contactId} onChange={(e) => setContactId(e.target.value)}>
            <option value="">暂不指定</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}（{CONTACT_TYPE_CONFIG[c.type].label}）</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-dark-700 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />预约时间</label>
          <input className="input-field" type="datetime-local" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} />
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-surface-200 px-4 py-3 flex gap-3 z-20">
        <button className="btn-secondary flex-1 flex items-center justify-center gap-1.5" onClick={() => navigate(-1)}>
          <X className="w-4 h-4" />取消
        </button>
        <button className="btn-primary flex-1 flex items-center justify-center gap-1.5" onClick={handleSubmit} disabled={!title.trim()}>
          <Save className="w-4 h-4" />保存工单
        </button>
      </div>
    </div>
  )
}
