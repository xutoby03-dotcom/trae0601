import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { SIZES, SEASONS, GENDERS, SIZE_LABELS } from '@/types'

export default function PublishRequest() {
  const navigate = useNavigate()
  const { addPurchaseRequest, currentUser } = useStore()

  const [size, setSize] = useState<string>(SIZES[0])
  const [season, setSeason] = useState<string>(SEASONS[0])
  const [gender, setGender] = useState<string>(GENDERS[0])
  const [description, setDescription] = useState('')
  const [urgent, setUrgent] = useState(false)

  const handleSubmit = () => {
    if (!description.trim()) return
    addPurchaseRequest({
      id: Date.now().toString(),
      userId: currentUser.id,
      size,
      season,
      gender,
      description: description.trim(),
      urgent,
      status: 'open',
      createdAt: new Date().toISOString(),
    })
    navigate('/requests')
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-white">发布求购</h1>
      </div>

      <div className="px-4 py-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">尺码</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="select-field"
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {SIZE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">季节</label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="select-field"
          >
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">男女款</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="select-field"
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="想找130码冬季外套"
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="urgent"
            checked={urgent}
            onChange={(e) => setUrgent(e.target.checked)}
            className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
          />
          <label htmlFor="urgent" className="text-sm text-gray-700">
            是否紧急
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!description.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          提交求购
        </button>
      </div>
    </div>
  )
}
