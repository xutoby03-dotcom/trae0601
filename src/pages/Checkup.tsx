import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { calculateDegradation, getLevelLabel, getLevelColor } from '@/utils/degradation'

const resultBgMap: Record<string, string> = {
  emerald: 'bg-emerald-500/10 border-emerald-500/30',
  amber: 'bg-amber-500/10 border-amber-500/30',
  orange: 'bg-orange-500/10 border-orange-500/30',
  red: 'bg-red-500/10 border-red-500/30',
  rose: 'bg-rose-500/10 border-rose-500/30',
}

const resultTextMap: Record<string, string> = {
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  orange: 'text-orange-400',
  red: 'text-red-400',
  rose: 'text-rose-400',
}

const resultSubTextMap: Record<string, string> = {
  emerald: 'text-emerald-300',
  amber: 'text-amber-300',
  orange: 'text-orange-300',
  red: 'text-red-300',
  rose: 'text-rose-300',
}

export default function Checkup() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const { currentUser, vehicles, addCheckupRecord } = useStore()

  const userVehicles = vehicles.filter(
    (v) => currentUser && v.userId === currentUser.id
  )

  const [selectedId, setSelectedId] = useState(vehicleId || '')
  const [voltage, setVoltage] = useState('')
  const [fullChargeHours, setFullChargeHours] = useState('')
  const [actualRange, setActualRange] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [result, setResult] = useState<ReturnType<typeof calculateDegradation> | null>(null)

  const activeVehicle = vehicles.find((v) => v.id === (selectedId || vehicleId))

  if (!currentUser) {
    return (
      <div className="p-6 text-center text-zinc-400">
        请先登录后进行电池体检
      </div>
    )
  }

  if (userVehicles.length === 0) {
    return (
      <div className="p-6 text-center text-zinc-400">
        暂无车辆，请先添加车辆
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeVehicle) return

    const res = calculateDegradation({
      voltage: Number(voltage),
      fullChargeHours: Number(fullChargeHours),
      actualRange: Number(actualRange),
      nominalRange: activeVehicle.nominalRange,
      chargeHabit: activeVehicle.chargeHabit,
      heatAnomaly: activeVehicle.heatAnomaly,
    })

    addCheckupRecord({
      vehicleId: activeVehicle.id,
      date,
      voltage: Number(voltage),
      fullChargeHours: Number(fullChargeHours),
      actualRange: Number(actualRange),
      photos: [],
      degradationLevel: res.level,
      degradationScore: res.score,
      suggestion: res.suggestion,
    })

    setResult(res)
  }

  const color = result ? getLevelColor(result.level) : ''

  if (result && activeVehicle) {
    return (
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className={`rounded-2xl p-8 text-center border ${resultBgMap[color] || resultBgMap.emerald}`}>
          <div className={`text-8xl font-black ${resultTextMap[color] || resultTextMap.emerald} animate-bounce-in`}>
            {result.level}
          </div>
          <div className={`mt-2 text-xl font-semibold ${resultSubTextMap[color] || resultSubTextMap.emerald}`}>
            {getLevelLabel(result.level)}
          </div>
          <div className="mt-1 text-zinc-400 text-sm">
            综合评分：<span className="text-zinc-100 font-bold text-lg">{result.score}</span>
          </div>
          <div className="mt-4 text-zinc-300 text-sm leading-relaxed">
            {result.suggestion}
          </div>
          <div className="mt-2 text-zinc-500 text-xs">
            {activeVehicle.brand} · {date}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setResult(null)}
            className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
          >
            再次体检
          </button>
          <Link
            to={`/checkup/${activeVehicle.id}/history`}
            className="flex-1 py-3 rounded-xl bg-zinc-800 text-emerald-400 hover:bg-zinc-700 transition text-center"
          >
            查看历史
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-zinc-100">电池体检</h2>
        {activeVehicle && (
          <Link
            to={`/checkup/${activeVehicle.id}/history`}
            className="text-sm text-emerald-400 hover:underline"
          >
            查看体检历史
          </Link>
        )}
      </div>

      {(!vehicleId || !activeVehicle) && (
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">选择车辆</label>
          <div className="grid gap-2">
            {userVehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedId(v.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                  selectedId === v.id
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-zinc-100'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="font-medium">{v.brand}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{v.batteryModel}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeVehicle && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-sm text-zinc-400">当前车辆</div>
            <div className="text-zinc-100 font-medium">
              {activeVehicle.brand}
              <span className="text-zinc-500 ml-2 text-xs">{activeVehicle.batteryModel}</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-400">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">电压(V)</label>
            <input
              type="number"
              step="0.1"
              required
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              placeholder="48.0"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">充满耗时(小时)</label>
            <input
              type="number"
              step="0.5"
              required
              value={fullChargeHours}
              onChange={(e) => setFullChargeHours(e.target.value)}
              placeholder="4.0"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">实际骑行距离(km)</label>
            <input
              type="number"
              step="1"
              required
              value={actualRange}
              onChange={(e) => setActualRange(e.target.value)}
              placeholder="55"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
          >
            开始体检
          </button>
        </form>
      )}
    </div>
  )
}
