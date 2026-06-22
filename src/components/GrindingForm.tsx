import { useGrindingStore, ROAST_LEVELS, EQUIPMENTS } from '@/store/grindingStore'
import { Thermometer, Hash } from 'lucide-react'

export default function GrindingForm() {
  const {
    currentRecord,
    setSpiceName,
    setRoastLevel,
    setEquipment,
    setMeshSize,
    setShutdownTemp,
  } = useGrindingStore()

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-amber-200 mb-6 tracking-wide" style={{ fontFamily: '"Noto Serif SC", serif' }}>
        研磨参数记录
      </h2>

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
