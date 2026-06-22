import { useGrindingStore, ROAST_LEVELS, EQUIPMENTS } from '@/store/grindingStore'
import { FlaskConical, Hash, Thermometer, Star } from 'lucide-react'

export default function RecordHistory() {
  const { records } = useGrindingStore()

  if (records.length === 0) return null

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-amber-200 mb-6 tracking-wide" style={{ fontFamily: '"Noto Serif SC", serif' }}>
        历史记录
      </h2>
      <div className="space-y-3">
        {records.map((r) => {
          const roast = ROAST_LEVELS.find((l) => l.value === r.roastLevel)
          const equip = EQUIPMENTS.find((e) => e.value === r.equipment)
          const avgScore = ((r.aromaIntensity + r.layering + r.persistence) / 3).toFixed(1)

          return (
            <div
              key={r.id}
              className="bg-[#1E1810] border border-amber-900/20 rounded-xl p-4 hover:border-amber-800/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-amber-300 text-sm font-bold"
                    style={{ backgroundColor: `${roast?.color}30` }}
                  >
                    {r.spiceName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-amber-200 font-bold text-sm">{r.spiceName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full text-amber-400/60"
                        style={{ backgroundColor: `${roast?.color}20` }}
                      >
                        {roast?.label}
                      </span>
                      <span className="text-[10px] text-amber-500/50">{equip?.label}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-sm font-bold">{avgScore}</span>
                  </div>
                  <span className="text-amber-600/30 text-[10px]">
                    {new Date(r.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-3 text-xs text-amber-500/50">
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" /> {r.meshSize}目
                </span>
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3" /> {r.shutdownTemp}℃
                </span>
                <span className="flex items-center gap-1">
                  <FlaskConical className="w-3 h-3" /> 占比 {r.recipeRatio}%
                </span>
              </div>

              {r.notes && (
                <p className="text-amber-500/40 text-xs mt-2 pl-0.5 leading-relaxed">
                  {r.notes}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
