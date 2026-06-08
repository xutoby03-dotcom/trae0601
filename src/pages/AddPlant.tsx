import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGardenStore } from '@/store/useGardenStore'
import {
  VARIETY_PRESETS,
  POT_SIZE_LABELS,
  LIGHT_POSITION_LABELS,
  type PotSize,
  type LightPosition,
} from '@/types'
import PhotoUpload from '@/components/PhotoUpload'
import { ArrowLeft, Sprout } from 'lucide-react'

export default function AddPlant() {
  const navigate = useNavigate()
  const addPlant = useGardenStore((s) => s.addPlant)
  const plants = useGardenStore((s) => s.plants)

  const [name, setName] = useState('')
  const [variety, setVariety] = useState('')
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0])
  const [potSize, setPotSize] = useState<PotSize>('medium')
  const [soilType, setSoilType] = useState('')
  const [lightPosition, setLightPosition] = useState<LightPosition>('full-sun')
  const [wateringFrequencyDays, setWateringFrequencyDays] = useState(2)
  const [fertilizeFrequencyDays, setFertilizeFrequencyDays] = useState(14)
  const [photo, setPhoto] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !variety.trim()) return

    const gridIndex = plants.length
    addPlant({
      name: name.trim(),
      variety: variety.trim(),
      sowingDate,
      potSize,
      soilType: soilType.trim() || '通用营养土',
      lightPosition,
      wateringFrequencyDays,
      lastWatered: new Date().toISOString(),
      lastFertilized: '',
      fertilizeFrequencyDays,
      gridRow: Math.floor(gridIndex / 4),
      gridCol: gridIndex % 4,
      photo: photo[0] || '',
    })
    navigate('/')
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost px-2">
          <ArrowLeft size={20} />
        </button>
        <h2 className="section-title flex items-center gap-2">
          <Sprout size={24} className="text-leaf-500" />
          添加新植物
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card-paper p-5 space-y-4">
          <div className="tape-decoration pt-2">
            <h3 className="font-handwriting text-lg text-earth-700 mb-3">🌱 基本信息</h3>
          </div>

          <div>
            <label className="label-text">给植物起个名字 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="比如：阳台番茄一号"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-text">品种 *</label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {VARIETY_PRESETS.map((v) => (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => setVariety(v.name)}
                  className={`flex flex-col items-center gap-0.5 p-2 rounded-xl border-2 transition-all duration-200 text-xs font-serif ${
                    variety === v.name
                      ? 'border-leaf-400 bg-leaf-50 text-leaf-700 shadow-md'
                      : 'border-earth-200 text-earth-500 hover:border-leaf-300'
                  }`}
                >
                  <span className="text-lg">{v.emoji}</span>
                  <span>{v.name}</span>
                </button>
              ))}
            </div>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              placeholder="或自定义品种名称"
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="label-text">播种日期</label>
            <input
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-text">盆大小</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(POT_SIZE_LABELS) as [PotSize, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPotSize(key)}
                  className={`px-3 py-2.5 rounded-xl border-2 text-sm font-serif transition-all duration-200 ${
                    potSize === key
                      ? 'border-leaf-400 bg-leaf-50 text-leaf-700 shadow-md'
                      : 'border-earth-200 text-earth-500 hover:border-leaf-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-text">土壤类型</label>
            <input
              type="text"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              placeholder="如：通用营养土、椰糠、泥炭土..."
              className="input-field"
            />
          </div>

          <div>
            <label className="label-text">光照位置</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(LIGHT_POSITION_LABELS) as [LightPosition, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLightPosition(key)}
                  className={`px-3 py-2.5 rounded-xl border-2 text-sm font-serif transition-all duration-200 ${
                    lightPosition === key
                      ? 'border-leaf-400 bg-leaf-50 text-leaf-700 shadow-md'
                      : 'border-earth-200 text-earth-500 hover:border-leaf-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">浇水频率（天）</label>
              <input
                type="number"
                min={1}
                max={30}
                value={wateringFrequencyDays}
                onChange={(e) => setWateringFrequencyDays(Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">施肥频率（天）</label>
              <input
                type="number"
                min={7}
                max={90}
                value={fertilizeFrequencyDays}
                onChange={(e) => setFertilizeFrequencyDays(Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card-paper p-5">
          <h3 className="font-handwriting text-lg text-earth-700 mb-3">📸 初始照片</h3>
          <PhotoUpload photos={photo} onChange={setPhoto} max={1} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            取消
          </button>
          <button
            type="submit"
            disabled={!name.trim() || !variety.trim()}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🌱 种下它！
          </button>
        </div>
      </form>
    </div>
  )
}
