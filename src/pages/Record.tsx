import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { useActivityStore } from '@/stores/useActivityStore'
import { useRouteStore } from '@/stores/useRouteStore'
import { useRunnerStore } from '@/stores/useRunnerStore'
import { formatPace, formatDuration } from '@/utils/helpers'
import { ArrowLeft, Check, X, Ruler, Clock, UserX, Trophy } from 'lucide-react'

interface RecordData {
  completed: boolean
  noShow: boolean
  actualDistance: string
  actualDuration: string
}

export default function Record() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getActivity, getActivityParticipations, recordResult, completeActivity } = useActivityStore()
  const { getRoute } = useRouteStore()
  const { getRunner, currentRunner } = useRunnerStore()

  const activity = getActivity(id!)
  const participations = getActivityParticipations(id!)
  const route = activity ? getRoute(activity.routeId) : undefined

  const [records, setRecords] = useState<Record<string, RecordData>>(() => {
    const initial: Record<string, RecordData> = {}
    participations.forEach(p => {
      initial[p.id] = {
        completed: p.completed,
        noShow: p.noShow,
        actualDistance: p.actualDistance ? String(p.actualDistance) : '',
        actualDuration: p.actualDuration ? String(Math.round(p.actualDuration / 60)) : '',
      }
    })
    return initial
  })

  if (!activity || !route) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <p className="text-white/40 text-sm">活动不存在</p>
      </div>
    )
  }

  if (activity.status === 'upcoming') {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center gap-3">
        <p className="text-white/40 text-sm">活动尚未开始</p>
        <button
          onClick={() => navigate(-1)}
          className="text-[#00FF88] text-sm"
        >
          返回
        </button>
      </div>
    )
  }

  const isOrganizer = currentRunner?.id === activity.organizerId

  const updateRecord = (participationId: string, patch: Partial<RecordData>) => {
    setRecords(prev => ({
      ...prev,
      [participationId]: { ...prev[participationId], ...patch },
    }))
  }

  const toggleCompleted = (participationId: string) => {
    const current = records[participationId]
    if (current.completed) {
      updateRecord(participationId, { completed: false, actualDistance: '', actualDuration: '' })
    } else {
      updateRecord(participationId, { completed: true, noShow: false })
    }
  }

  const toggleNoShow = (participationId: string) => {
    const current = records[participationId]
    if (current.noShow) {
      updateRecord(participationId, { noShow: false })
    } else {
      updateRecord(participationId, { noShow: true, completed: false, actualDistance: '', actualDuration: '' })
    }
  }

  const allRecorded = participations.every(p => {
    const r = records[p.id]
    return r.completed || r.noShow
  })

  const completedParticipations = participations.filter(p => records[p.id]?.completed)
  const noShowCount = participations.filter(p => records[p.id]?.noShow).length
  const totalActualDistance = completedParticipations.reduce((sum, p) => {
    const r = records[p.id]
    return sum + (parseFloat(r.actualDistance) || 0)
  }, 0)
  const totalActualDuration = completedParticipations.reduce((sum, p) => {
    const r = records[p.id]
    return sum + (parseFloat(r.actualDuration) || 0)
  }, 0)
  const averagePace = totalActualDistance > 0
    ? (totalActualDuration * 60) / totalActualDistance
    : 0
  const completionRate = `${completedParticipations.length}/${participations.length}`

  const handleSave = () => {
    participations.forEach(p => {
      const r = records[p.id]
      recordResult(p.id, {
        completed: r.completed,
        noShow: r.noShow,
        actualDistance: r.completed ? (parseFloat(r.actualDistance) || 0) : 0,
        actualDuration: r.completed ? (parseFloat(r.actualDuration) || 0) * 60 : 0,
      })
    })
    completeActivity(activity.id)
    navigate(-1)
  }

  const formatDateStr = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const statusLabel = activity.status === 'completed' ? '已完成' : activity.status === 'ongoing' ? '进行中' : '即将开始'

  return (
    <div className="min-h-screen bg-[#0B1120] pb-24">
      <header className="sticky top-0 z-40 bg-[#0B1120]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center h-14 px-4 gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <h1 className="text-white text-lg font-semibold">跑后记录</h1>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#00FF88]/10 to-[#00FF88]/5 border border-[#00FF88]/20 p-4">
          <h2 className="text-white font-semibold text-lg">{route.name}</h2>
          <div className="flex items-center gap-3 mt-2 text-sm text-white/50">
            <span>{formatDateStr(activity.startTime)}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              activity.status === 'completed'
                ? 'bg-[#00FF88]/20 text-[#00FF88]'
                : activity.status === 'ongoing'
                ? 'bg-[#FFB020]/20 text-[#FFB020]'
                : 'bg-white/10 text-white/60'
            }`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-white/40">
            <span className="flex items-center gap-1">
              <Ruler size={14} />
              {activity.expectedDistance}km
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatPace(activity.expectedPace)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-white/60 text-sm font-medium px-1">参与者记录</h3>
          {participations.map(p => {
            const runner = getRunner(p.runnerId)
            if (!runner) return null
            const r = records[p.id]
            const isNoShow = r.noShow
            const isCompleted = r.completed

            return (
              <div
                key={p.id}
                className={`rounded-xl bg-white/5 border border-white/5 p-4 transition-all duration-300 ${
                  isNoShow ? 'opacity-40' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${isNoShow ? 'grayscale' : ''}`}
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  {runner.avatar}
                </div>
                  <div className={`flex-1 min-w-0 ${isNoShow ? 'line-through' : ''}`}>
                    <p className="text-white text-sm font-medium truncate">{runner.nickname}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      目标 {formatPace(p.pace)} · {p.targetDistance}km
                    </p>
                  </div>
                  {runner.id === activity.organizerId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00FF88]/15 text-[#00FF88] font-medium">
                      发起人
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => toggleCompleted(p.id)}
                    disabled={!isOrganizer}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isCompleted
                        ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30 shadow-[0_0_12px_rgba(0,255,136,0.15)]'
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}
                  >
                    <Check size={12} />
                    完成
                  </button>
                  <button
                    onClick={() => toggleNoShow(p.id)}
                    disabled={!isOrganizer}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isNoShow
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}
                  >
                    <UserX size={12} />
                    放鸽子
                  </button>
                </div>

                {isCompleted && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                    <div className="flex-1">
                      <label className="text-white/30 text-[10px] uppercase tracking-wider">实际距离(km)</label>
                      <input
                        type="number"
                        value={r.actualDistance}
                        onChange={e => updateRecord(p.id, { actualDistance: e.target.value })}
                        disabled={!isOrganizer}
                        placeholder="0.0"
                        step="0.1"
                        min="0"
                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF88]/50 focus:shadow-[0_0_8px_rgba(0,255,136,0.15)] transition-all disabled:opacity-40"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-white/30 text-[10px] uppercase tracking-wider">用时(分钟)</label>
                      <input
                        type="number"
                        value={r.actualDuration}
                        onChange={e => updateRecord(p.id, { actualDuration: e.target.value })}
                        disabled={!isOrganizer}
                        placeholder="0"
                        min="0"
                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF88]/50 focus:shadow-[0_0_8px_rgba(0,255,136,0.15)] transition-all disabled:opacity-40"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {allRecorded && (
          <div className="rounded-2xl bg-gradient-to-br from-[#00FF88]/10 to-transparent border border-[#00FF88]/15 p-4 space-y-3">
            <h3 className="text-white/60 text-sm font-medium flex items-center gap-2">
              <Trophy size={14} className="text-[#00FF88]" />
              本次统计
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wider">总距离</p>
                <p className="text-white text-lg font-semibold mt-1">{totalActualDistance.toFixed(1)}<span className="text-sm text-white/40 ml-0.5">km</span></p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wider">平均配速</p>
                <p className="text-white text-lg font-semibold mt-1">{averagePace > 0 ? formatPace(averagePace) : '--'}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wider">完成率</p>
                <p className="text-white text-lg font-semibold mt-1">{completionRate}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wider">放鸽子</p>
                <p className="text-red-400 text-lg font-semibold mt-1">{noShowCount}</p>
              </div>
            </div>
          </div>
        )}

        {isOrganizer && (
          <button
            onClick={handleSave}
            disabled={!allRecorded}
            className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-300 ${
              allRecorded
                ? 'bg-[#00FF88] text-[#0B1120] shadow-[0_0_24px_rgba(0,255,136,0.5),0_0_48px_rgba(0,255,136,0.2)] hover:shadow-[0_0_32px_rgba(0,255,136,0.6),0_0_64px_rgba(0,255,136,0.3)] active:scale-[0.98]'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            保存记录
          </button>
        )}
      </div>

      <Navbar />
    </div>
  )
}
