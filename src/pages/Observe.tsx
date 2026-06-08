import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGardenStore } from '@/store/useGardenStore'
import { OBSERVATION_TYPE_CONFIG, type ObservationType } from '@/types'
import PhotoUpload from '@/components/PhotoUpload'
import { ArrowLeft, Save } from 'lucide-react'

const OBSERVATION_TYPES = Object.entries(OBSERVATION_TYPE_CONFIG) as [ObservationType, typeof OBSERVATION_TYPE_CONFIG[ObservationType]][]

export default function Observe() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { plants, addObservation } = useGardenStore()

  const plant = plants.find((p) => p.id === id)

  const [type, setType] = useState<ObservationType>('growth')
  const [description, setDescription] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [pestDescription, setPestDescription] = useState('')
  const [fertilizerType, setFertilizerType] = useState('')
  const [fertilizerAmount, setFertilizerAmount] = useState('')
  const [newPotSize, setNewPotSize] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [observedAt, setObservedAt] = useState(new Date().toISOString().split('T')[0])

  if (!plant) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl">🥀</span>
        <p className="font-serif text-earth-500 mt-4">找不到这盆植物</p>
        <button onClick={() => navigate('/')} className="btn-secondary mt-4">返回菜园</button>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    addObservation({
      plantId: plant.id,
      type,
      description: description.trim(),
      heightCm: type === 'growth' && heightCm ? Number(heightCm) : null,
      pestDescription: type === 'pest' ? pestDescription.trim() || null : null,
      fertilizerType: type === 'fertilizing' ? fertilizerType.trim() || null : null,
      fertilizerAmount: type === 'fertilizing' ? fertilizerAmount.trim() || null : null,
      newPotSize: type === 'repotting' ? newPotSize.trim() || null : null,
      photos,
      observedAt: new Date(observedAt).toISOString(),
    })
    navigate(`/plant/${plant.id}`)
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost px-2">
          <ArrowLeft size={20} />
        </button>
        <h2 className="section-title flex items-center gap-2">
          📝 记录观察
        </h2>
      </div>

      <div className="card-paper p-3 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-earth-200 flex-shrink-0">
          {plant.photo ? (
            <img src={plant.photo} alt={plant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-leaf-50 text-sm">🌱</div>
          )}
        </div>
        <div>
          <p className="font-serif font-semibold text-earth-800">{plant.name}</p>
          <p className="text-xs font-serif text-earth-500">{plant.variety}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card-paper p-5">
          <div className="tape-decoration pt-2">
            <h3 className="font-handwriting text-lg text-earth-700 mb-4">🔍 观察类型</h3>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {OBSERVATION_TYPES.map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${
                  type === key
                    ? `border-${config.color}-400 bg-${config.color}-50 shadow-md`
                    : 'border-earth-200 hover:border-earth-300'
                }`}
              >
                <span className="text-xl">{config.emoji}</span>
                <span className="text-[10px] font-serif text-earth-600">{config.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card-paper p-5 space-y-4">
          <div>
            <label className="label-text">观察日期</label>
            <input
              type="date"
              value={observedAt}
              onChange={(e) => setObservedAt(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-text">描述 *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'growth' ? '今天长高了多少？有什么变化？' :
                type === 'flowering' ? '开花了！描述一下花的样子...' :
                type === 'fruiting' ? '结果啦！果实长什么样？' :
                type === 'yellowing' ? '哪些叶子发黄了？什么情况？' :
                type === 'pest' ? '发现了什么虫子？在哪些部位？' :
                type === 'fertilizing' ? '今天施了什么肥？' :
                type === 'repotting' ? '换盆的详情...' :
                '记录今天的观察...'
              }
              rows={3}
              className="input-field resize-none"
              required
            />
          </div>

          {type === 'growth' && (
            <div>
              <label className="label-text">📏 当前高度（厘米）</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="如：25.5"
                className="input-field"
              />
            </div>
          )}

          {type === 'pest' && (
            <div>
              <label className="label-text">🐛 虫害描述</label>
              <input
                type="text"
                value={pestDescription}
                onChange={(e) => setPestDescription(e.target.value)}
                placeholder="如：叶片背面发现蚜虫，约20只"
                className="input-field"
              />
            </div>
          )}

          {type === 'fertilizing' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">肥料种类</label>
                <input
                  type="text"
                  value={fertilizerType}
                  onChange={(e) => setFertilizerType(e.target.value)}
                  placeholder="如：复合肥、有机肥"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">用量</label>
                <input
                  type="text"
                  value={fertilizerAmount}
                  onChange={(e) => setFertilizerAmount(e.target.value)}
                  placeholder="如：5克"
                  className="input-field"
                />
              </div>
            </div>
          )}

          {type === 'repotting' && (
            <div>
              <label className="label-text">🪴 新盆大小</label>
              <input
                type="text"
                value={newPotSize}
                onChange={(e) => setNewPotSize(e.target.value)}
                placeholder="如：换到大号加仑盆"
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="label-text">📸 照片</label>
            <PhotoUpload photos={photos} onChange={setPhotos} max={3} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            取消
          </button>
          <button
            type="submit"
            disabled={!description.trim()}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            保存记录
          </button>
        </div>
      </form>
    </div>
  )
}
