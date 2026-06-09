import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, X, Save, ArrowLeft } from 'lucide-react'
import { useRouteStore } from '@/stores/useRouteStore'
import { useAppStore } from '@/stores/useAppStore'
import type { Stop } from '@/types'

interface StopInput {
  id: string
  name: string
  estimatedTime: string
}

export default function RouteForm() {
  const { routeId } = useParams<{ routeId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addRoute, updateRoute, getRouteById } = useRouteStore()
  const { selectedDate } = useAppStore()

  const isEdit = !!routeId

  const [name, setName] = useState('')
  const [departure, setDeparture] = useState('')
  const [destination, setDestination] = useState('')
  const [departureTime, setDepartureTime] = useState('08:00')
  const [totalSeats, setTotalSeats] = useState(45)
  const [driverPhone, setDriverPhone] = useState('')
  const [routeType, setRouteType] = useState<'morning' | 'evening'>('morning')
  const [isTemporary, setIsTemporary] = useState(false)
  const [stops, setStops] = useState<StopInput[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (searchParams.get('temporary') === 'true') {
      setIsTemporary(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (isEdit) {
      const route = getRouteById(routeId!)
      if (route) {
        setName(route.name)
        setDeparture(route.departure)
        setDestination(route.destination)
        setDepartureTime(route.departureTime)
        setTotalSeats(route.totalSeats)
        setDriverPhone(route.driverPhone)
        setRouteType(route.type)
        setIsTemporary(route.isTemporary)
        setStops(
          route.stops.map((s: Stop) => ({
            id: s.id,
            name: s.name,
            estimatedTime: s.estimatedTime,
          }))
        )
      }
    }
  }, [isEdit, routeId, getRouteById])

  const addStop = () => {
    setStops([
      ...stops,
      { id: `new_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: '', estimatedTime: '' },
    ])
  }

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index))
  }

  const updateStop = (index: number, field: 'name' | 'estimatedTime', value: string) => {
    const updated = [...stops]
    updated[index] = { ...updated[index], [field]: value }
    setStops(updated)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = '请输入线路名称'
    if (!departure.trim()) newErrors.departure = '请输入出发地'
    if (!destination.trim()) newErrors.destination = '请输入到达地'
    if (!departureTime) newErrors.departureTime = '请选择发车时间'
    if (totalSeats <= 0) newErrors.totalSeats = '座位数必须大于0'
    if (!driverPhone.trim()) newErrors.driverPhone = '请输入司机电话'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const stopsData: Stop[] = stops.map((s, i) => ({
      id: s.id,
      name: s.name,
      order: i + 1,
      estimatedTime: s.estimatedTime,
    }))

    const routeData = {
      name: name.trim(),
      departure: departure.trim(),
      destination: destination.trim(),
      departureTime,
      totalSeats,
      driverPhone: driverPhone.trim(),
      type: routeType,
      isTemporary,
      date: selectedDate,
      stops: stopsData,
      isDelayed: false,
    }

    if (isEdit) {
      updateRoute(routeId!, routeData)
    } else {
      addRoute(routeData)
    }

    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2440] to-[#1e3a5f]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? '编辑线路' : '添加线路'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
              基本信息
            </h2>

            <div>
              <label className="block text-sm text-white/70 mb-1">线路名称 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-white/10 border ${
                  errors.name ? 'border-red-400' : 'border-white/20'
                } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]`}
                placeholder="例: 早班1号线"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">出发地 *</label>
                <input
                  type="text"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/10 border ${
                    errors.departure ? 'border-red-400' : 'border-white/20'
                  } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]`}
                  placeholder="例: 地铁站A"
                />
                {errors.departure && <p className="text-red-400 text-xs mt-1">{errors.departure}</p>}
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">到达地 *</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/10 border ${
                    errors.destination ? 'border-red-400' : 'border-white/20'
                  } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]`}
                  placeholder="例: 公司总部"
                />
                {errors.destination && <p className="text-red-400 text-xs mt-1">{errors.destination}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">发车时间 *</label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/10 border ${
                    errors.departureTime ? 'border-red-400' : 'border-white/20'
                  } text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b35]`}
                />
                {errors.departureTime && <p className="text-red-400 text-xs mt-1">{errors.departureTime}</p>}
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">座位数 *</label>
                <input
                  type="number"
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(Number(e.target.value))}
                  min={1}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/10 border ${
                    errors.totalSeats ? 'border-red-400' : 'border-white/20'
                  } text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b35]`}
                />
                {errors.totalSeats && <p className="text-red-400 text-xs mt-1">{errors.totalSeats}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">司机电话 *</label>
              <input
                type="tel"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-white/10 border ${
                  errors.driverPhone ? 'border-red-400' : 'border-white/20'
                } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]`}
                placeholder="例: 138xxxx1234"
              />
              {errors.driverPhone && <p className="text-red-400 text-xs mt-1">{errors.driverPhone}</p>}
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-3">班次类型</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="routeType"
                    value="morning"
                    checked={routeType === 'morning'}
                    onChange={() => setRouteType('morning')}
                    className="accent-[#ff6b35] w-4 h-4"
                  />
                  <span className="text-white">早班</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="routeType"
                    value="evening"
                    checked={routeType === 'evening'}
                    onChange={() => setRouteType('evening')}
                    className="accent-[#ff6b35] w-4 h-4"
                  />
                  <span className="text-white">晚班</span>
                </label>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTemporary}
                  onChange={(e) => setIsTemporary(e.target.checked)}
                  className="accent-[#ff6b35] w-4 h-4 rounded"
                />
                <span className="text-white">临时线路</span>
              </label>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h2 className="text-lg font-semibold text-white">途经站点</h2>
              <button
                type="button"
                onClick={addStop}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#ff6b35] hover:bg-[#e55a2b] text-white text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加站点
              </button>
            </div>

            {stops.length === 0 && (
              <p className="text-white/40 text-sm text-center py-4">暂无途经站点，点击上方按钮添加</p>
            )}

            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#ff6b35]/20 text-[#ff6b35] text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={stop.name}
                    onChange={(e) => updateStop(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] text-sm"
                    placeholder="站点名称"
                  />
                  <input
                    type="time"
                    value={stop.estimatedTime}
                    onChange={(e) => updateStop(index, 'estimatedTime', e.target.value)}
                    className="w-28 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b35] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeStop(index)}
                    className="flex-shrink-0 p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-medium transition-colors"
            >
              <Save className="w-5 h-5" />
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
