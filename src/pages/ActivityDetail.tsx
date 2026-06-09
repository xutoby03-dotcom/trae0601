import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import PaceAlert from '@/components/PaceAlert'
import { useActivityStore } from '@/stores/useActivityStore'
import { useRouteStore } from '@/stores/useRouteStore'
import { useRunnerStore } from '@/stores/useRunnerStore'
import type { Participation, SafetyAlert } from '@/types'
import { formatPace, formatTime, formatDate, paceDiff, generateId, isLateNight } from '@/utils/helpers'
import { ArrowLeft, MapPin, Gauge, Ruler, Clock, Users, AlertTriangle, Check, Lightbulb, UserPlus, UserX } from 'lucide-react'

const statusLabels: Record<string, string> = {
  upcoming: '即将开始',
  ongoing: '进行中',
  completed: '已结束',
}

const statusStyles: Record<string, string> = {
  upcoming: 'bg-green-500/20 text-green-300 border-green-500/30',
  ongoing: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

function catmullRomToBezier(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }
  const tension = 0.3
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getActivity, getActivityParticipations, joinActivity } = useActivityStore()
  const { getRoute } = useRouteStore()
  const { currentRunner, getRunner } = useRunnerStore()

  const [joinFormOpen, setJoinFormOpen] = useState(false)
  const [paceValue, setPaceValue] = useState(currentRunner?.defaultPace ?? 360)
  const [targetDistance, setTargetDistance] = useState(5)
  const [showPaceAlert, setShowPaceAlert] = useState(false)

  const activity = getActivity(id!)
  const route = activity ? getRoute(activity.routeId) : undefined
  const participations = getActivityParticipations(id!)

  const organizer = activity ? getRunner(activity.organizerId) : undefined

  const isOrganizer = currentRunner?.id === activity?.organizerId
  const alreadyJoined = participations.some(p => p.runnerId === currentRunner?.id)

  useEffect(() => {
    if (activity) {
      setTargetDistance(activity.expectedDistance)
    }
  }, [activity?.id, activity?.expectedDistance])

  const safetyAlerts = useMemo<SafetyAlert[]>(() => {
    if (!activity || !route) return []
    const alerts: SafetyAlert[] = []
    if (isLateNight(activity.startTime)) {
      alerts.push({
        id: `late-night-${activity.id}`,
        type: 'late_night',
        message: '深夜跑步提醒：请注意安全，尽量结伴而行',
        timestamp: activity.startTime,
      })
    }
    if (!route.wellLit) {
      alerts.push({
        id: `poor-lighting-${route.id}`,
        type: 'poor_lighting',
        message: '该路线照明不佳，建议携带头灯或穿反光装备',
        routeId: route.id,
        timestamp: new Date().toISOString(),
      })
    }
    const participantCount = getActivityParticipations(activity.id).length
    if (participantCount <= 1) {
      alerts.push({
        id: `solo-return-${activity.id}`,
        type: 'solo_return',
        message: '目前仅一人参加，独自返回风险较高，建议等更多人报名或邀请同伴',
        timestamp: new Date().toISOString(),
      })
    }
    return alerts
  }, [activity, route, getActivityParticipations, participations])

  const paceDifference = activity ? paceDiff(paceValue, activity.expectedPace) : 0
  const paceExceedsThreshold = paceDifference > 30

  if (!activity || !route) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <p className="text-gray-500">活动不存在</p>
      </div>
    )
  }

  const handleJoinClick = () => {
    if (paceExceedsThreshold) {
      setShowPaceAlert(true)
    } else {
      submitJoin()
    }
  }

  const submitJoin = () => {
    if (!currentRunner || !activity) return
    const clampedDistance = Math.min(targetDistance, activity.expectedDistance)
    const participation: Participation = {
      id: generateId(),
      activityId: activity.id,
      runnerId: currentRunner.id,
      pace: paceValue,
      targetDistance: clampedDistance,
      completed: false,
      noShow: false,
      actualDistance: 0,
      actualDuration: 0,
    }
    joinActivity(participation)
    setJoinFormOpen(false)
    setShowPaceAlert(false)
  }

  const pathD = catmullRomToBezier(route.pathPoints)
  const xs = route.pathPoints.map(p => p.x)
  const ys = route.pathPoints.map(p => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const pad = 40
  const vbX = minX - pad
  const vbY = minY - pad
  const vbW = maxX - minX + pad * 2
  const vbH = maxY - minY + pad * 2

  return (
    <div className="min-h-screen bg-[#0B1120] pb-24">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-[#0B1120]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-white">活动详情</h1>
      </header>

      <div className="mx-auto max-w-lg px-4">
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/5 bg-[#0d1525]/80">
          <svg
            viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
            className="w-full"
            style={{ height: 200, background: '#0B1120' }}
          >
            <defs>
              <filter id="routeGlow">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="#0B1120" />
            <path
              d={pathD}
              fill="none"
              stroke={route.color}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#routeGlow)"
              opacity={0.4}
            />
            <path
              d={pathD}
              fill="none"
              stroke={route.color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 8px ${route.color})` }}
            />
            <circle
              cx={route.pathPoints[0].x}
              cy={route.pathPoints[0].y}
              r={6}
              fill={route.color}
              style={{ filter: `drop-shadow(0 0 6px ${route.color})` }}
            />
            <circle
              cx={route.pathPoints[0].x}
              cy={route.pathPoints[0].y}
              r={2.5}
              fill="#fff"
            />
            <circle
              cx={route.pathPoints[route.pathPoints.length - 1].x}
              cy={route.pathPoints[route.pathPoints.length - 1].y}
              r={6}
              fill={route.color}
              style={{ filter: `drop-shadow(0 0 6px ${route.color})` }}
            />
            <circle
              cx={route.pathPoints[route.pathPoints.length - 1].x}
              cy={route.pathPoints[route.pathPoints.length - 1].y}
              r={2.5}
              fill="#fff"
            />
          </svg>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-white/5 bg-[#0d1525]/80 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: route.color, boxShadow: `0 0 8px ${route.color}` }}
              />
              <h2 className="text-lg font-semibold text-white">{route.name}</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-gray-400">
                <MapPin size={16} className="text-cyan-400/70 shrink-0" />
                <span className="text-white">{activity.startPoint}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-400">
                <Gauge size={16} className="text-cyan-400/70 shrink-0" />
                <span className="text-white">{formatPace(activity.expectedPace)}/km</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-400">
                <Ruler size={16} className="text-cyan-400/70 shrink-0" />
                <span className="text-white">{activity.expectedDistance}km</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-400">
                <Clock size={16} className="text-cyan-400/70 shrink-0" />
                <span className="text-white">{formatDate(activity.startTime)} {formatTime(activity.startTime)}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[activity.status]}`}>
                {activity.status === 'ongoing' && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
                  </span>
                )}
                {activity.status !== 'ongoing' && (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
                {statusLabels[activity.status]}
              </span>
              {activity.acceptBeginner && (
                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-1 text-xs font-medium text-cyan-300">
                  <Check size={12} />
                  接受新手
                </span>
              )}
            </div>

            {activity.notes && (
              <div className="mt-4 rounded-xl bg-white/[0.03] p-3 text-sm leading-relaxed text-gray-400">
                {activity.notes}
              </div>
            )}
          </div>

          {organizer && (
            <div className="rounded-2xl border border-white/5 bg-[#0d1525]/80 p-4">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">发起人</h3>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                  style={{ background: `linear-gradient(135deg, ${route.color}33, ${route.color}11)`, border: `1.5px solid ${route.color}55` }}
                >
                  {organizer.avatar}
                </div>
                <span className="text-sm font-medium text-white">{organizer.nickname}</span>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/5 bg-[#0d1525]/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">参与者</h3>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Users size={14} />
                {participations.length}
              </span>
            </div>

            {participations.length > 0 ? (
              <div className="space-y-2.5">
                {participations.map(p => {
                  const runner = getRunner(p.runnerId)
                  if (!runner) return null
                  return (
                    <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-sm shrink-0"
                        style={{ background: `linear-gradient(135deg, ${route.color}22, ${route.color}08)` }}
                      >
                        {runner.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{runner.nickname}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                        <span>{formatPace(p.pace)}/km</span>
                        <span>{p.targetDistance}km</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-600">暂无参与者</p>
            )}

            {activity.status === 'upcoming' && !alreadyJoined && currentRunner && (
              <div className="mt-4">
                {!joinFormOpen ? (
                  <button
                    onClick={() => setJoinFormOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00FF88] py-3 text-sm font-semibold text-[#0B1120] shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all hover:shadow-[0_0_28px_rgba(0,255,136,0.5)] active:scale-[0.98]"
                  >
                    <UserPlus size={18} />
                    报名结伴
                  </button>
                ) : (
                  <div className="space-y-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-400">
                        配速: {formatPace(paceValue)}/km
                      </label>
                      <input
                        type="range"
                        min={240}
                        max={600}
                        step={10}
                        value={paceValue}
                        onChange={e => setPaceValue(Number(e.target.value))}
                        className="w-full accent-[#00FF88]"
                      />
                      <div className="mt-1 flex justify-between text-[10px] text-gray-600">
                        <span>4'00"</span>
                        <span>10'00"</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-400">
                        目标距离: {targetDistance}km
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={activity.expectedDistance}
                        step={0.5}
                        value={targetDistance}
                        onChange={e => setTargetDistance(Number(e.target.value))}
                        className="w-full accent-[#00FF88]"
                      />
                      <div className="mt-1 flex justify-between text-[10px] text-gray-600">
                        <span>1km</span>
                        <span>{activity.expectedDistance}km</span>
                      </div>
                    </div>
                    <button
                      onClick={handleJoinClick}
                      className="w-full rounded-xl bg-[#00FF88] py-2.5 text-sm font-semibold text-[#0B1120] shadow-[0_0_16px_rgba(0,255,136,0.3)] transition-all hover:shadow-[0_0_24px_rgba(0,255,136,0.5)] active:scale-[0.98]"
                    >
                      确认报名
                    </button>
                    <button
                      onClick={() => setJoinFormOpen(false)}
                      className="w-full rounded-xl bg-white/5 py-2 text-sm text-gray-400 transition-colors hover:bg-white/10 active:scale-[0.98]"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>
            )}

            {alreadyJoined && activity.status === 'upcoming' && (
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-green-500/10 py-2.5 text-sm text-green-400">
                <Check size={16} />
                已报名
              </div>
            )}
          </div>

          {safetyAlerts.length > 0 && (
            <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-950/40 to-[#0d1525]/80 p-4">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-orange-400/80">安全提醒</h3>
              <div className="space-y-2.5">
                {safetyAlerts.map(alert => {
                  const alertIconMap: Record<string, typeof AlertTriangle> = {
                    late_night: AlertTriangle,
                    poor_lighting: Lightbulb,
                    solo_return: UserX,
                    rain: AlertTriangle,
                  }
                  const Icon = alertIconMap[alert.type] ?? AlertTriangle
                  return (
                    <div key={alert.id} className="flex items-start gap-2.5 text-sm">
                      <Icon size={16} className="mt-0.5 shrink-0 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                      <span className="text-amber-100/80 leading-relaxed">{alert.message}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activity.status === 'completed' && isOrganizer && (
            <button
              onClick={() => navigate(`/record/${activity.id}`)}
              className="w-full rounded-xl bg-cyan-500/20 border border-cyan-500/30 py-3 text-sm font-semibold text-cyan-300 shadow-[0_0_16px_rgba(0,200,255,0.15)] transition-all hover:bg-cyan-500/30 hover:shadow-[0_0_24px_rgba(0,200,255,0.25)] active:scale-[0.98]"
            >
              记录结果
            </button>
          )}
        </div>
      </div>

      {showPaceAlert && (
        <PaceAlert
          paceDiff={paceDifference}
          onConfirm={submitJoin}
          onCancel={() => setShowPaceAlert(false)}
        />
      )}

      <Navbar />
    </div>
  )
}
