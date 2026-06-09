import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlantStore } from '@/store/plantStore'
import { CURRENT_USER } from '@/data/mockData'
import { LIGHT_LABELS } from '@/types'
import type { LightNeed } from '@/types'
import { Leaf, MapPin, Sun, Droplets, CalendarDays, ImagePlus, Send } from 'lucide-react'

const AREAS = ['A区', 'B区', 'C区'] as const

export default function RegisterPlant() {
  const navigate = useNavigate()
  const addPlant = usePlantStore((s) => s.addPlant)

  const [name, setName] = useState('')
  const [desk, setDesk] = useState('')
  const [area, setArea] = useState<string>('A区')
  const [lightNeed, setLightNeed] = useState<LightNeed>('medium')
  const [wateringFrequencyDays, setWateringFrequencyDays] = useState(7)
  const [lastSoilChange, setLastSoilChange] = useState('')
  const [photo, setPhoto] = useState('')
  const [errors, setErrors] = useState<{ name?: string; desk?: string }>({})

  const validate = () => {
    const next: typeof errors = {}
    if (!name.trim()) next.name = '请输入植物名称'
    if (!desk.trim()) next.desk = '请输入所在工位'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    addPlant({
      name: name.trim(),
      desk: desk.trim(),
      area,
      lightNeed,
      wateringFrequencyDays,
      lastSoilChange: lastSoilChange || new Date().toISOString().slice(0, 10),
      photo,
    })

    const plants = usePlantStore.getState().plants
    const newPlant = plants[plants.length - 1]
    navigate(`/plant/${newPlant.id}`)
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-3">
            <Leaf className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800">登记新植物</h1>
          <p className="text-stone-500 mt-1">填写以下信息，为办公空间增添一抹绿意</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
              <Leaf className="w-4 h-4 text-emerald-500" />
              植物名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
              placeholder="例如：绿萝、发财树"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-400 ring-1 ring-red-200' : 'border-stone-200'} bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              所在工位 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={desk}
              onChange={(e) => { setDesk(e.target.value); setErrors((p) => ({ ...p, desk: undefined })) }}
              placeholder="例如：A3-12"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.desk ? 'border-red-400 ring-1 ring-red-200' : 'border-stone-200'} bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition`}
            />
            {errors.desk && <p className="text-red-500 text-xs mt-1">{errors.desk}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              所属区域
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition appearance-none"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
              <Sun className="w-4 h-4 text-emerald-500" />
              光照需求
            </label>
            <select
              value={lightNeed}
              onChange={(e) => setLightNeed(e.target.value as LightNeed)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition appearance-none"
            >
              {(Object.keys(LIGHT_LABELS) as LightNeed[]).map((key) => (
                <option key={key} value={key}>{LIGHT_LABELS[key]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
              <Droplets className="w-4 h-4 text-emerald-500" />
              浇水频率（天）
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={wateringFrequencyDays}
              onChange={(e) => setWateringFrequencyDays(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
              <CalendarDays className="w-4 h-4 text-emerald-500" />
              最近换土时间
            </label>
            <input
              type="date"
              value={lastSoilChange}
              onChange={(e) => setLastSoilChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
              <ImagePlus className="w-4 h-4 text-emerald-500" />
              植物照片 URL
            </label>
            <input
              type="text"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="输入图片链接地址"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
            />
            {photo && (
              <div className="mt-3 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                <img
                  src={photo}
                  alt="植物照片预览"
                  className="w-full h-48 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium py-3 rounded-xl transition shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              提交登记
            </button>
          </div>
        </form>

        <p className="text-center text-stone-400 text-xs mt-6">
          登记人：{CURRENT_USER.name} · {CURRENT_USER.department}
        </p>
      </div>
    </div>
  )
}
