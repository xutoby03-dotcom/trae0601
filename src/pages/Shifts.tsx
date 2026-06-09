import { useState } from 'react'
import { CalendarDays, Plus, Clock, Zap, Bus, UtensilsCrossed, AlertTriangle, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Shift, ShiftStatus } from '@/types'
import { formatTime, formatDuration, calcShiftEarning, formatMoney, toLocalDateTimeInput, fromLocalDateTimeInput, getWeekday } from '@/utils/helpers'
import Drawer from '@/components/Drawer'

const now = Date.now()
const defaultForm = {
  jobId: '',
  startTime: toLocalDateTimeInput(now),
  endTime: toLocalDateTimeInput(now + 28800000),
  isOvertime: false,
  transportFee: 0,
  mealAllowance: 0,
  lateDeduction: 0,
  commuteMinutes: 0,
}

function ShiftCard({ shift, job, onToggle, onDelete }: { shift: Shift; job: { name: string; color: string; hourlyRate: number } | undefined; onToggle: () => void; onDelete: () => void }) {
  const isSettled = shift.status === 'settled'
  const earning = job ? calcShiftEarning({ ...shift, hourlyRate: job.hourlyRate }) : 0

  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 active:scale-[0.98] transition-transform cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: job?.color ?? '#F97316' }} />
          <span className="font-semibold text-stone-900 text-sm">{job?.name ?? '未知职位'}</span>
          {shift.isOvertime && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
              <Zap size={10} />加班
            </span>
          )}
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isSettled ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {isSettled ? '已结算' : '待结算'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-2">
        <Clock size={12} />
        <span>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
        <span className="text-stone-300">|</span>
        <span>{formatDuration(shift.startTime, shift.endTime)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-stone-400">
          {shift.transportFee > 0 && (
            <span className="flex items-center gap-0.5"><Bus size={10} />{formatMoney(shift.transportFee)}</span>
          )}
          {shift.mealAllowance > 0 && (
            <span className="flex items-center gap-0.5"><UtensilsCrossed size={10} />{formatMoney(shift.mealAllowance)}</span>
          )}
          {shift.lateDeduction > 0 && (
            <span className="flex items-center gap-0.5 text-red-400"><AlertTriangle size={10} />-{formatMoney(shift.lateDeduction)}</span>
          )}
        </div>
        <span className="text-sm font-bold text-orange-500">{formatMoney(earning)}</span>
      </div>

      <div className="flex justify-end mt-2">
        <button
          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function Shifts() {
  const { shifts, jobs, addShift, deleteShift, markShiftSettled, markShiftPending } = useStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)

  const jobMap = new Map(jobs.map((j) => [j.id, j]))

  const sorted = [...shifts].sort((a, b) => b.startTime - a.startTime)

  const grouped = sorted.reduce<Record<string, Shift[]>>((acc, s) => {
    const d = new Date(s.startTime)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a))

  const toggleStatus = (id: string, status: ShiftStatus) => {
    if (status === 'pending') markShiftSettled(id)
    else markShiftPending(id)
  }

  const handleAdd = () => {
    if (!form.jobId) return
    addShift({
      jobId: form.jobId,
      startTime: fromLocalDateTimeInput(form.startTime),
      endTime: fromLocalDateTimeInput(form.endTime),
      isOvertime: form.isOvertime,
      transportFee: form.transportFee,
      mealAllowance: form.mealAllowance,
      lateDeduction: form.lateDeduction,
      commuteMinutes: form.commuteMinutes,
      status: 'pending',
    })
    setForm(defaultForm)
    setDrawerOpen(false)
  }

  const update = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-6">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={22} className="text-orange-500" />
            <h1 className="text-xl font-bold text-stone-900">排班记录</h1>
          </div>
          <button
            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors"
            onClick={() => setDrawerOpen(true)}
          >
            <Plus size={16} />添加
          </button>
        </div>
      </div>

      {sortedGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-32 text-stone-300">
          <CalendarDays size={56} strokeWidth={1} />
          <p className="mt-4 text-sm font-medium">暂无排班记录</p>
          <p className="text-xs mt-1">点击右上角添加第一条记录</p>
        </div>
      ) : (
        <div className="px-5 pt-4">
          {sortedGroups.map(([dateKey, group]) => {
            const [y, m, d] = dateKey.split('-').map(Number)
            const ts = new Date(y, m, d).getTime()
            const label = `${m + 1}月${d}日`
            const weekday = getWeekday(ts)
            return (
              <div key={dateKey} className="flex gap-3 mb-4">
                <div className="flex flex-col items-center w-12 flex-shrink-0 pt-1">
                  <span className="text-xs font-bold text-stone-900">{label}</span>
                  <span className="text-[10px] text-stone-400">{weekday}</span>
                  <div className="flex-1 w-px bg-stone-200 mt-2" />
                </div>
                <div className="flex-1 flex flex-col gap-3 pb-2">
                  {group.map((s) => (
                    <ShiftCard
                      key={s.id}
                      shift={s}
                      job={jobMap.get(s.jobId) ? { name: jobMap.get(s.jobId)!.name, color: jobMap.get(s.jobId)!.color, hourlyRate: jobMap.get(s.jobId)!.hourlyRate } : undefined}
                      onToggle={() => toggleStatus(s.id, s.status)}
                      onDelete={() => deleteShift(s.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="添加排班">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-stone-500 mb-1 block">职位</label>
            <select
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              value={form.jobId}
              onChange={(e) => update('jobId', e.target.value)}
            >
              <option value="">请选择职位</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">开始时间</label>
              <input
                type="datetime-local"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={form.startTime}
                onChange={(e) => update('startTime', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">结束时间</label>
              <input
                type="datetime-local"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={form.endTime}
                onChange={(e) => update('endTime', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-500">是否加班</label>
            <button
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isOvertime ? 'bg-orange-500' : 'bg-stone-200'}`}
              onClick={() => update('isOvertime', !form.isOvertime)}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isOvertime ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">交通费 (¥)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={form.transportFee}
                onChange={(e) => update('transportFee', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">餐补 (¥)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={form.mealAllowance}
                onChange={(e) => update('mealAllowance', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">迟到扣款 (¥)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={form.lateDeduction}
                onChange={(e) => update('lateDeduction', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">通勤时长 (分)</label>
              <input
                type="number"
                min="0"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={form.commuteMinutes}
                onChange={(e) => update('commuteMinutes', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <button
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            disabled={!form.jobId}
            onClick={handleAdd}
          >
            确认添加
          </button>
        </div>
      </Drawer>
    </div>
  )
}
