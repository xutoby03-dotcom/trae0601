import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { getLevelLabel, getLevelColor } from '@/utils/degradation'
import { MapPin, Calendar, Clock, Users, Plus, X, Trash2, Hash, ListOrdered, Bike } from 'lucide-react'

const levelBadgeMap: Record<string, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-500/20 text-amber-400',
  orange: 'bg-orange-500/20 text-orange-400',
  red: 'bg-red-500/20 text-red-400',
  rose: 'bg-rose-500/20 text-rose-400',
}

export default function Events() {
  const {
    currentUser,
    users,
    detectionEvents,
    vehicles,
    addDetectionEvent,
    deleteDetectionEvent,
    registerForEvent,
    getEventRegistrations,
    getUserRegistrations,
  } = useStore()

  const [showCreate, setShowCreate] = useState(false)
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [location, setLocation] = useState('')
  const [maxSlots, setMaxSlots] = useState('')
  const [registerEventId, setRegisterEventId] = useState<string | null>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [queueResult, setQueueResult] = useState<number | null>(null)
  const [rosterEventId, setRosterEventId] = useState<string | null>(null)

  if (!currentUser) {
    return <div className="p-6 text-center text-zinc-400">请先登录后查看集中检测</div>
  }

  const isAdmin = currentUser.role === 'admin'
  const userRegistrations = getUserRegistrations(currentUser.id)
  const userVehicles = vehicles.filter((v) => v.userId === currentUser.id)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    addDetectionEvent({ date, timeSlot, location, maxSlots: Number(maxSlots), createdBy: currentUser.id })
    setShowCreate(false)
    setDate('')
    setTimeSlot('')
    setLocation('')
    setMaxSlots('')
  }

  const handleRegister = () => {
    if (!registerEventId || !selectedVehicleId) return
    const reg = registerForEvent(registerEventId, selectedVehicleId)
    if (reg) setQueueResult(reg.queueNumber)
    setRegisterEventId(null)
    setSelectedVehicleId('')
  }

  const sortedEvents = [...detectionEvents].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-zinc-100">集中检测</h2>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" /> 创建活动
          </button>
        )}
      </div>

      {sortedEvents.map((event) => {
        const allRegs = getEventRegistrations(event.id).sort((a, b) => a.queueNumber - b.queueNumber)
        const regCount = allRegs.length
        const pct = Math.min(100, (regCount / event.maxSlots) * 100)
        const myRegs = userRegistrations.filter((r) => r.eventId === event.id)
        const alreadyVehicleIds = myRegs.map((r) => r.vehicleId)
        const hasRegistered = myRegs.length > 0
        const registerableVehicles = userVehicles.filter((v) => !alreadyVehicleIds.includes(v.id))

        return (
          <div
            key={event.id}
            className={`rounded-2xl bg-zinc-900 border border-zinc-800 p-4 space-y-3 transition-all ${
              isAdmin ? 'hover:border-emerald-500/30 hover:bg-zinc-900/80 cursor-pointer' : ''
            }`}
            onClick={(e) => {
              if (!isAdmin) return
              const target = e.target as HTMLElement
              if (target.closest('button')) return
              setRosterEventId(event.id)
            }}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-300 text-sm">
                  <Calendar className="w-4 h-4 text-zinc-500" /> {event.date}
                </div>
                <div className="flex items-center gap-2 text-zinc-300 text-sm">
                  <Clock className="w-4 h-4 text-zinc-500" /> {event.timeSlot}
                </div>
                <div className="flex items-center gap-2 text-zinc-300 text-sm">
                  <MapPin className="w-4 h-4 text-zinc-500" /> {event.location}
                </div>
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {isAdmin && (
                  <button
                    onClick={() => setRosterEventId(event.id)}
                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-emerald-400 transition"
                    title="查看报名名单"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => deleteDetectionEvent(event.id)}
                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-zinc-400">
                  <Users className="w-3.5 h-3.5" /> 已报名
                </span>
                <span className="text-zinc-300 font-medium">{regCount}/{event.maxSlots}</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {!isAdmin && hasRegistered && (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                {myRegs.map((reg) => {
                  const regVehicle = vehicles.find((v) => v.id === reg.vehicleId)
                  return (
                    <div key={reg.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <Hash className="w-4 h-4 text-emerald-400 shrink-0" />
                      <Bike className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span className="text-zinc-300 text-sm truncate">
                        {regVehicle?.brand || '未知车辆'}
                      </span>
                      <span className="ml-auto text-2xl font-black text-emerald-400">
                        {reg.queueNumber}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {!isAdmin && !hasRegistered && regCount < event.maxSlots && registerableVehicles.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setRegisterEventId(event.id)
                  setSelectedVehicleId(registerableVehicles[0]?.id || '')
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition text-sm"
              >
                报名参加
              </button>
            )}

            {!isAdmin && !hasRegistered && regCount >= event.maxSlots && (
              <div className="text-center py-2 text-zinc-500 text-sm" onClick={(e) => e.stopPropagation()}>名额已满</div>
            )}

            {!isAdmin && hasRegistered && registerableVehicles.length > 0 && regCount < event.maxSlots && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setRegisterEventId(event.id)
                  setSelectedVehicleId(registerableVehicles[0]?.id || '')
                }}
                className="w-full py-2 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition text-sm"
              >
                继续报名其他车辆
              </button>
            )}
          </div>
        )
      })}

      {sortedEvents.length === 0 && (
        <div className="text-center py-12 text-zinc-500">暂无检测活动</div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-100">创建检测活动</h3>
              <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-sm text-zinc-400">检测日期</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-emerald-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-zinc-400">时间段</label>
                <input type="text" required placeholder="09:00-12:00" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-emerald-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-zinc-400">检测地点</label>
                <input type="text" required placeholder="小区北门广场" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-emerald-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-zinc-400">最大名额</label>
                <input type="number" required min={1} value={maxSlots} onChange={(e) => setMaxSlots(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-emerald-500/50 focus:outline-none" />
              </div>
              <button type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition">
                确认创建
              </button>
            </form>
          </div>
        </div>
      )}

      {registerEventId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-100">选择车辆</h3>
              <button onClick={() => setRegisterEventId(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {userVehicles.map((v) => {
                const alreadyRegistered = allRegisteredVehicleIds(registerEventId).includes(v.id)
                return (
                  <button
                    key={v.id}
                    disabled={alreadyRegistered}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                      alreadyRegistered
                        ? 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed'
                        : selectedVehicleId === v.id
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-zinc-100'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{v.brand}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{v.batteryModel}</div>
                      </div>
                      {alreadyRegistered && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">已报名</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            <button onClick={handleRegister} disabled={!selectedVehicleId || allRegisteredVehicleIds(registerEventId).includes(selectedVehicleId)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-semibold transition">
              确认报名
            </button>
          </div>
        </div>
      )}

      {rosterEventId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md max-h-[80vh] rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-zinc-800 shrink-0">
              <h3 className="text-lg font-bold text-zinc-100">报名名单</h3>
              <button onClick={() => setRosterEventId(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-2">
              {getEventRegistrations(rosterEventId)
                .sort((a, b) => a.queueNumber - b.queueNumber)
                .map((reg) => {
                  const regUser = users.find((u) => u.id === reg.userId)
                  const regVehicle = vehicles.find((v) => v.id === reg.vehicleId)
                  const color = regVehicle ? getLevelColor(regVehicle.degradationLevel) : 'emerald'
                  return (
                    <div key={reg.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm font-black text-emerald-400 shrink-0">
                        {reg.queueNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-200 truncate">{regUser?.name || '未知'}</span>
                          <span className="text-[10px] text-zinc-500 shrink-0">{regUser?.building || ''}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-zinc-400 truncate">{regVehicle?.brand || '未知车辆'}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${levelBadgeMap[color] || levelBadgeMap.emerald}`}>
                            {regVehicle?.degradationLevel || '-'} · {regVehicle ? getLevelLabel(regVehicle.degradationLevel) : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              {getEventRegistrations(rosterEventId).length === 0 && (
                <p className="text-center text-zinc-500 py-8">暂无报名</p>
              )}
            </div>
          </div>
        </div>
      )}

      {queueResult !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setQueueResult(null)}>
          <div className="rounded-2xl bg-zinc-900 border border-emerald-500/30 p-8 text-center space-y-3"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-zinc-400 text-sm">报名成功！您的排队号码</div>
            <div className="text-6xl font-black text-emerald-400 animate-count-up">{queueResult}</div>
            <button onClick={() => setQueueResult(null)}
              className="mt-2 px-6 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition text-sm">
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  )

  function allRegisteredVehicleIds(eventId: string | null): string[] {
    if (!eventId) return []
    const regs = getEventRegistrations(eventId)
    const userId = currentUser?.id
    return regs.filter((r) => r.userId === userId).map((r) => r.vehicleId)
  }
}
