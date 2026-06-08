import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGardenStore } from '@/store/useGardenStore'
import {
  getDaysSince,
  isWaterNeeded,
  isFertilizeNeeded,
  hasRecentPest,
  VARIETY_PRESETS,
  OBSERVATION_TYPE_CONFIG,
  type ObservationType,
} from '@/types'
import Timeline from '@/components/Timeline'
import TasteRating from '@/components/TasteRating'
import PhotoCompareBar from '@/components/PhotoCompareBar'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  ArrowLeft,
  Droplets,
  FlaskConical,
  Flower2,
  Edit3,
  Trash2,
  PlusCircle,
  Package,
  Scale,
} from 'lucide-react'

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    plants, observations, harvests,
    updatePlant, deletePlant, waterPlant,
    addHarvest, getObservationsByPlant, getHarvestsByPlant,
  } = useGardenStore()

  const plant = plants.find((p) => p.id === id)
  const [activeTab, setActiveTab] = useState<'timeline' | 'harvest'>('timeline')
  const [showHarvestForm, setShowHarvestForm] = useState(false)
  const [harvestWeight, setHarvestWeight] = useState('')
  const [harvestRating, setHarvestRating] = useState(0)
  const [harvestNotes, setHarvestNotes] = useState('')
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0])
  const [filterType, setFilterType] = useState<ObservationType | 'all'>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!plant) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl">🥀</span>
        <p className="font-serif text-earth-500 mt-4">找不到这盆植物</p>
        <Link to="/" className="btn-secondary mt-4 inline-flex">返回菜园</Link>
      </div>
    )
  }

  const plantObs = getObservationsByPlant(plant.id)
  const plantHarvests = getHarvestsByPlant(plant.id)
  const daysSinceSowing = getDaysSince(plant.sowingDate)
  const waterNeeded = isWaterNeeded(plant)
  const fertilizeNeeded = isFertilizeNeeded(plant)
  const pestAlert = hasRecentPest(plantObs)

  const filteredObs = filterType === 'all'
    ? plantObs
    : plantObs.filter((o) => o.type === filterType)

  const obsWithPhotos = filteredObs.filter((o) => o.photos.length > 0)
  const obsWithoutPhotos = filteredObs.filter((o) => o.photos.length === 0)

  const totalHarvestWeight = plantHarvests.reduce((sum, h) => sum + h.weightGrams, 0)
  const avgRating = plantHarvests.length > 0
    ? plantHarvests.reduce((sum, h) => sum + h.tasteRating, 0) / plantHarvests.length
    : 0

  const varietyEmoji = VARIETY_PRESETS.find((v) => v.name === plant.variety)?.emoji || '🌱'

  const handleAddHarvest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!harvestWeight || harvestRating === 0) return

    addHarvest({
      plantId: plant.id,
      harvestDate,
      weightGrams: Number(harvestWeight),
      tasteRating: harvestRating,
      notes: harvestNotes.trim(),
    })
    setHarvestWeight('')
    setHarvestRating(0)
    setHarvestNotes('')
    setShowHarvestForm(false)
  }

  const handleDelete = () => {
    deletePlant(plant.id)
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="btn-ghost px-2">
          <ArrowLeft size={20} />
        </button>
        <h2 className="section-title flex items-center gap-2">
          {varietyEmoji} {plant.name}
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="btn-ghost px-2 text-tomato-500 hover:text-tomato-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="card-paper p-4 mb-4 border-tomato-200 bg-tomato-50">
          <p className="font-serif text-tomato-700 mb-3">确定要删除「{plant.name}」吗？所有观察记录和收获数据将一并删除。</p>
          <div className="flex gap-2">
            <button onClick={() => setShowDeleteConfirm(false)} className="btn-ghost text-sm">取消</button>
            <button onClick={handleDelete} className="btn-danger text-sm">确认删除</button>
          </div>
        </div>
      )}

      <div className="card-paper p-5 mb-4">
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-earth-200 flex-shrink-0">
            {plant.photo ? (
              <img src={plant.photo} alt={plant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-leaf-50">
                <span className="text-3xl">{varietyEmoji}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-handwriting text-xl text-earth-800">{plant.name}</h3>
              <span className="text-sm text-earth-500 font-serif">{plant.variety}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-leaf-50 text-leaf-700 text-xs font-serif border border-leaf-200">
                <Flower2 size={10} />
                第 {daysSinceSowing} 天
              </span>
              {waterNeeded && <span className="tag-water"><Droplets size={10} /> 缺水</span>}
              {fertilizeNeeded && <span className="tag-fertilize"><FlaskConical size={10} /> 该施肥</span>}
              {pestAlert && <span className="tag-pest">🐛 虫害!</span>}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-serif text-earth-600">
              <span>🪴 {plant.potSize === 'small' ? '小盆' : plant.potSize === 'medium' ? '中盆' : '大盆'}</span>
              <span>🌍 {plant.soilType}</span>
              <span>☀️ {plant.lightPosition === 'full-sun' ? '全日照' : plant.lightPosition === 'partial-sun' ? '半日照' : '阴凉'}</span>
              <span>💧 每{plant.wateringFrequencyDays}天浇水</span>
              <span>📅 播种于 {format(new Date(plant.sowingDate), 'M月d日', { locale: zhCN })}</span>
              <span>🧪 每{plant.fertilizeFrequencyDays}天施肥</span>
            </div>
          </div>
        </div>

        {waterNeeded && (
          <div className="mt-4">
            <button
              onClick={() => waterPlant(plant.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-dew-100 text-dew-700 font-serif font-semibold hover:bg-dew-200 transition-colors"
            >
              <Droplets size={16} />
              浇水打卡 💧
            </button>
          </div>
        )}
      </div>

      {plantHarvests.length > 0 && (
        <div className="card-paper p-4 mb-4 border-2 border-earth-300 bg-earth-50/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-handwriting text-lg text-earth-700 flex items-center gap-2">
              🎉 收获统计
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="font-mono text-2xl font-semibold text-chili-600">{totalHarvestWeight}</div>
              <div className="text-xs font-serif text-earth-500">克总产量</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl font-semibold text-leaf-600">{plantHarvests.length}</div>
              <div className="text-xs font-serif text-earth-500">次收获</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">
                {'🍅'.repeat(Math.round(avgRating)) || '—'}
              </div>
              <div className="text-xs font-serif text-earth-500">平均口感</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <Link to={`/observe/${plant.id}`} className="btn-primary text-sm flex-1">
          <PlusCircle size={14} />
          记录观察
        </Link>
        <button
          onClick={() => setShowHarvestForm(true)}
          className="btn-secondary text-sm"
        >
          <Scale size={14} />
          记录收获
        </button>
      </div>

      {showHarvestForm && (
        <div className="card-paper p-5 mb-4 border-2 border-earth-300 animate-slide-up">
          <div className="tape-decoration pt-2">
            <h3 className="font-handwriting text-lg text-earth-700 mb-4">🍅 记录收获</h3>
          </div>
          <form onSubmit={handleAddHarvest} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">收获日期</label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">重量（克）*</label>
                <input
                  type="number"
                  min={1}
                  value={harvestWeight}
                  onChange={(e) => setHarvestWeight(e.target.value)}
                  placeholder="如：150"
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label-text">口感评价 *</label>
              <TasteRating value={harvestRating} onChange={setHarvestRating} />
            </div>
            <div>
              <label className="label-text">备注</label>
              <input
                type="text"
                value={harvestNotes}
                onChange={(e) => setHarvestNotes(e.target.value)}
                placeholder="这次收成怎么样？"
                className="input-field"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowHarvestForm(false)} className="btn-ghost flex-1">
                取消
              </button>
              <button
                type="submit"
                disabled={!harvestWeight || harvestRating === 0}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                🎉 记录收获
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-1 mb-4 border-b border-earth-200 pb-2">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-1.5 rounded-full text-sm font-serif transition-all ${
            activeTab === 'timeline'
              ? 'bg-leaf-100 text-leaf-700 font-semibold'
              : 'text-earth-500 hover:text-leaf-600'
          }`}
        >
          📋 成长时间线
        </button>
        <button
          onClick={() => setActiveTab('harvest')}
          className={`px-4 py-1.5 rounded-full text-sm font-serif transition-all ${
            activeTab === 'harvest'
              ? 'bg-leaf-100 text-leaf-700 font-semibold'
              : 'text-earth-500 hover:text-leaf-600'
          }`}
        >
          🍅 收获记录 ({plantHarvests.length})
        </button>
      </div>

      {activeTab === 'timeline' && (
        <>
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-xs font-serif transition-all ${
                filterType === 'all'
                  ? 'bg-earth-400 text-white'
                  : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
              }`}
            >
              全部
            </button>
            {(Object.entries(OBSERVATION_TYPE_CONFIG) as [ObservationType, typeof OBSERVATION_TYPE_CONFIG[ObservationType]][]).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-3 py-1 rounded-full text-xs font-serif transition-all ${
                  filterType === key
                    ? `bg-${config.color}-400 text-white`
                    : `bg-${config.color}-50 text-${config.color}-600 hover:bg-${config.color}-100`
                }`}
              >
                {config.emoji} {config.label}
              </button>
            ))}
          </div>

          {obsWithPhotos.length > 0 && (
            <PhotoCompareBar observations={obsWithPhotos} />
          )}

          {obsWithoutPhotos.length > 0 && (
            <div>
              {obsWithPhotos.length > 0 && (
                <div className="flex items-center gap-2 mb-3 mt-2">
                  <div className="h-px flex-1 bg-earth-200" />
                  <span className="text-[10px] font-serif text-earth-400">纯文字记录</span>
                  <div className="h-px flex-1 bg-earth-200" />
                </div>
              )}
              <Timeline observations={obsWithoutPhotos} />
            </div>
          )}

          {obsWithoutPhotos.length === 0 && obsWithPhotos.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl">📝</span>
              <p className="font-serif text-earth-500 mt-3">还没有观察记录</p>
              <p className="font-serif text-earth-400 text-sm mt-1">开始记录植物的成长吧</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'harvest' && (
        <div className="space-y-3">
          {plantHarvests.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">🧺</span>
              <p className="font-serif text-earth-500 mt-3">还没有收获记录</p>
            </div>
          ) : (
            plantHarvests.map((h) => (
              <div key={h.id} className="card-paper p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xl font-semibold text-chili-600">
                        {h.weightGrams}g
                      </span>
                      <span className="text-sm">🍅</span>
                    </div>
                    <div className="text-sm font-serif">
                      {'🍅'.repeat(h.tasteRating)}
                      <span className="text-earth-400 ml-1">
                        {['', '一般', '还行', '好吃', '很棒', '绝了！'][h.tasteRating]}
                      </span>
                    </div>
                    {h.notes && (
                      <p className="text-sm font-serif text-earth-600 mt-1">{h.notes}</p>
                    )}
                  </div>
                  <span className="text-xs font-serif text-earth-400">
                    {format(new Date(h.harvestDate), 'M月d日', { locale: zhCN })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
