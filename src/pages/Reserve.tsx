import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  CalendarPlus,
  Clock,
  Eye,
  Snowflake,
  Volume2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Armchair,
  Sofa,
} from 'lucide-react'
import { NapSpot, SEAT_TYPE_LABELS, SeatType, TIME_SLOTS, Reservation } from '../types'
import {
  getSpots,
  getReservationsByDate,
  addReservation,
  checkConflict,
  checkInReservation,
  cancelReservation,
  computeSpotStatus,
} from '../store'

export default function Reserve() {
  const [spots, setSpots] = useState<NapSpot[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedSpot, setSelectedSpot] = useState<NapSpot | null>(null)
  const [form, setForm] = useState({
    employeeName: '',
    employeeId: '',
    startTime: '12:00',
    endTime: '13:00',
    needQuiet: false,
    acceptNearby: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [myReservations, setMyReservations] = useState<Reservation[]>([])

  const refresh = () => {
    setSpots(getSpots())
    setReservations(getReservationsByDate(selectedDate))
  }

  useEffect(() => { refresh() }, [selectedDate])

  const availableSpots = spots.filter(spot => {
    const statusInfo = computeSpotStatus(spot.id, selectedDate, form.startTime, form.endTime)
    if (statusInfo.status === 'cleaning') return false
    if (statusInfo.isFull) return false
    if (statusInfo.hasExclusiveOccupant) return false
    return true
  })

  const filteredSpots = form.needQuiet
    ? availableSpots.filter(s => s.seatType === 'quiet_corner' || s.hasLightBlocking)
    : availableSpots

  const handleSelectSpot = (spot: NapSpot) => {
    setSelectedSpot(spot)
    setForm(f => ({
      ...f,
      startTime: spot.availableFrom,
      endTime: spot.availableTo,
    }))
    setStep(2)
  }

  const handleSubmit = () => {
    setError(null)
    if (!selectedSpot) return
    if (!form.employeeName.trim()) {
      setError('请输入姓名')
      return
    }

    const conflict = checkConflict(selectedSpot.id, selectedDate, form.startTime, form.endTime, form.acceptNearby)
    if (conflict.conflict) {
      setError(conflict.message)
      return
    }

    if (form.startTime >= form.endTime) {
      setError('结束时间必须晚于开始时间')
      return
    }

    if (form.startTime < selectedSpot.availableFrom || form.endTime > selectedSpot.availableTo) {
      setError(`预约时间需在 ${selectedSpot.availableFrom}-${selectedSpot.availableTo} 范围内`)
      return
    }

    const result = addReservation({
      spotId: selectedSpot.id,
      employeeName: form.employeeName,
      employeeId: form.employeeId,
      date: selectedDate,
      startTime: form.startTime,
      endTime: form.endTime,
      needQuiet: form.needQuiet,
      acceptNearby: form.acceptNearby,
    })

    if ('error' in result) {
      setError(result.error)
      return
    }

    setSuccess(`预约成功！${selectedSpot.name} ${form.startTime}-${form.endTime}`)
    setStep(3)
    refresh()

    const myRes = getReservationsByDate(selectedDate).filter(
      r => r.employeeName === form.employeeName && r.status !== 'cancelled'
    )
    setMyReservations(myRes)
  }

  const handleCheckIn = (id: string) => {
    checkInReservation(id)
    refresh()
    const myRes = getReservationsByDate(selectedDate).filter(
      r => r.employeeName === form.employeeName && r.status !== 'cancelled'
    )
    setMyReservations(myRes)
  }

  const handleCancel = (id: string) => {
    cancelReservation(id)
    refresh()
    const myRes = getReservationsByDate(selectedDate).filter(
      r => r.employeeName === form.employeeName && r.status !== 'cancelled'
    )
    setMyReservations(myRes)
  }

  const TYPE_ICONS: Record<SeatType, React.ReactNode> = {
    lounge: <Armchair className="w-5 h-5" />,
    sofa: <Sofa className="w-5 h-5" />,
    quiet_corner: <Volume2 className="w-5 h-5" />,
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">预约午休</h2>
        <p className="text-slate-400 text-sm mt-1">选择座位和时段，轻松预约午休</p>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${step >= 1 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700/50 text-slate-500'}`}>
          <span className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs">1</span>
          选择座位
        </div>
        <div className="w-8 h-px bg-slate-600" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${step >= 2 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700/50 text-slate-500'}`}>
          <span className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs">2</span>
          填写信息
        </div>
        <div className="w-8 h-px bg-slate-600" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${step >= 3 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/50 text-slate-500'}`}>
          <span className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs">3</span>
          预约完成
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={e => { setSelectedDate(e.target.value); refresh() }}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.needQuiet}
            onChange={e => setForm(f => ({ ...f, needQuiet: e.target.checked }))}
            className="w-4 h-4 rounded accent-indigo-500"
          />
          <Volume2 className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">需要安静环境</span>
        </label>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSpots.map(spot => {
                const statusInfo = computeSpotStatus(spot.id, selectedDate, form.startTime, form.endTime)

                return (
                  <motion.div
                    key={spot.id}
                    whileHover={{ y: -2 }}
                    onClick={() => handleSelectSpot(spot)}
                    className="cursor-pointer rounded-2xl border border-slate-700/50 bg-[var(--bg-secondary)] p-5 hover:border-indigo-500/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-indigo-300">
                        {TYPE_ICONS[spot.seatType]}
                        <span className="font-semibold text-sm text-white">{spot.name}</span>
                      </div>
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {statusInfo.remainingCapacity > 0 ? `剩余${statusInfo.remainingCapacity}位` : '已满'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-xs text-slate-400">
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
                    </div>
                    <p className="text-xs text-slate-400">
                      {spot.area} · <Clock className="w-3 h-3 inline" /> {spot.availableFrom}-{spot.availableTo}
                    </p>
                  </motion.div>
                )
              })}
            </div>

            {filteredSpots.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                <CalendarPlus className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>{form.needQuiet ? '没有符合安静要求的空闲座位' : '当前没有空闲座位'}</p>
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && selectedSpot && (
          <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-2xl border border-slate-700/50 bg-[var(--bg-secondary)] p-6">
                <h3 className="text-lg font-semibold text-white mb-4">已选座位</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">名称</span>
                    <span className="text-white">{selectedSpot.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">区域</span>
                    <span className="text-white">{selectedSpot.area}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">类型</span>
                    <span className="text-white">{SEAT_TYPE_LABELS[selectedSpot.seatType]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">遮光</span>
                    <span className="text-white">{selectedSpot.hasLightBlocking ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">靠空调</span>
                    <span className="text-white">{selectedSpot.nearAC ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">可预约时段</span>
                    <span className="text-white">{selectedSpot.availableFrom} - {selectedSpot.availableTo}</span>
                  </div>
                  {selectedSpot.rules && (
                    <div className="pt-2 border-t border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-1">使用规则</p>
                      <p className="text-sm text-amber-300">{selectedSpot.rules}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700/50 bg-[var(--bg-secondary)] p-6">
                <h3 className="text-lg font-semibold text-white mb-4">预约信息</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">姓名 *</label>
                    <input
                      type="text"
                      required
                      value={form.employeeName}
                      onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))}
                      placeholder="输入你的姓名"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">工号</label>
                    <input
                      type="text"
                      value={form.employeeId}
                      onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                      placeholder="输入工号（可选）"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">开始时间</label>
                      <select
                        value={form.startTime}
                        onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        {TIME_SLOTS.filter(t => t.value >= selectedSpot.availableFrom && t.value < selectedSpot.availableTo).map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">结束时间</label>
                      <select
                        value={form.endTime}
                        onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        {TIME_SLOTS.filter(t => t.value > selectedSpot.availableFrom && t.value <= selectedSpot.availableTo).map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.acceptNearby}
                      onChange={e => setForm(f => ({ ...f, acceptNearby: e.target.checked }))}
                      className="w-4 h-4 rounded accent-indigo-500"
                    />
                    <span className="text-sm text-slate-300">接受临近同事共用区域</span>
                  </label>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setStep(1); setError(null) }}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700 text-sm text-slate-300 hover:bg-slate-600 transition"
                    >
                      返回选座
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500 text-sm text-white hover:bg-indigo-600 transition"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      确认预约
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="max-w-lg mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">预约成功！</h3>
              {success && <p className="text-slate-400 mb-6">{success}</p>}

              <button
                onClick={() => { setStep(1); setSelectedSpot(null); setForm({ ...form, employeeName: '', employeeId: '' }); setSuccess(null) }}
                className="px-6 py-2.5 rounded-lg bg-indigo-500 text-sm text-white hover:bg-indigo-600 transition"
              >
                继续预约
              </button>
            </div>

            {myReservations.length > 0 && (
              <div className="mt-10">
                <h4 className="text-lg font-semibold text-white mb-4">我的预约</h4>
                <div className="space-y-3">
                  {myReservations.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-slate-700/50">
                      <div>
                        <p className="font-medium text-slate-200">{spots.find(s => s.id === r.spotId)?.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {r.startTime}-{r.endTime}
                          {r.needQuiet ? ' · 需要安静' : ''}
                          {r.acceptNearby ? ' · 接受临近' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          r.status === 'confirmed' ? 'bg-amber-500/10 text-amber-300' :
                          r.status === 'checked_in' ? 'bg-emerald-500/10 text-emerald-300' :
                          r.status === 'completed' ? 'bg-slate-500/10 text-slate-400' :
                          r.status === 'no_show' ? 'bg-red-500/10 text-red-300' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {r.status === 'confirmed' ? '已确认' :
                           r.status === 'checked_in' ? '已签到' :
                           r.status === 'completed' ? '已完成' :
                           r.status === 'no_show' ? '爽约' : '已取消'}
                        </span>
                        {r.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleCheckIn(r.id)}
                              className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs hover:bg-emerald-500/30 transition"
                            >
                              签到
                            </button>
                            <button
                              onClick={() => handleCancel(r.id)}
                              className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs hover:bg-red-500/30 transition"
                            >
                              取消
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
