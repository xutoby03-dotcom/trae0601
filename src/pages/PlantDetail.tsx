import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'
import {
  ArrowLeft,
  Droplets,
  Sun,
  MapPin,
  CalendarDays,
  User,
  Heart,
  HandHeart,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Leaf,
} from 'lucide-react'
import { usePlantStore } from '@/store/plantStore'
import { CURRENT_USER } from '@/data/mockData'
import type { ObservationType, AlertType } from '@/types'
import {
  STATUS_LABELS,
  LIGHT_LABELS,
  OBSERVATION_LABELS,
  DAY_LABELS,
  ALERT_LABELS,
} from '@/types'

const STATUS_COLORS: Record<string, string> = {
  healthy: 'bg-emerald-100 text-emerald-700',
  thirsty: 'bg-amber-100 text-amber-700',
  yellowLeaf: 'bg-yellow-100 text-yellow-700',
  needsNutrients: 'bg-purple-100 text-purple-700',
}

const OBS_COLORS: Record<ObservationType, string> = {
  leafChange: 'bg-green-100 text-green-700',
  pest: 'bg-red-100 text-red-700',
  fertilize: 'bg-amber-100 text-amber-700',
  prune: 'bg-teal-100 text-teal-700',
  water: 'bg-blue-100 text-blue-700',
  repot: 'bg-orange-100 text-orange-700',
}

const ALERT_COLORS: Record<AlertType, string> = {
  overwatering: 'bg-blue-100 text-blue-700',
  neglected: 'bg-amber-100 text-amber-700',
  yellowing: 'bg-yellow-100 text-yellow-700',
  pestWarning: 'bg-red-100 text-red-700',
}

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const plant = usePlantStore((s) => s.plants.find((p) => p.id === id))
  const adoptions = usePlantStore((s) => s.adoptions)
  const adoption = id ? adoptions.find((a) => a.plantId === id && !a.endDate) : undefined
  const allObservations = usePlantStore((s) => s.observations)
  const observations = id
    ? allObservations
        .filter((o) => o.plantId === id)
        .sort((a, b) => b.date.localeCompare(a.date))
    : []
  const allAlerts = usePlantStore((s) => s.alerts)
  const plantAlerts = id ? allAlerts.filter((a) => a.plantId === id && !a.resolved) : []
  const adoptPlant = usePlantStore((s) => s.adoptPlant)
  const requestTempCare = usePlantStore((s) => s.requestTempCare)
  const addObservation = usePlantStore((s) => s.addObservation)
  const resolveAlert = usePlantStore((s) => s.resolveAlert)

  const [showAdoptModal, setShowAdoptModal] = useState(false)
  const [showFosterModal, setShowFosterModal] = useState(false)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [fosterStart, setFosterStart] = useState('')
  const [fosterEnd, setFosterEnd] = useState('')
  const [obsType, setObsType] = useState<ObservationType>('water')
  const [obsContent, setObsContent] = useState('')

  const daysSinceWater = useMemo(() => {
    if (!plant) return 0
    return differenceInDays(new Date(), new Date(plant.lastWateredAt))
  }, [plant])

  if (!plant) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <Leaf className="w-16 h-16 text-stone-300 mb-4" />
        <h1 className="text-xl font-bold text-stone-500">未找到该植物</h1>
        <p className="text-stone-400 mt-2 mb-6">可能已被移除或 ID 无效</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
      </div>
    )
  }

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleAdopt = () => {
    if (selectedDays.length === 0) return
    adoptPlant({
      plantId: plant.id,
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      wateringDays: selectedDays.sort(),
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: null,
      isTemporary: false,
      originalAdoptionId: null,
    })
    setShowAdoptModal(false)
    setSelectedDays([])
  }

  const handleFoster = () => {
    if (!fosterStart || !fosterEnd) return
    requestTempCare({
      plantId: plant.id,
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      wateringDays: adoption?.wateringDays ?? [1, 3, 5],
      startDate: fosterStart,
      endDate: fosterEnd,
      isTemporary: true,
      originalAdoptionId: adoption?.id ?? null,
    })
    setShowFosterModal(false)
    setFosterStart('')
    setFosterEnd('')
  }

  const handleAddObs = () => {
    if (!obsContent.trim()) return
    addObservation({
      plantId: plant.id,
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      date: format(new Date(), 'yyyy-MM-dd'),
      type: obsType,
      content: obsContent.trim(),
    })
    setObsContent('')
    setObsType('water')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-stone-500 hover:text-emerald-600 mb-6 text-sm font-medium transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mb-6">
          <div className="h-64 sm:h-80 bg-stone-100 relative">
            <img
              src={plant.photo}
              alt={plant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span
              className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[plant.status]}`}
            >
              {STATUS_LABELS[plant.status]}
            </span>
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold text-stone-800 mb-4">{plant.name}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-stone-600">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm">{plant.desk} · {plant.area}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Sun className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm">{LIGHT_LABELS[plant.lightNeed]}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Droplets className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm">每 {plant.wateringFrequencyDays} 天浇水</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <CalendarDays className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm">上次换土 {plant.lastSoilChange}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm">{daysSinceWater} 天前浇水</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-stone-800">领养信息</h2>
          </div>

          {adoption ? (
            <div className="space-y-2">
              <p className="text-stone-700">
                <span className="font-medium">{adoption.userName}</span> 正在负责
              </p>
              <p className="text-sm text-stone-500">
                浇水日：周{adoption.wateringDays.map((d) => DAY_LABELS[d]).join('、')}
              </p>
              <p className="text-sm text-stone-500">
                开始日期：{adoption.startDate}
                {adoption.isTemporary && ` → ${adoption.endDate}`}
                {adoption.isTemporary && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                    临时代养
                  </span>
                )}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowFosterModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-medium transition cursor-pointer border border-amber-200"
                >
                  <HandHeart className="w-4 h-4" />
                  临时代养
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-stone-400 italic">无人负责</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAdoptModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition cursor-pointer"
                >
                  <Heart className="w-4 h-4" />
                  领养
                </button>
                <button
                  onClick={() => setShowFosterModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-medium transition cursor-pointer border border-amber-200"
                >
                  <HandHeart className="w-4 h-4" />
                  临时代养
                </button>
              </div>
            </div>
          )}
        </div>

        {plantAlerts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-stone-800">异常警报</h2>
            </div>
            <div className="space-y-3">
              {plantAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${ALERT_COLORS[alert.type]}`}
                      >
                        {ALERT_LABELS[alert.type]}
                      </span>
                      <span className="text-xs text-stone-400">{alert.createdAt}</span>
                    </div>
                    <p className="text-sm text-stone-600">{alert.message}</p>
                  </div>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    解决
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-stone-800">观察记录</h2>
          </div>

          <div className="space-y-3 mb-6">
            {observations.length === 0 ? (
              <p className="text-stone-400 text-sm italic">暂无观察记录</p>
            ) : (
              observations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-100"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${OBS_COLORS[obs.type]}`}
                    >
                      {OBSERVATION_LABELS[obs.type]}
                    </span>
                    <span className="text-xs text-stone-500">{obs.userName}</span>
                    <span className="text-xs text-stone-400">{obs.date}</span>
                  </div>
                  <p className="text-sm text-stone-600">{obs.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-stone-100 pt-4">
            <h3 className="text-sm font-medium text-stone-700 mb-3">添加观察</h3>
            <div className="space-y-3">
              <select
                value={obsType}
                onChange={(e) => setObsType(e.target.value as ObservationType)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition appearance-none"
              >
                {(Object.keys(OBSERVATION_LABELS) as ObservationType[]).map((key) => (
                  <option key={key} value={key}>
                    {OBSERVATION_LABELS[key]}
                  </option>
                ))}
              </select>
              <textarea
                value={obsContent}
                onChange={(e) => setObsContent(e.target.value)}
                placeholder="记录你观察到的变化..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition resize-none"
              />
              <button
                onClick={handleAddObs}
                disabled={!obsContent.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition cursor-pointer"
              >
                提交观察
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAdoptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-stone-800">领养 {plant.name}</h3>
              <button
                onClick={() => {
                  setShowAdoptModal(false)
                  setSelectedDays([])
                }}
                className="p-1 hover:bg-stone-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <p className="text-sm text-stone-600 mb-4">选择你的浇水日：</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`w-11 h-11 rounded-xl text-sm font-medium transition cursor-pointer ${
                    selectedDays.includes(i)
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  周{label}
                </button>
              ))}
            </div>

            <button
              onClick={handleAdopt}
              disabled={selectedDays.length === 0}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition cursor-pointer"
            >
              确认领养
            </button>
          </div>
        </div>
      )}

      {showFosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-stone-800">临时代养 {plant.name}</h3>
              <button
                onClick={() => {
                  setShowFosterModal(false)
                  setFosterStart('')
                  setFosterEnd('')
                }}
                className="p-1 hover:bg-stone-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">开始日期</label>
                <input
                  type="date"
                  value={fosterStart}
                  onChange={(e) => setFosterStart(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">结束日期</label>
                <input
                  type="date"
                  value={fosterEnd}
                  onChange={(e) => setFosterEnd(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                />
              </div>
            </div>

            <button
              onClick={handleFoster}
              disabled={!fosterStart || !fosterEnd}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition cursor-pointer"
            >
              确认代养
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
