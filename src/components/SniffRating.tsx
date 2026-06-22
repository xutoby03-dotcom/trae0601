import { useGrindingStore } from '@/store/grindingStore'
import RadarChart from './RadarChart'
import { Save, RotateCcw } from 'lucide-react'

export default function SniffRating() {
  const {
    currentRecord,
    setAromaIntensity,
    setLayering,
    setPersistence,
    setRecipeRatio,
    setNotes,
    saveRecord,
    resetCurrent,
  } = useGrindingStore()

  const ratings = [
    { key: 'aromaIntensity' as const, label: '香气强度', value: currentRecord.aromaIntensity, setter: setAromaIntensity },
    { key: 'layering' as const, label: '层次感', value: currentRecord.layering, setter: setLayering },
    { key: 'persistence' as const, label: '持久度', value: currentRecord.persistence, setter: setPersistence },
  ]

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-amber-200 mb-6 tracking-wide" style={{ fontFamily: '"Noto Serif SC", serif' }}>
        试闻评分与配方备注
      </h2>

      <div className="bg-[#231C14] rounded-2xl border border-amber-900/30 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <RadarChart
              aroma={currentRecord.aromaIntensity}
              layering={currentRecord.layering}
              persistence={currentRecord.persistence}
              size={260}
            />
            <div className="w-full mt-6 space-y-4">
              {ratings.map((r) => (
                <div key={r.key} className="flex items-center gap-4">
                  <span className="text-amber-400/70 text-sm w-20 text-right">{r.label}</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={r.value}
                    onChange={(e) => r.setter(Number(e.target.value))}
                    className="flex-1 accent-amber-600 h-2 bg-amber-900/30 rounded-full cursor-pointer"
                  />
                  <span className="text-amber-200 text-sm font-mono w-8 text-center">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-amber-400/80 text-sm mb-2 font-medium">配方占比</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={currentRecord.recipeRatio}
                  onChange={(e) => setRecipeRatio(Number(e.target.value))}
                  className="flex-1 accent-amber-600 h-2 bg-amber-900/30 rounded-full cursor-pointer"
                />
                <div className="flex items-center bg-[#1A1410] border border-amber-900/40 rounded-lg px-3 py-2 min-w-[72px]">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={currentRecord.recipeRatio}
                    onChange={(e) => setRecipeRatio(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full bg-transparent text-amber-200 text-center text-sm focus:outline-none"
                  />
                  <span className="text-amber-600/60 text-xs ml-0.5">%</span>
                </div>
              </div>
              <div className="mt-2 h-3 bg-[#1A1410] rounded-full overflow-hidden border border-amber-900/20">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${currentRecord.recipeRatio}%`,
                    background: 'linear-gradient(90deg, #8B4513, #E8912D)',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-amber-400/80 text-sm mb-2 font-medium">备注</label>
              <textarea
                value={currentRecord.notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="记录研磨手感、香气特征、调配建议…"
                rows={4}
                className="w-full bg-[#1A1410] border border-amber-900/40 rounded-lg px-4 py-3 text-amber-100 placeholder:text-amber-700/30 focus:outline-none focus:border-amber-600/60 focus:ring-1 focus:ring-amber-600/30 transition-all resize-none text-sm"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={saveRecord}
                disabled={!currentRecord.spiceName.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 text-amber-100 font-bold text-sm hover:from-amber-600 hover:to-amber-500 transition-all shadow-[0_4px_16px_rgba(184,134,11,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-amber-700 disabled:hover:to-amber-600"
              >
                <Save className="w-4 h-4" />
                保存记录
              </button>
              <button
                onClick={resetCurrent}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1A1410] border border-amber-900/40 text-amber-500/70 text-sm hover:border-amber-700/50 hover:text-amber-400 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
