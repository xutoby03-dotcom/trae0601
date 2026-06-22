import { useState } from 'react'
import { X, Save, Check } from 'lucide-react'
import type { Observation, VisitorType, WeatherType } from '../types'
import {
  VISITOR_NAMES,
  VISITOR_EMOJIS,
  WEATHER_NAMES,
  WEATHER_EMOJIS,
} from '../types'
import { getToday } from '../utils/dateUtils'

interface ObservationFormProps {
  cellId: string
  cellNumber: string
  onSubmit: (data: Omit<Observation, 'id'>) => void
  onCancel: () => void
}

export function ObservationForm({ cellId, cellNumber, onSubmit, onCancel }: ObservationFormProps) {
  const [formData, setFormData] = useState({
    observationDate: getToday(),
    hasSeal: false,
    hasBiteMarks: false,
    hasEmergenceHole: false,
    visitorTypes: [] as VisitorType[],
    weather: 'sunny' as WeatherType,
    notes: '',
    recorder: '',
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const handleVisitorToggle = (visitor: VisitorType) => {
    setFormData((prev) => ({
      ...prev,
      visitorTypes: prev.visitorTypes.includes(visitor)
        ? prev.visitorTypes.filter((v) => v !== visitor)
        : [...prev.visitorTypes, visitor],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      cellId,
    })
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      onCancel()
    }, 1500)
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-700 mb-2">记录成功！</h3>
          <p className="text-stone-500">感谢你的观察记录 🌿</p>
        </div>
      </div>
    )
  }

  const signOptions = [
    { key: 'hasSeal', label: '封口', emoji: '🔒', desc: '格口被封住' },
    { key: 'hasBiteMarks', label: '啃痕', emoji: '🦷', desc: '有啃咬痕迹' },
    { key: 'hasEmergenceHole', label: '羽化孔', emoji: '🕳️', desc: '昆虫已羽化飞出' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 p-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-stone-800">
              📝 记录观察 - {cellNumber}
            </h3>
            <p className="text-sm text-stone-500 mt-1">
              日期：{new Date(formData.observationDate).toLocaleDateString('zh-CN')}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              入住迹象
            </label>
            <div className="grid grid-cols-3 gap-3">
              {signOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      [option.key]: !(prev[option.key as keyof typeof prev] as boolean),
                    }))
                  }
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData[option.key as keyof typeof formData] as boolean
                      ? 'border-green-500 bg-green-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className="font-medium text-stone-800 text-sm">{option.label}</div>
                  <div className="text-xs text-stone-500">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              访客种类（可多选）
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(VISITOR_NAMES) as VisitorType[]).map((visitor) => (
                <button
                  key={visitor}
                  type="button"
                  onClick={() => handleVisitorToggle(visitor)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.visitorTypes.includes(visitor)
                      ? 'border-green-500 bg-green-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{VISITOR_EMOJIS[visitor]}</div>
                  <div className="text-xs text-stone-700">{VISITOR_NAMES[visitor]}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              今日天气
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(WEATHER_NAMES) as WeatherType[]).map((weather) => (
                <button
                  key={weather}
                  type="button"
                  onClick={() => setFormData({ ...formData, weather })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.weather === weather
                      ? 'border-green-500 bg-green-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{WEATHER_EMOJIS[weather]}</div>
                  <div className="text-xs text-stone-700">{WEATHER_NAMES[weather]}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              记录人
            </label>
            <input
              type="text"
              value={formData.recorder}
              onChange={(e) => setFormData({ ...formData, recorder: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-green-500 focus:ring-0 outline-none transition-colors"
              placeholder="请输入你的名字"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              备注（可选）
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-green-500 focus:ring-0 outline-none transition-colors resize-none"
              rows={3}
              placeholder="记录其他观察到的有趣现象..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              保存记录
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
