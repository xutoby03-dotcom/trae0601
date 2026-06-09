import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Uniform } from '@/types'
import { SIZES, SEASONS, GENDERS, CONDITIONS, GRADES } from '@/types'

export default function Publish() {
  const navigate = useNavigate()
  const { addUniform, currentUser } = useStore()

  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [size, setSize] = useState('')
  const [season, setSeason] = useState('')
  const [gender, setGender] = useState('')
  const [condition, setCondition] = useState('')
  const [hasStain, setHasStain] = useState(false)
  const [stainDesc, setStainDesc] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState(0)
  const [photos, setPhotos] = useState<string[]>([])

  const handlePhotoAdd = () => {
    setPhotos([...photos, `https://placeholder.com/photo-${photos.length + 1}`])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const uniform: Uniform = {
      id: Date.now().toString(),
      school,
      grade,
      size,
      season,
      gender,
      condition,
      hasStain,
      stainDesc: hasStain ? stainDesc : '',
      price: isFree ? 0 : price,
      isFree,
      photos,
      publisherId: currentUser.id,
      status: 'available',
      isUrgent: false,
      createdAt: new Date().toISOString(),
    }
    addUniform(uniform)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[var(--color-warm-50)]">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-orange-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-orange-500" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">发布校服</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5 pb-28">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">学校</label>
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="input-field"
            placeholder="请输入学校名称"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">年级</label>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="select-field" required>
            <option value="">请选择年级</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">尺码</label>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="select-field" required>
            <option value="">请选择尺码</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>{s}cm</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">季节</label>
          <select value={season} onChange={(e) => setSeason(e.target.value)} className="select-field" required>
            <option value="">请选择季节</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">男女款</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="select-field" required>
            <option value="">请选择款式</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">成色</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className="select-field" required>
            <option value="">请选择成色</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">是否有污渍</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHasStain(!hasStain)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${hasStain ? 'bg-orange-500' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${hasStain ? 'translate-x-5' : ''}`}
              />
            </button>
            <span className="text-sm text-gray-600">{hasStain ? '是' : '否'}</span>
          </div>
          {hasStain && (
            <textarea
              value={stainDesc}
              onChange={(e) => setStainDesc(e.target.value)}
              className="input-field mt-2 min-h-[80px] resize-none"
              placeholder="请描述污渍情况"
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">价格类型</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsFree(true)}
              className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isFree ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-orange-200'
              }`}
            >
              免费赠送
            </button>
            <button
              type="button"
              onClick={() => setIsFree(false)}
              className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                !isFree ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-orange-200'
              }`}
            >
              设定价格
            </button>
          </div>
          {!isFree && (
            <input
              type="number"
              value={price || ''}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="input-field mt-2"
              placeholder="请输入价格（元）"
              min={0}
              required
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">照片</label>
          <div className="flex flex-wrap gap-3">
            {photos.map((url, i) => (
              <div key={i} className="w-20 h-20 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                <span className="text-xs text-orange-400">照片{i + 1}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={handlePhotoAdd}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-orange-300 flex flex-col items-center justify-center gap-1 hover:bg-orange-50 transition-colors"
            >
              <Camera className="w-5 h-5 text-orange-400" />
              <span className="text-xs text-orange-400">添加</span>
            </button>
          </div>
        </div>

        <div className="pt-3">
          <button type="submit" className="btn-primary w-full text-base">
            发布
          </button>
        </div>
      </form>
    </div>
  )
}
