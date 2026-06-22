import { useGrindingStore, ROAST_LEVELS, EQUIPMENTS } from '@/store/grindingStore'
import { Thermometer, Hash, Link2, X, Star, ClipboardList } from 'lucide-react'

export default function GrindingForm() {
  const {
    currentRecord,
    setSpiceName,
    setRoastLevel,
    setEquipment,
    setMeshSize,
    setShutdownTemp,
    reusedFrom,
    clearReusedFrom,
  } = useGrindingStore()

  const avgScore = reusedFrom
    ? ((reusedFrom.aromaIntensity + reusedFrom.layering + reusedFrom.persistence) / 3).toFixed(1)
    : null

  return (
    <section className="mb-10">
      <div className="flex items-start justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-amber-200 tracking-wide shrink-0" style={{ fontFamily: '"Noto Serif SC", serif' }}>
          研磨参数记录
        </h2>

        {reusedFrom && (
          <div className="relative flex-1 max-w-xl ml-auto animate-fade-in">
            <div className="bg-gradient-to-r from-amber-900/30 via-amber-800/20 to-amber-900/30 border border-amber-600/30 rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(184,134,11,0.1)]">
              <button
                onClick={clearReusedFrom}
                className="absolute top-2 right-2 text-amber-700/60 hover:text-amber-400 transition-colors p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-2 pr-5">
                <div className="shrink-0 mt-0.5">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-700/40 to-amber-600/30 border border-amber-500/30 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 tracking-wider">
                    #{reusedFrom.shortCode}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-amber-500/80 text-[11px] mb-1">
                    <Link2 className="w-3 h-3 shrink-0" />
                    <span>基于规范微调：</span>
                    <span className="text-amber-300 font-bold">{reusedFrom.spiceName}</span>
                    <span className="text-amber-700/50 font-mono text-[10px]">
                      {new Date(reusedFrom.createdAt).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).replace(/\//g, '-')}
                    </span>
                  </div>

                  {reusedFrom.specNotes && (
                    <div className="flex items-start gap-1 mb-2 bg-[#1A1410]/60 rounded-md px-2 py-1 border border-amber-900/30">
                      <ClipboardList className="w-3 h-3 text-amber-600/60 shrink-0 mt-0.5" />
                      <p className="text-amber-400/70 text-[11px] leading-snug line-clamp-2">
                        {reusedFrom.specNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-amber-900/20">
                <div className="flex items-center gap-1 bg-[#1A1410] rounded-md px-2 py-1 border border-amber-900/30">
                  <Hash className="w-3 h-3 text-amber-600/60" />
                  <span className="text-amber-500/60 text-[10px]">原目数</span>
                  <span className="text-amber-300 text-xs font-bold">{reusedFrom.meshSize}</span>
                </div>
                <div className="flex items-center gap-1 bg-[#1A1410] rounded-md px-2 py-1 border border-amber-900/30">
                  <Thermometer className="w-3 h-3 text-amber-600/60" />
                  <span className="text-amber-500/60 text-[10px]">原温度</span>
                  <span className="text-amber-300 text-xs font-bold">{reusedFrom.shutdownTemp}℃</span>
                </div>
                <div className="flex items-center gap-1 bg-[#1A1410] rounded-md px-2 py-1 border border-amber-900/30">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-amber-500/60 text-[10px]">评分</span>
                  <span className="text-amber-300 text-xs font-bold">{avgScore}</span>
                </div>
                <div className="flex items-center gap-1 bg-[#1A1410] rounded-md px-2 py-1 border border-amber-900/30">
                  <span className="text-amber-500/60 text-[10px]">香/层/持</span>
                  <span className="text-amber-400 text-[11px] font-mono font-bold">
                    {reusedFrom.aromaIntensity}/{reusedFrom.layering}/{reusedFrom.persistence}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#1A1410] rounded-md px-2 py-1 border border-amber-900/30">
                  <span className="text-amber-500/60 text-[10px]">占比</span>
                  <span className="text-amber-300 text-xs font-bold">{reusedFrom.recipeRatio}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#231C14] rounded-2xl border border-amber-900/30 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-amber-400/80 text-sm mb-2 font-medium">香料名称</label>
            <input
              type="text"
              value={currentRecord.spiceName}
              onChange={(e) => setSpiceName(e.target.value)}
              placeholder="如：姜黄、孜然、香菜籽…"
              className="w-full bg-[#1A1410] border border-amber-900/40 rounded-lg px-4 py-3 text-amber-100 placeholder:text-amber-700/40 focus:outline-none focus:border-amber-600/60 focus:ring-1 focus:ring-amber-600/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-amber-400/80 text-sm mb-2 font-medium">烘烤程度</label>
            <div className="flex items-center gap-2 mt-1">
              {ROAST_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setRoastLevel(level.value)}
                  className={`group relative flex flex-col items-center gap-1 transition-all`}
                >
                  <span
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      currentRecord.roastLevel === level.value
                        ? 'border-amber-400 shadow-[0_0_12px_rgba(184,134,11,0.5)] scale-110'
                        : 'border-amber-900/40 hover:border-amber-600/50'
                    }`}
                    style={{ backgroundColor: level.color }}
                  />
                  <span className={`text-xs transition-all ${
                    currentRecord.roastLevel === level.value ? 'text-amber-300 font-bold' : 'text-amber-600/60'
                  }`}>
                    {level.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-amber-400/80 text-sm mb-2 font-medium">研磨设备</label>
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENTS.map((eq) => (
                <button
                  key={eq.value}
                  onClick={() => setEquipment(eq.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    currentRecord.equipment === eq.value
                      ? 'bg-amber-700/40 text-amber-200 border border-amber-600/50 shadow-[0_0_8px_rgba(184,134,11,0.3)]'
                      : 'bg-[#1A1410] text-amber-600/60 border border-amber-900/30 hover:border-amber-700/40 hover:text-amber-400'
                  }`}
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-amber-400/80 text-sm mb-2 font-medium">
              <Hash className="inline w-4 h-4 mr-1 -mt-0.5" />
              筛网目数
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={20}
                max={200}
                value={currentRecord.meshSize}
                onChange={(e) => setMeshSize(Number(e.target.value))}
                className="flex-1 accent-amber-600 h-2 bg-amber-900/30 rounded-full cursor-pointer"
              />
              <div className="flex items-center bg-[#1A1410] border border-amber-900/40 rounded-lg px-3 py-2 min-w-[80px]">
                <input
                  type="number"
                  min={20}
                  max={200}
                  value={currentRecord.meshSize}
                  onChange={(e) => setMeshSize(Math.min(200, Math.max(20, Number(e.target.value))))}
                  className="w-full bg-transparent text-amber-200 text-center text-sm focus:outline-none"
                />
                <span className="text-amber-600/60 text-xs ml-1">目</span>
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-amber-700/40 mt-1 px-1">
              <span>20 粗</span>
              <span>80 中</span>
              <span>200 极细</span>
            </div>
          </div>

          <div>
            <label className="block text-amber-400/80 text-sm mb-2 font-medium">
              <Thermometer className="inline w-4 h-4 mr-1 -mt-0.5" />
              停机温度
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={20}
                max={120}
                value={currentRecord.shutdownTemp}
                onChange={(e) => setShutdownTemp(Number(e.target.value))}
                className="flex-1 accent-red-700 h-2 bg-amber-900/30 rounded-full cursor-pointer"
              />
              <div className="flex items-center bg-[#1A1410] border border-amber-900/40 rounded-lg px-3 py-2 min-w-[80px]">
                <input
                  type="number"
                  min={20}
                  max={120}
                  value={currentRecord.shutdownTemp}
                  onChange={(e) => setShutdownTemp(Math.min(120, Math.max(20, Number(e.target.value))))}
                  className="w-full bg-transparent text-amber-200 text-center text-sm focus:outline-none"
                />
                <span className="text-amber-600/60 text-xs ml-1">℃</span>
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-amber-700/40 mt-1 px-1">
              <span>20℃ 常温</span>
              <span>70℃ 温热</span>
              <span>120℃ 高温</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
