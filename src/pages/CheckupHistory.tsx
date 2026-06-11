import { useParams, Link } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { getLevelLabel, getLevelColor } from '@/utils/degradation'

const borderMap: Record<string, string> = {
  emerald: 'border-l-emerald-500',
  amber: 'border-l-amber-500',
  orange: 'border-l-orange-500',
  red: 'border-l-red-500',
  rose: 'border-l-rose-500',
}

const badgeMap: Record<string, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-500/20 text-amber-400',
  orange: 'bg-orange-500/20 text-orange-400',
  red: 'bg-red-500/20 text-red-400',
  rose: 'bg-rose-500/20 text-rose-400',
}

const scoreMap: Record<string, string> = {
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  orange: 'text-orange-400',
  red: 'text-red-400',
  rose: 'text-rose-400',
}

export default function CheckupHistory() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const { vehicles, getVehicleCheckups } = useStore()

  const vehicle = vehicles.find((v) => v.id === vehicleId)
  const checkups = vehicleId ? getVehicleCheckups(vehicleId) : []

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        未找到车辆信息
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{vehicle.brand}</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{vehicle.batteryModel}</p>
        </div>
        <Link
          to={`/checkup/${vehicleId}`}
          className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition"
        >
          新建体检
        </Link>
      </div>

      {checkups.length === 0 ? (
        <p className="text-zinc-500 text-center mt-16">暂无体检记录</p>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-zinc-700" />

          {checkups.map((record) => {
            const color = getLevelColor(record.degradationLevel)
            return (
              <div key={record.id} className="relative mb-6 last:mb-0">
                <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-zinc-950 border-2 border-zinc-600 z-10" />

                <div className="absolute -left-4 top-3.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 whitespace-nowrap">
                    {record.date}
                  </span>
                </div>

                <div className={`mt-8 rounded-lg bg-zinc-900 p-4 border-l-4 ${borderMap[color] || borderMap.emerald}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeMap[color] || badgeMap.emerald}`}>
                      {record.degradationLevel} · {getLevelLabel(record.degradationLevel)}
                    </span>
                    <span className={`text-lg font-bold ${scoreMap[color] || scoreMap.emerald}`}>
                      {record.degradationScore}
                      <span className="text-xs text-zinc-500 ml-0.5">分</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                    <div>
                      <p className="text-[10px] text-zinc-500">电压</p>
                      <p className="text-sm text-zinc-200 font-medium">{record.voltage}V</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500">充满时长</p>
                      <p className="text-sm text-zinc-200 font-medium">{record.fullChargeHours}h</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500">实际续航</p>
                      <p className="text-sm text-zinc-200 font-medium">{record.actualRange}km</p>
                    </div>
                  </div>

                  {record.photos && record.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-1.5 mb-3">
                      {record.photos.map((photo, i) => (
                        <a
                          key={i}
                          href={photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square rounded-md overflow-hidden border border-zinc-700 hover:border-emerald-500/50 transition-colors"
                        >
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-zinc-400 leading-relaxed">{record.suggestion}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
