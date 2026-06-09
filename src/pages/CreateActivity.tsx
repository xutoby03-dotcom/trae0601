import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { useActivityStore } from '@/stores/useActivityStore'
import { useRouteStore } from '@/stores/useRouteStore'
import { useRunnerStore } from '@/stores/useRunnerStore'
import type { Activity, Participation } from '@/types'
import { formatPace, generateId, getRouteTypeLabel } from '@/utils/helpers'
import { ArrowLeft, MapPin, Gauge, Ruler, Clock, MessageSquare, Check, Sun, Moon } from 'lucide-react'

const routeTypeColors: Record<string, string> = {
  track: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  riverside: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  street: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  park: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

export default function CreateActivity() {
  const navigate = useNavigate()
  const { routes } = useRouteStore()
  const { addActivity, joinActivity } = useActivityStore()
  const { currentRunner } = useRunnerStore()

  const [selectedRouteId, setSelectedRouteId] = useState<string>('')
  const [startPoint, setStartPoint] = useState('')
  const [expectedPace, setExpectedPace] = useState(360)
  const [expectedDistance, setExpectedDistance] = useState<number>(0)
  const [startTime, setStartTime] = useState('')
  const [acceptBeginner, setAcceptBeginner] = useState(false)
  const [notes, setNotes] = useState('')

  const selectedRoute = routes.find(r => r.id === selectedRouteId)

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId)
    const route = routes.find(r => r.id === routeId)
    if (route) {
      setExpectedDistance(route.distance)
    }
  }

  const handleSubmit = () => {
    if (!selectedRouteId || !startPoint || !startTime || !currentRunner) return

    const activityId = generateId()
    const activity: Activity = {
      id: activityId,
      routeId: selectedRouteId,
      organizerId: currentRunner.id,
      startPoint,
      expectedPace,
      expectedDistance,
      startTime,
      acceptBeginner,
      notes,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    }

    const organizerParticipation: Participation = {
      id: generateId(),
      activityId,
      runnerId: currentRunner.id,
      pace: expectedPace,
      targetDistance: expectedDistance,
      completed: false,
      noShow: false,
      actualDistance: 0,
      actualDuration: 0,
    }

    addActivity(activity)
    joinActivity(organizerParticipation)
    navigate('/')
  }

  const isValid = selectedRouteId && startPoint && startTime

  return (
    <div className="min-h-screen bg-[#0B1120] text-white pb-24">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/5 bg-[#0B1120]/90 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold">发起夜跑</h1>
      </header>

      <div className="px-4 py-5">
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-gray-400">选择路线</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {routes.map(route => {
              const isSelected = selectedRouteId === route.id
              return (
                <button
                  key={route.id}
                  onClick={() => handleSelectRoute(route.id)}
                  className={`relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-[#00FF88] shadow-[0_0_16px_rgba(0,255,136,0.25)] bg-[#0d1525]'
                      : 'border-[#1e293b] bg-[#0d1525] hover:border-white/20'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#00FF88]">
                      <Check size={12} className="text-[#0B1120]" strokeWidth={3} />
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${routeTypeColors[route.type]}`}
                    >
                      {getRouteTypeLabel(route.type)}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                      {route.wellLit ? (
                        <Sun size={10} className="text-yellow-400" />
                      ) : (
                        <Moon size={10} className="text-blue-400" />
                      )}
                      {route.wellLit ? '灯明' : '灯暗'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">{route.name}</span>
                  <span className="text-xs text-gray-500">{route.distance}km</span>
                </button>
              )
            })}
          </div>
        </section>

        {selectedRoute && (
          <section className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm text-gray-400">
                <MapPin size={14} className="text-cyan-400/60" />
                集合地点
              </label>
              <input
                type="text"
                value={startPoint}
                onChange={e => setStartPoint(e.target.value)}
                placeholder="输入集合地点"
                className="w-full rounded-lg border border-[#1e293b] bg-[#0d1525] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#00FF88]"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm text-gray-400">
                <Gauge size={14} className="text-cyan-400/60" />
                预期配速
                <span className="ml-auto font-mono text-[#00FF88]">{formatPace(expectedPace)}/km</span>
              </label>
              <input
                type="range"
                min={240}
                max={480}
                step={10}
                value={expectedPace}
                onChange={e => setExpectedPace(Number(e.target.value))}
                className="w-full accent-[#00FF88]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-gray-600">
                <span>4'00"</span>
                <span>8'00"</span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm text-gray-400">
                <Ruler size={14} className="text-cyan-400/60" />
                预期距离 (km)
              </label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={expectedDistance || ''}
                onChange={e => setExpectedDistance(Number(e.target.value))}
                className="w-full rounded-lg border border-[#1e293b] bg-[#0d1525] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#00FF88]"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm text-gray-400">
                <Clock size={14} className="text-cyan-400/60" />
                出发时间
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-[#1e293b] bg-[#0d1525] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#00FF88] [color-scheme:dark]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-sm text-gray-400">
                接受新手
              </label>
              <button
                onClick={() => setAcceptBeginner(!acceptBeginner)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                  acceptBeginner ? 'bg-[#00FF88]' : 'bg-[#1e293b]'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    acceptBeginner ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm text-gray-400">
                <MessageSquare size={14} className="text-cyan-400/60" />
                备注
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="添加备注信息..."
                rows={3}
                className="w-full resize-none rounded-lg border border-[#1e293b] bg-[#0d1525] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-[#00FF88]"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
                isValid
                  ? 'bg-[#00FF88] text-[#0B1120] shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:shadow-[0_0_30px_rgba(0,255,136,0.6)]'
                  : 'cursor-not-allowed bg-[#1e293b] text-gray-600'
              }`}
            >
              发布活动
            </button>
          </section>
        )}
      </div>

      <Navbar />
    </div>
  )
}
