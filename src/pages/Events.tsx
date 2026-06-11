import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { MapPin, Calendar, Clock, Users, Plus, X, Trash2, Hash } from 'lucide-react'

export default function Events() {
  const {
    currentUser,
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

  if (!currentUser) {
    return <div className="p-6 text-center text-zinc-400">请先登录后查看集中检测</div>
  }

  const isAdmin = currentUser.role === 'admin'
  const userRegistrations = getUserRegistrations(currentUser.id)

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

  const getRegCount = (eventId: string) => getEventRegistrations(eventId).length
  const getUserRegForEvent = (eventId: string) =>
    userRegistrations.find((r) => r.eventId === eventId)

  const userVehicles = vehicles.filter((v) => v.userId === currentUser.id)
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
        const regCount = getRegCount(event.id)
        const pct = Math.min(100, (regCount / event.maxSlots) * 100)
        const userReg = getUserRegForEvent(event.id)

        return (
          <div key={event.id} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
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
              {isAdmin && (
                <button
                  onClick={() => deleteDetectionEvent(event.id)}
                  className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
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

            {!isAdmin && userReg && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Hash className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-300 text-sm">排队号码</span>
                <span className="ml-auto text-2xl font-black text-emerald-400 animate-count-up">
                  {userReg.queueNumber}
                </span>
              </div>
            )}

            {!isAdmin && !userReg && regCount < event.maxSlots && (
              <button
                onClick={() => {
                  setRegisterEventId(event.id)
                  setSelectedVehicleId(userVehicles[0]?.id || '')
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition text-sm"
              >
                报名参加
              </button>
            )}

            {!isAdmin && !userReg && regCount >= event.maxSlots && (
              <div className="text-center py-2 text-zinc-500 text-sm">名额已满</div>
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
              {userVehicles.map((v) => (
                <button key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                    selectedVehicleId === v.id
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-zinc-100'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'
                  }`}>
                  <div className="font-medium">{v.brand}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{v.batteryModel}</div>
                </button>
              ))}
            </div>
            <button onClick={handleRegister} disabled={!selectedVehicleId}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-semibold transition">
              确认报名
            </button>
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
}
