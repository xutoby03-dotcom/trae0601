import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToolStore } from '@/store/toolStore'
import type { ToolCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { ArrowLeft, Camera, Check, MapPin, Clock, Shield, FileText, Tag } from 'lucide-react'

const toolPhotoPresets: Record<string, string> = {
  electric: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=generic power tool on clean workbench, product photography, warm lighting&image_size=square',
  hand: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hand tool hardware on wooden surface, product shot, studio lighting&image_size=square',
  measuring: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=precision measuring instrument, product photography, clean background&image_size=square',
  garden: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=garden tool with green handles on grass, product shot, natural lighting&image_size=square',
  other: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=household tool equipment, product photography, neutral background&image_size=square',
}

export default function Register() {
  const navigate = useNavigate()
  const addTool = useToolStore(s => s.addTool)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category: 'hand' as ToolCategory,
    photo: '',
    deposit: 50,
    maxBorrowHours: 24,
    pickupLocation: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const photo = form.photo || toolPhotoPresets[form.category]
    addTool({ ...form, photo })
    setSubmitted(true)
    setTimeout(() => navigate('/'), 1500)
  }

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-grass-100 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-grass-600" />
          </div>
          <h2 className="font-serif-sc text-xl font-semibold text-wood-800 mb-2">登记成功！</h2>
          <p className="text-wood-500 text-sm">工具已添加到工具柜，信用分 +3</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="bg-gradient-to-br from-wood-800 to-wood-700 px-4 py-6">
        <div className="container mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-wood-200 hover:text-wood-50 text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            返回
          </button>
          <h1 className="font-serif-sc text-2xl font-bold text-wood-50">登记新工具</h1>
          <p className="text-wood-200 text-sm mt-1">分享你的闲置工具，方便邻里借用</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-wood-md border border-wood-100 p-6 space-y-6">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-wood-700 mb-2">
              <Tag size={14} />
              工具名称
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="例如：博世电钻、铝合金梯子"
              className="w-full px-4 py-2.5 rounded-xl border border-wood-200 text-sm focus:ring-2 focus:ring-grass-400 focus:border-grass-400 outline-none bg-wood-50/50"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-wood-700 mb-2">
              <Tag size={14} />
              工具分类
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(Object.entries(CATEGORY_LABELS) as [ToolCategory, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateField('category', key)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.category === key
                      ? 'bg-grass-600 text-white border-grass-600'
                      : 'bg-wood-50 text-wood-600 border-wood-200 hover:border-grass-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-wood-700 mb-2">
              <Camera size={14} />
              工具照片
            </label>
            <div className="relative">
              {form.photo ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-wood-200">
                  <img src={form.photo} alt="预览" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => updateField('photo', '')}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-full h-32 rounded-xl border-2 border-dashed border-wood-200 flex flex-col items-center justify-center bg-wood-50/50 hover:border-grass-400 transition-colors cursor-pointer"
                  onClick={() => updateField('photo', toolPhotoPresets[form.category])}
                >
                  <Camera size={24} className="text-wood-300 mb-2" />
                  <span className="text-xs text-wood-400">点击生成工具照片</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-wood-700 mb-2">
                <Shield size={14} />
                押金金额（元）
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.deposit}
                onChange={e => updateField('deposit', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-wood-200 text-sm focus:ring-2 focus:ring-grass-400 focus:border-grass-400 outline-none bg-wood-50/50"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-wood-700 mb-2">
                <Clock size={14} />
                可借时长（小时）
              </label>
              <input
                type="number"
                min={1}
                required
                value={form.maxBorrowHours}
                onChange={e => updateField('maxBorrowHours', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-wood-200 text-sm focus:ring-2 focus:ring-grass-400 focus:border-grass-400 outline-none bg-wood-50/50"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-wood-700 mb-2">
              <MapPin size={14} />
              取还地点
            </label>
            <input
              type="text"
              required
              value={form.pickupLocation}
              onChange={e => updateField('pickupLocation', e.target.value)}
              placeholder="例如：3号楼1单元大厅工具柜"
              className="w-full px-4 py-2.5 rounded-xl border border-wood-200 text-sm focus:ring-2 focus:ring-grass-400 focus:border-grass-400 outline-none bg-wood-50/50"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-wood-700 mb-2">
              <FileText size={14} />
              使用注意事项
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => updateField('notes', e.target.value)}
              placeholder="请填写使用时需要注意的事项..."
              className="w-full px-4 py-2.5 rounded-xl border border-wood-200 text-sm focus:ring-2 focus:ring-grass-400 focus:border-grass-400 outline-none bg-wood-50/50 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-grass-600 hover:bg-grass-700 text-white font-medium text-sm transition-colors shadow-wood"
          >
            确认登记
          </button>
        </form>
      </div>
    </div>
  )
}
