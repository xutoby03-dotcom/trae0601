import { useState } from 'react'
import { format, parseISO, isToday } from 'date-fns'
import { ClipboardList, Battery, Clock, AlertTriangle, Trash2, Plus } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { SIDE_LABELS } from '@/types'
import type { DailyRecord } from '@/types'

export default function Daily() {
  const { hearingAids, dailyRecords, addDailyRecord, deleteDailyRecord } = useStore()
  const [aidId, setAidId] = useState(hearingAids[0]?.id ?? '')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [wearingHours, setWearingHours] = useState(0)
  const [batteryLevel, setBatteryLevel] = useState(100)
  const [isCharging, setIsCharging] = useState(false)
  const [hasWhistling, setHasWhistling] = useState(false)
  const [hasHearingIssue, setHasHearingIssue] = useState(false)
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (!aidId) return
    const record: DailyRecord = {
      id: crypto.randomUUID(),
      aidId,
      date,
      wearingHours,
      batteryLevel,
      isCharging,
      hasWhistling,
      hasHearingIssue,
      notes,
    }
    addDailyRecord(record)
    setWearingHours(0)
    setBatteryLevel(100)
    setIsCharging(false)
    setHasWhistling(false)
    setHasHearingIssue(false)
    setNotes('')
  }

  const getAidLabel = (id: string) => {
    const aid = hearingAids.find((a) => a.id === id)
    if (!aid) return ''
    return `${SIDE_LABELS[aid.side]} · ${aid.model}`
  }

  const grouped = dailyRecords.reduce<Record<string, DailyRecord[]>>((acc, r) => {
    ;(acc[r.date] ??= []).push(r)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const batteryColor = (v: number) =>
    v > 60 ? '#4ade80' : v > 20 ? '#E8913A' : '#ef4444'

  return (
    <div className="min-h-screen bg-[#FDF8F3] pb-8">
      <div className="bg-[#2D3A4A] px-5 pt-12 pb-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <ClipboardList size={28} />
          <h1 className="text-2xl font-bold">每日记录</h1>
        </div>
        <p className="text-amber-200 text-lg mt-1">{format(new Date(), 'yyyy年MM月dd日')}</p>
      </div>

      <div className="px-5 mt-5">
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
          <h2 className="text-lg font-bold text-[#2D3A4A] flex items-center gap-2">
            <Plus size={20} className="text-[#E8913A]" />
            新增记录
          </h2>

          <div>
            <label className="block text-base font-semibold text-[#2D3A4A] mb-2">助听器</label>
            <select
              value={aidId}
              onChange={(e) => setAidId(e.target.value)}
              className="w-full h-14 rounded-xl border-2 border-gray-200 px-4 text-lg bg-white focus:border-[#E8913A] focus:outline-none"
            >
              {hearingAids.map((a) => (
                <option key={a.id} value={a.id}>
                  {SIDE_LABELS[a.side]} · {a.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-[#2D3A4A] mb-2">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-14 rounded-xl border-2 border-gray-200 px-4 text-lg focus:border-[#E8913A] focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-base font-semibold text-[#2D3A4A] mb-2">
              <Clock size={18} className="text-[#E8913A]" /> 佩戴时长（小时）
            </label>
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={wearingHours}
              onChange={(e) => setWearingHours(Number(e.target.value))}
              className="w-full h-14 rounded-xl border-2 border-gray-200 px-4 text-lg focus:border-[#E8913A] focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-base font-semibold text-[#2D3A4A] mb-2">
              <Battery size={18} className="text-[#E8913A]" /> 电量
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                value={batteryLevel}
                onChange={(e) => setBatteryLevel(Number(e.target.value))}
                className="flex-1 h-3 appearance-none rounded-full bg-gray-200 accent-[#E8913A] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E8913A]"
              />
              <span className="text-3xl font-bold min-w-[4ch] text-right" style={{ color: batteryColor(batteryLevel) }}>
                {batteryLevel}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-[#2D3A4A]">正在充电</span>
            <button
              type="button"
              onClick={() => setIsCharging(!isCharging)}
              className={`relative w-16 h-9 rounded-full transition-colors ${isCharging ? 'bg-[#E8913A]' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-transform ${isCharging ? 'left-8' : 'left-1'}`}
              />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setHasWhistling(!hasWhistling)}
              className={`flex items-center gap-2 rounded-xl border-2 p-4 text-lg font-semibold transition-colors ${
                hasWhistling ? 'border-[#E8913A] bg-amber-50 text-[#E8913A]' : 'border-gray-200 text-[#2D3A4A]'
              }`}
            >
              <AlertTriangle size={20} /> 啸叫
            </button>
            <button
              type="button"
              onClick={() => setHasHearingIssue(!hasHearingIssue)}
              className={`flex items-center gap-2 rounded-xl border-2 p-4 text-lg font-semibold transition-colors ${
                hasHearingIssue ? 'border-[#E8913A] bg-amber-50 text-[#E8913A]' : 'border-gray-200 text-[#2D3A4A]'
              }`}
            >
              <AlertTriangle size={20} /> 听力异常
            </button>
          </div>

          <div>
            <label className="block text-base font-semibold text-[#2D3A4A] mb-2">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg focus:border-[#E8913A] focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!aidId}
            className="w-full h-14 rounded-xl bg-[#E8913A] text-white text-xl font-bold disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            提交记录
          </button>
        </div>
      </div>

      <div className="px-5 mt-8">
        <h2 className="text-lg font-bold text-[#2D3A4A] mb-4">历史记录</h2>

        {sortedDates.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ClipboardList size={48} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg">暂无记录</p>
          </div>
        )}

        {sortedDates.map((d) => (
          <div key={d} className="mb-5">
            <h3 className="text-base font-semibold text-[#2D3A4A] mb-2">
              {isToday(parseISO(d)) ? '今天' : format(parseISO(d), 'MM月dd日')}
            </h3>
            <div className="space-y-3">
              {grouped[d]
                .sort((a, b) => b.id.localeCompare(a.id))
                .map((r) => (
                  <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-[#2D3A4A]">{getAidLabel(r.aidId)}</span>
                      <button onClick={() => deleteDailyRecord(r.id)} className="text-gray-300 active:text-red-400">
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-base text-[#2D3A4A]">
                      <span className="flex items-center gap-1">
                        <Clock size={16} className="text-[#E8913A]" /> {r.wearingHours}h
                      </span>
                      <div className="flex items-center gap-2 flex-1">
                        <Battery size={16} className="text-[#E8913A]" />
                        <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${r.batteryLevel}%`, backgroundColor: batteryColor(r.batteryLevel) }} />
                        </div>
                        <span className="min-w-[3ch] text-right">{r.batteryLevel}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {r.isCharging && (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">充电中</span>
                      )}
                      {r.hasWhistling && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">啸叫</span>
                      )}
                      {r.hasHearingIssue && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-sm font-semibold">听力异常</span>
                      )}
                    </div>
                    {r.notes && <p className="mt-2 text-sm text-gray-500">{r.notes}</p>}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
