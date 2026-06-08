import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGearStore } from '@/store/gearStore'
import { useUsageStore } from '@/store/usageStore'
import { GEAR_TYPE_LABELS, GEAR_TYPE_ICONS, USAGE_UNIT_LABELS } from '@/types'

export default function RecordUsage() {
  const navigate = useNavigate()
  const gears = useGearStore((s) => s.gears)
  const addRecord = useUsageStore((s) => s.addRecord)
  const [selectedGearId, setSelectedGearId] = useState('')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [count, setCount] = useState('')
  const [note, setNote] = useState('')

  const selectedGear = gears.find((g) => g.id === selectedGearId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGearId) return

    addRecord({
      id: crypto.randomUUID(),
      gearId: selectedGearId,
      date: new Date().toISOString().split('T')[0],
      duration: parseFloat(duration) || 0,
      distance: parseFloat(distance) || 0,
      count: parseInt(count) || 0,
      note,
    })
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 font-['Playfair_Display'] text-2xl font-bold text-[#F5F0EB]">
        记录使用
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
            选择装备
          </h2>
          {gears.length === 0 ? (
            <div className="py-6 text-center text-sm text-white/30">
              还没有装备，请先添加
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {gears.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGearId(g.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-all duration-200 ${
                    selectedGearId === g.id
                      ? 'border-[#FF6B35]/40 bg-[#FF6B35]/10 text-[#FF6B35]'
                      : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/10'
                  }`}
                >
                  <span className="text-lg">{GEAR_TYPE_ICONS[g.type]}</span>
                  <span className="max-w-full truncate text-[11px] font-medium">
                    {g.name}
                  </span>
                  <span className="text-[9px] opacity-60">{GEAR_TYPE_LABELS[g.type]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedGear && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
              使用数据
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-white/50">
                  运动时长 (分钟)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                  min="0"
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-white/20 outline-none transition-colors focus:border-[#FF6B35]/40"
                />
              </div>
              {(selectedGear.maxUsageUnit === 'km' || selectedGear.type === 'bicycle' || selectedGear.type === 'running_shoe') && (
                <div>
                  <label className="mb-1.5 block text-xs text-white/50">
                    距离 ({USAGE_UNIT_LABELS.km})
                  </label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="5.0"
                    min="0"
                    step="0.1"
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-white/20 outline-none transition-colors focus:border-[#FF6B35]/40"
                  />
                </div>
              )}
              {selectedGear.maxUsageUnit === 'times' && (
                <div>
                  <label className="mb-1.5 block text-xs text-white/50">
                    使用次数
                  </label>
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    placeholder="1"
                    min="0"
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-white/20 outline-none transition-colors focus:border-[#FF6B35]/40"
                  />
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs text-white/50">
                  备注 (可选)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="今天跑了5公里，感觉不错"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-white/20 outline-none transition-colors focus:border-[#FF6B35]/40"
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedGearId}
          className="w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#FF6B35]/90 hover:shadow-lg hover:shadow-[#FF6B35]/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#FF6B35] disabled:hover:shadow-none"
        >
          记录使用
        </button>
      </form>
    </div>
  )
}
