import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, X, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import type { DailyCheckin } from '@/types'
import { generateId, formatDate, getDaysBetween, appetiteLabels, stoolLabels, moodLabels } from '@/utils/helpers'

type Appetite = DailyCheckin['appetite']
type Stool = DailyCheckin['stool']
type Mood = DailyCheckin['mood']

export default function Checkin() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fosters, checkins, pets, addCheckin, updateCheckin } = useStore()

  const foster = fosters.find((f) => f.id === id)
  const pet = foster ? pets.find((p) => p.id === foster.petId) : undefined
  const fosterCheckins = checkins.filter((c) => c.fosterId === id)

  const days = foster ? getDaysBetween(foster.startDate, foster.endDate) : []
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const timelineRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [appetite, setAppetite] = useState<Appetite>('normal')
  const [stool, setStool] = useState<Stool>('normal')
  const [mood, setMood] = useState<Mood>('calm')
  const [abnormalNote, setAbnormalNote] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [pawAnimate, setPawAnimate] = useState(false)
  const [prevDate, setPrevDate] = useState(today)

  if (selectedDate !== prevDate) {
    setPrevDate(selectedDate)
    const c = fosterCheckins.find((ck) => ck.date === selectedDate)
    if (c) {
      setAppetite(c.appetite)
      setStool(c.stool)
      setMood(c.mood)
      setAbnormalNote(c.abnormalNote)
      setPhotos(c.photos)
    } else {
      setAppetite('normal')
      setStool('normal')
      setMood('calm')
      setAbnormalNote('')
      setPhotos([])
    }
  }

  useEffect(() => {
    if (timelineRef.current) {
      const todayEl = timelineRef.current.querySelector('[data-today="true"]')
      if (todayEl) todayEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [])

  if (!foster || !pet) return null

  const getDayStatus = (date: string) => {
    const c = fosterCheckins.find((ck) => ck.date === date)
    if (!c) return 'pending'
    if (c.abnormalNote || c.appetite === 'poor' || c.stool === 'abnormal' || c.mood === 'lethargic') return 'abnormal'
    return 'completed'
  }

  const handleAddPhoto = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      if (dataUrl) {
        setPhotos((prev) => [...prev, dataUrl])
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    const data: Partial<DailyCheckin> = {
      fosterId: id!,
      date: selectedDate,
      appetite,
      stool,
      mood,
      abnormalNote,
      photos,
      completed: true,
    }

    const existing = fosterCheckins.find((ck) => ck.date === selectedDate)
    if (existing) {
      updateCheckin(existing.id, data)
    } else {
      addCheckin({ id: generateId(), ...data } as DailyCheckin)
    }

    setPawAnimate(true)
    setTimeout(() => setPawAnimate(false), 600)
  }

  const appetiteOptions: { value: Appetite; color: string }[] = [
    { value: 'good', color: 'bg-leaf-300 text-white' },
    { value: 'normal', color: 'bg-warm-300 text-white' },
    { value: 'poor', color: 'bg-coral-300 text-white' },
  ]
  const stoolOptions: { value: Stool; color: string }[] = [
    { value: 'normal', color: 'bg-leaf-300 text-white' },
    { value: 'soft', color: 'bg-coral-300 text-white' },
    { value: 'abnormal', color: 'bg-red-500 text-white' },
  ]
  const moodOptions: { value: Mood; color: string }[] = [
    { value: 'energetic', color: 'bg-leaf-300 text-white' },
    { value: 'calm', color: 'bg-warm-300 text-white' },
    { value: 'lethargic', color: 'bg-coral-300 text-white' },
  ]

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-warm-500" />
        </button>
        <div>
          <h1 className="font-display text-xl text-warm-800">每日打卡</h1>
          <p className="text-sm text-warm-400">
            {pet.name} · {formatDate(foster.startDate)} - {formatDate(foster.endDate)}
          </p>
        </div>
      </div>

      <div ref={timelineRef} className="flex gap-1 overflow-x-auto pb-3 mb-6 px-1">
        {days.map((day) => {
          const status = getDayStatus(day)
          const isToday = day === today
          const isSelected = day === selectedDate
          return (
            <button
              key={day}
              data-today={isToday}
              onClick={() => setSelectedDate(day)}
              className={cn(
                'flex flex-col items-center gap-1 min-w-[48px] px-2 py-1.5 rounded-lg transition-all',
                isSelected && 'bg-warm-100'
              )}
            >
              <span className="text-xs text-warm-400">{new Date(day).getDate()}</span>
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                  isToday && 'ring-2 ring-warm-500 ring-offset-2',
                  status === 'completed' && 'bg-leaf-300 text-white',
                  status === 'abnormal' && 'bg-coral-300 text-white',
                  status === 'pending' && 'bg-warm-100 text-warm-300'
                )}
              >
                {status === 'completed' && <Check className="w-3.5 h-3.5" />}
                {status === 'abnormal' && <AlertCircle className="w-3.5 h-3.5" />}
                {status === 'pending' && '○'}
              </div>
            </button>
          )
        })}
      </div>

      <div className="section-card bg-white mb-4">
        <h2 className="font-display text-lg text-warm-700 mb-3">{formatDate(selectedDate)} 打卡</h2>

        <div className="mb-4">
          <p className="text-sm text-warm-500 mb-2">食欲</p>
          <div className="flex gap-2">
            {appetiteOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAppetite(opt.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  appetite === opt.value ? opt.color : 'bg-warm-50 text-warm-400'
                )}
              >
                {appetiteLabels[opt.value]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-warm-500 mb-2">便便</p>
          <div className="flex gap-2">
            {stoolOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStool(opt.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  stool === opt.value ? opt.color : 'bg-warm-50 text-warm-400'
                )}
              >
                {stoolLabels[opt.value]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-warm-500 mb-2">精神状态</p>
          <div className="flex gap-2">
            {moodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMood(opt.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  mood === opt.value ? opt.color : 'bg-warm-50 text-warm-400'
                )}
              >
                {moodLabels[opt.value]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-warm-500 mb-2">异常备注</p>
          <textarea
            className="input-field min-h-[80px] resize-none"
            value={abnormalNote}
            onChange={(e) => setAbnormalNote(e.target.value)}
            placeholder="记录任何异常情况..."
          />
        </div>

        <div className="mb-4">
          <p className="text-sm text-warm-500 mb-2">照片</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-wrap gap-2">
            {photos.map((photo, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-warm-200">
                <img src={photo} alt={`照片 ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemovePhoto(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-coral-300 text-white rounded-full flex items-center justify-center shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddPhoto}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-warm-200 flex items-center justify-center text-warm-300 hover:border-warm-400 hover:text-warm-400 transition-colors"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2 relative">
          完成打卡
          {pawAnimate && (
            <span className="animate-paw-print inline-block text-lg">🐾</span>
          )}
        </button>
      </div>
    </div>
  )
}
