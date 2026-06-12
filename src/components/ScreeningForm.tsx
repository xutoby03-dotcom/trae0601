import { useState } from 'react'
import { X, Film, Calendar, MapPin, Users, Shield, Image, CloudRain } from 'lucide-react'
import { useCinemaStore } from '@/store'
import type { ScreeningFormData } from '@/types'

interface ScreeningFormProps {
  onClose: () => void
}

const emptyForm: ScreeningFormData = {
  movieName: '',
  date: '',
  location: '社区中央广场',
  seatLimit: 80,
  ageRating: '全年龄',
  posterUrl: '',
  weatherPlan: '如遇雨天，改至社区活动中心二楼大厅',
}

export default function ScreeningForm({ onClose }: ScreeningFormProps) {
  const [form, setForm] = useState<ScreeningFormData>(emptyForm)
  const addScreening = useCinemaStore((s) => s.addScreening)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addScreening(form)
    onClose()
  }

  const update = (field: keyof ScreeningFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
         style={{ backgroundColor: 'rgba(27, 40, 56, 0.6)', backdropFilter: 'blur(4px)' }}
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-night-lighter/10">
          <h2 className="text-lg font-bold text-night flex items-center gap-2">
            <Film className="w-5 h-5 text-orange" />
            发布放映场次
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cream transition-colors">
            <X className="w-5 h-5 text-night-lighter" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label-field">
              <Film className="w-3.5 h-3.5 inline mr-1" />电影名称 *
            </label>
            <input
              type="text"
              required
              value={form.movieName}
              onChange={(e) => update('movieName', e.target.value)}
              className="input-field"
              placeholder="请输入电影名称"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />放映日期 *
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">
                <Users className="w-3.5 h-3.5 inline mr-1" />座位上限 *
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.seatLimit}
                onChange={(e) => update('seatLimit', parseInt(e.target.value) || 0)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label-field">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />放映地点
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">
              <Shield className="w-3.5 h-3.5 inline mr-1" />适合年龄
            </label>
            <select
              value={form.ageRating}
              onChange={(e) => update('ageRating', e.target.value)}
              className="input-field"
            >
              <option value="全年龄">全年龄</option>
              <option value="6岁以上">6岁以上</option>
              <option value="12岁以上">12岁以上</option>
              <option value="18岁以上">18岁以上</option>
            </select>
          </div>

          <div>
            <label className="label-field">
              <Image className="w-3.5 h-3.5 inline mr-1" />海报图片链接
            </label>
            <input
              type="url"
              value={form.posterUrl}
              onChange={(e) => update('posterUrl', e.target.value)}
              className="input-field"
              placeholder="输入海报图片URL"
            />
          </div>

          <div>
            <label className="label-field">
              <CloudRain className="w-3.5 h-3.5 inline mr-1" />天气预案
            </label>
            <textarea
              value={form.weatherPlan}
              onChange={(e) => update('weatherPlan', e.target.value)}
              className="input-field min-h-[72px] resize-y"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              发布场次
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
