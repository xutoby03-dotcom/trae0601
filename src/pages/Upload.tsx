import { useState, useRef } from 'react'
import { useTravelStore } from '@/store/useTravelStore'
import TagBadge from '@/components/TagBadge'
import { ALL_TAGS, ALL_WEATHERS, WEATHER_ICONS, TagName, Weather } from '@/types'
import { generateId } from '@/utils/helpers'
import { Link } from 'react-router-dom'
import { Upload as UploadIcon, ImagePlus, X, Check } from 'lucide-react'

interface PendingPhoto {
  id: string
  url: string
  location: string
  date: string
  companions: string
  cost: number
  weather: Weather
  story: string
  tags: TagName[]
  saved: boolean
}

export default function Upload() {
  const { currentTripId, days, addPhoto, addDay } = useTravelStore()
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newPhotos: PendingPhoto[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((_) => ({
        id: generateId(),
        url: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        companions: '',
        cost: 0,
        weather: '晴' as Weather,
        story: '',
        tags: [] as TagName[],
        saved: false,
      }))

    newPhotos.forEach((photo, i) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPendingPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, url: e.target?.result as string } : p))
        )
      }
      reader.readAsDataURL(files[i])
    })

    setPendingPhotos((prev) => [...prev, ...newPhotos])
  }

  const updatePending = (id: string, field: string, value: string | number | TagName[]) => {
    setPendingPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  const toggleTag = (id: string, tag: TagName) => {
    setPendingPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const tags = p.tags.includes(tag) ? p.tags.filter((t) => t !== tag) : [...p.tags, tag]
        return { ...p, tags }
      })
    )
  }

  const removePending = (id: string) => {
    setPendingPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  const handleSave = (photo: PendingPhoto) => {
    if (!currentTripId || !photo.url) return

    let dayId = days.find((d) => d.tripId === currentTripId && d.date === photo.date)?.id
    if (!dayId) {
      dayId = generateId()
      addDay({
        id: dayId,
        tripId: currentTripId,
        date: photo.date,
        location: photo.location,
        weather: photo.weather,
        totalCost: 0,
      })
    }

    addPhoto({
      id: generateId(),
      dayId,
      url: photo.url,
      location: photo.location,
      date: photo.date,
      companions: photo.companions,
      cost: photo.cost,
      weather: photo.weather,
      story: photo.story,
      tags: photo.tags,
    })

    setPendingPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, saved: true } : p))
    )
  }

  if (!currentTripId) {
    return (
      <div className="page-container flex flex-col items-center justify-center gap-4 pt-20">
        <ImagePlus className="w-16 h-16 text-warm-peach" />
        <p className="text-warm-brown/70 text-lg">请先选择一个旅行</p>
        <Link to="/" className="btn-primary">返回首页</Link>
      </div>
    )
  }

  return (
    <div className="page-container px-4 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-warm-brown/60 hover:text-warm-brown transition-colors">
          ← 返回
        </Link>
        <h1 className="section-title">上传照片</h1>
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-warm-peach rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-warm-orange hover:bg-warm-cream/30 transition-all mb-6"
      >
        <UploadIcon className="w-10 h-10 text-warm-orange" />
        <p className="text-warm-brown/70">拖拽或点击上传照片</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="space-y-6">
        {pendingPhotos.map((photo) => (
          <div
            key={photo.id}
            className={`card ${photo.saved ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start gap-4">
              <img
                src={photo.url}
                alt=""
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 space-y-3">
                {photo.saved && (
                  <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                    <Check className="w-4 h-4" /> 已保存
                  </div>
                )}

                <input
                  type="text"
                  placeholder="地点"
                  value={photo.location}
                  onChange={(e) => updatePending(photo.id, 'location', e.target.value)}
                  disabled={photo.saved}
                  className="w-full px-3 py-2 rounded-lg border border-warm-peach/50 bg-warm-cream/30 text-warm-brown placeholder:text-warm-brown/30 focus:outline-none focus:border-warm-orange"
                />

                <input
                  type="date"
                  value={photo.date}
                  onChange={(e) => updatePending(photo.id, 'date', e.target.value)}
                  disabled={photo.saved}
                  className="w-full px-3 py-2 rounded-lg border border-warm-peach/50 bg-warm-cream/30 text-warm-brown focus:outline-none focus:border-warm-orange"
                />

                <input
                  type="text"
                  placeholder="同行人"
                  value={photo.companions}
                  onChange={(e) => updatePending(photo.id, 'companions', e.target.value)}
                  disabled={photo.saved}
                  className="w-full px-3 py-2 rounded-lg border border-warm-peach/50 bg-warm-cream/30 text-warm-brown placeholder:text-warm-brown/30 focus:outline-none focus:border-warm-orange"
                />

                <input
                  type="number"
                  placeholder="花费（元）"
                  value={photo.cost || ''}
                  onChange={(e) => updatePending(photo.id, 'cost', Number(e.target.value))}
                  disabled={photo.saved}
                  className="w-full px-3 py-2 rounded-lg border border-warm-peach/50 bg-warm-cream/30 text-warm-brown placeholder:text-warm-brown/30 focus:outline-none focus:border-warm-orange"
                />

                <div className="flex gap-2 flex-wrap">
                  {ALL_WEATHERS.map((w) => (
                    <button
                      key={w}
                      onClick={() => !photo.saved && updatePending(photo.id, 'weather', w)}
                      className={`text-xl px-2 py-1 rounded-lg transition-all ${
                        photo.weather === w
                          ? 'bg-warm-orange/20 ring-2 ring-warm-orange'
                          : 'hover:bg-warm-cream'
                      }`}
                      disabled={photo.saved}
                    >
                      {WEATHER_ICONS[w]}
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="当时发生了什么..."
                  value={photo.story}
                  onChange={(e) => updatePending(photo.id, 'story', e.target.value)}
                  disabled={photo.saved}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-warm-peach/50 bg-warm-cream/30 text-warm-brown placeholder:text-warm-brown/30 focus:outline-none focus:border-warm-orange resize-none"
                />

                <div className="flex gap-2 flex-wrap">
                  {ALL_TAGS.map((tag) => (
                    <TagBadge
                      key={tag}
                      name={tag}
                      selected={photo.tags.includes(tag)}
                      onClick={() => !photo.saved && toggleTag(photo.id, tag)}
                    />
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => removePending(photo.id)}
                    className="p-2 rounded-full hover:bg-red-50 text-red-400 transition-colors"
                    disabled={photo.saved}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {!photo.saved && (
                    <button
                      onClick={() => handleSave(photo)}
                      className="btn-primary flex items-center gap-1 text-sm"
                    >
                      <Check className="w-4 h-4" /> 保存
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pendingPhotos.length > 0 && pendingPhotos.some((p) => !p.saved) && (
        <div className="fixed bottom-24 left-0 right-0 px-4">
          <button
            onClick={() => {
              pendingPhotos.filter((p) => !p.saved && p.url).forEach(handleSave)
            }}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            <Check className="w-5 h-5" /> 全部保存
          </button>
        </div>
      )}
    </div>
  )
}
