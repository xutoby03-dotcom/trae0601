import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  Armchair,
  Sofa,
  Volume2,
  Snowflake,
  Eye,
  Clock,
  Users,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import { NapSpot, SEAT_TYPE_LABELS, SeatType, TIME_SLOTS } from '../types'
import { getSpots, computeSpotStatus, markNoShow, releaseNoShowsForDate, cancelReservation, completeReservation, SpotStatusInfo } from '../store'
import { Reservation } from '../types'

const STATUS_CONFIG = {
  available: { label: '空闲', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', dot: 'bg-emerald-400' },
  reserved: { label: '已预约', color: 'bg-amber-500/20 border-amber-500/40 text-amber-300', dot: 'bg-amber-400' },
  cleaning: { label: '清洁中', color: 'bg-sky-500/20 border-sky-500/40 text-sky-300', dot: 'bg-sky-400' },
}

const TYPE_ICONS: Record<SeatType, React.ReactNode> = {
  lounge: <Armchair className="w-5 h-5" />,
  sofa: <Sofa className="w-5 h-5" />,
  quiet_corner: <Volume2 className="w-5 h-5" />,
}

function SpotCard({
  spot,
  statusInfo,
  onNoShow,
  onCancel,
  onComplete,
}: {
  spot: NapSpot
  statusInfo: SpotStatusInfo
  onNoShow: (id: string) => void
  onCancel: (id: string) => void
  onComplete: (id: string, feedback: { cleanedUp: boolean; hasLeftItems: boolean; leftItemsDesc?: string }) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackTarget, setFeedbackTarget] = useState<Reservation | null>(null)
  const [feedback, setFeedback] = useState({ cleanedUp: true, hasLeftItems: false, leftItemsDesc: '' })
  const cfg = STATUS_CONFIG[statusInfo.status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className={`relative rounded-2xl border p-4 cursor-pointer transition-shadow duration-200 hover:shadow-lg ${cfg.color}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {TYPE_ICONS[spot.seatType]}
          <span className="font-semibold text-sm">{spot.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
          <span className="text-xs font-medium">{cfg.label}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-xs">
          <Users className="w-3 h-3" />{spot.capacity}人
        </span>
        {spot.hasLightBlocking && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 text-xs text-indigo-300">
            <Eye className="w-3 h-3" />遮光
          </span>
        )}
        {spot.nearAC && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/15 text-xs text-cyan-300">
            <Snowflake className="w-3 h-3" />靠空调
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-xs">
          <Clock className="w-3 h-3" />{spot.availableFrom}-{spot.availableTo}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{spot.area} · {SEAT_TYPE_LABELS[spot.seatType]}</p>
        {spot.capacity > 1 && statusInfo.status === 'reserved' && (
          <span className="text-xs text-amber-300/80">
            {statusInfo.remainingCapacity > 0 ? `余${statusInfo.remainingCapacity}位` : '已满'}
          </span>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
              {spot.rules && (
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{spot.rules}</span>
                </div>
              )}

              {statusInfo.activeReservations.map(reservation => (
                <div key={reservation.id} className="bg-white/5 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-medium text-slate-300">
                    预约人：{reservation.employeeName}
                  </p>
                  <p className="text-xs text-slate-400">
                    时段：{reservation.startTime} - {reservation.endTime}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {reservation.needQuiet && (
                      <span className="text-xs text-indigo-300">需要安静</span>
                    )}
                    {reservation.acceptNearby && (
                      <span className="text-xs text-cyan-300">接受临近</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {reservation.status === 'confirmed' && (
                      <>
                        <button
                          onClick={e => { e.stopPropagation(); onNoShow(reservation.id) }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs hover:bg-red-500/30 transition"
                        >
                          <XCircle className="w-3 h-3" />爽约
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); onCancel(reservation.id) }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-500/20 text-slate-300 text-xs hover:bg-slate-500/30 transition"
                        >
                          取消预约
                        </button>
                      </>
                    )}
                    {reservation.status === 'checked_in' && (
                      <button
                        onClick={e => { e.stopPropagation(); setFeedbackTarget(reservation); setShowFeedback(true) }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs hover:bg-emerald-500/30 transition"
                      >
                        <CheckCircle2 className="w-3 h-3" />结束使用
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {statusInfo.activeReservations.length === 0 && statusInfo.status !== 'cleaning' && (
                <p className="text-xs text-slate-500 text-center py-2">当前时段暂无预约</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback && feedbackTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 w-96 border border-slate-700/50 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">使用反馈</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedback.cleanedUp}
                    onChange={e => setFeedback(f => ({ ...f, cleanedUp: e.target.checked }))}
                    className="w-4 h-4 rounded accent-indigo-500"
                  />
                  <div>
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    <span className="text-sm">已整理座位</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedback.hasLeftItems}
                    onChange={e => setFeedback(f => ({ ...f, hasLeftItems: e.target.checked }))}
                    className="w-4 h-4 rounded accent-indigo-500"
                  />
                  <div>
                    <ShieldAlert className="w-4 h-4 inline mr-1" />
                    <span className="text-sm">有遗落物品</span>
                  </div>
                </label>
                {feedback.hasLeftItems && (
                  <textarea
                    value={feedback.leftItemsDesc}
                    onChange={e => setFeedback(f => ({ ...f, leftItemsDesc: e.target.value }))}
                    placeholder="描述遗落物品..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                    rows={2}
                  />
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-sm text-slate-300 hover:bg-slate-600 transition"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    onComplete(feedbackTarget.id, feedback)
                    setShowFeedback(false)
                    setFeedbackTarget(null)
                    setFeedback({ cleanedUp: true, hasLeftItems: false, leftItemsDesc: '' })
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-500 text-sm text-white hover:bg-indigo-600 transition"
                >
                  提交反馈
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Home() {
  const [spots, setSpots] = useState<NapSpot[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedStartTime, setSelectedStartTime] = useState<string>('12:00')
  const [selectedEndTime, setSelectedEndTime] = useState<string>('14:00')
  const [filterArea, setFilterArea] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  const refresh = () => setSpots(getSpots())

  useEffect(() => { refresh() }, [selectedDate])

  const spotStatusMap = useMemo(() => {
    const map = new Map<string, SpotStatusInfo>()
    spots.forEach(s => {
      map.set(s.id, computeSpotStatus(s.id, selectedDate, selectedStartTime, selectedEndTime))
    })
    return map
  }, [spots, selectedDate, selectedStartTime, selectedEndTime])

  const handleReleaseNoShows = () => {
    const now = format(new Date(), 'HH:mm')
    releaseNoShowsForDate(selectedDate, now)
    refresh()
  }

  const handleNoShow = (id: string) => {
    markNoShow(id)
    refresh()
  }

  const handleCancel = (id: string) => {
    cancelReservation(id)
    refresh()
  }

  const handleComplete = (id: string, feedback: { cleanedUp: boolean; hasLeftItems: boolean; leftItemsDesc?: string }) => {
    completeReservation(id, feedback)
    refresh()
  }

  const areas = [...new Set(spots.map(s => s.area))]
  const filteredSpots = spots.filter(s => {
    if (filterArea !== 'all' && s.area !== filterArea) return false
    if (filterType !== 'all' && s.seatType !== filterType) return false
    return true
  })

  const groupedByArea = areas.reduce<Record<string, NapSpot[]>>((acc, area) => {
    acc[area] = filteredSpots.filter(s => s.area === area)
    return acc
  }, {})

  const statusCounts = {
    available: filteredSpots.filter(s => spotStatusMap.get(s.id)?.status === 'available').length,
    reserved: filteredSpots.filter(s => spotStatusMap.get(s.id)?.status === 'reserved').length,
    cleaning: filteredSpots.filter(s => spotStatusMap.get(s.id)?.status === 'cleaning').length,
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">座位总览</h2>
          <p className="text-slate-400 text-sm mt-1">实时查看午休座位状态，点击座位卡片查看详情</p>
        </div>
        <button
          onClick={handleReleaseNoShows}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition"
        >
          <RotateCcw className="w-4 h-4" />
          释放爽约座位
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '空闲', count: statusCounts.available, icon: '🟢', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: '已预约', count: statusCounts.reserved, icon: '🟡', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: '清洁中', count: statusCounts.cleaning, icon: '🔵', bg: 'bg-sky-500/10 border-sky-500/20' },
        ].map(item => (
          <div key={item.label} className={`rounded-xl border p-4 ${item.bg}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{item.label}</span>
              <span className="text-2xl">{item.icon}</span>
            </div>
            <p className="text-3xl font-bold text-white mt-1">{item.count}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        />
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStartTime}
            onChange={e => setSelectedStartTime(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {TIME_SLOTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <span className="text-slate-500 text-sm">至</span>
          <select
            value={selectedEndTime}
            onChange={e => setSelectedEndTime(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {TIME_SLOTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <select
          value={filterArea}
          onChange={e => setFilterArea(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">所有区域</option>
          {areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">所有类型</option>
          <option value="lounge">躺椅</option>
          <option value="sofa">沙发</option>
          <option value="quiet_corner">安静角落</option>
        </select>
      </div>

      {Object.entries(groupedByArea).map(([area, areaSpots]) => (
        <div key={area} className="mb-8">
          <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-indigo-500" />
            {area}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {areaSpots.map(spot => {
              const statusInfo = spotStatusMap.get(spot.id)!
              return (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  statusInfo={statusInfo}
                  onNoShow={handleNoShow}
                  onCancel={handleCancel}
                  onComplete={handleComplete}
                />
              )
            })}
          </div>
        </div>
      ))}

      {filteredSpots.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Armchair className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>暂无座位数据</p>
        </div>
      )}
    </div>
  )
}
