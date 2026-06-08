import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Palette, Search } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { colorDistance, hexToHsl, hslToHex } from '@/utils/color'
import { formatPrice } from '@/utils/helpers'

export default function ColorSearch() {
  const materials = useStore((s) => s.materials)
  const [targetColor, setTargetColor] = useState('#3498DB')
  const [threshold, setThreshold] = useState(0.4)
  const [hue, setHue] = useState(207)

  const handleHueChange = (newHue: number) => {
    setHue(newHue)
    const hsl = hexToHsl(targetColor)
    setTargetColor(hslToHex(newHue, hsl.s, hsl.l))
  }

  const handleSatLightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const s = x * 100
    const l = (1 - y) * 100
    const hsl = hexToHsl(targetColor)
    setTargetColor(hslToHex(hsl.h, s, l))
  }

  const similarMaterials = useMemo(() => {
    return materials
      .map((m) => ({
        ...m,
        distance: colorDistance(targetColor, m.colorHex),
      }))
      .filter((m) => m.distance <= threshold)
      .sort((a, b) => a.distance - b.distance)
  }, [materials, targetColor, threshold])

  const allColors = useMemo(() => {
    return [...new Set(materials.map((m) => m.colorHex))]
  }, [materials])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Palette className="w-6 h-6 text-caramel" />
        <h2 className="font-serif text-2xl font-bold text-bark">近似颜色搜索</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card space-y-4">
            <h3 className="section-title">目标颜色</h3>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-2xl shadow-craft border-2 border-white"
                style={{ backgroundColor: targetColor }}
              />
              <div className="flex-1">
                <input
                  type="color"
                  value={targetColor}
                  onChange={(e) => setTargetColor(e.target.value)}
                  className="w-full h-10 rounded-xl cursor-pointer border-2 border-sand-light"
                />
                <input
                  type="text"
                  value={targetColor}
                  onChange={(e) => setTargetColor(e.target.value)}
                  className="input-field mt-2 text-center text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">
                色相 <span className="text-sand">{hue}°</span>
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => handleHueChange(Number(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">
                饱和度/明度选择
              </label>
              <div
                className="w-full h-32 rounded-xl cursor-pointer relative overflow-hidden border-2 border-sand-light"
                onClick={handleSatLightClick}
                style={{
                  background: `linear-gradient(to bottom, white, ${hslToHex(hue, 100, 50)}, black)`,
                }}
              >
                <div
                  className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${hexToHsl(targetColor).s}%`,
                    top: `${100 - hexToHsl(targetColor).l}%`,
                    backgroundColor: targetColor,
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">
                相似度容差 <span className="text-sand">{(threshold * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-caramel"
              />
              <div className="flex justify-between text-xs text-sand">
                <span>精确</span>
                <span>宽泛</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">库存颜色一览</h3>
            {allColors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allColors.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => setTargetColor(hex)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all duration-150 hover:scale-110 ${
                      targetColor === hex ? 'border-caramel scale-110' : 'border-sand-light'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-sand text-center py-4">暂无材料颜色数据</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">搜索结果</h3>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-sand" />
                <span className="text-sm text-sand">{similarMaterials.length} 种匹配</span>
              </div>
            </div>
            {similarMaterials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {similarMaterials.map((m) => (
                  <Link
                    key={m.id}
                    to={`/material/${m.id}`}
                    className="bg-parchment rounded-xl p-4 transition-all duration-200 hover:shadow-craft-hover hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl shadow-sm border border-white/50"
                        style={{ backgroundColor: m.colorHex }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-bark text-sm truncate">{m.name}</h4>
                        <p className="text-xs text-sand">{m.category} · {m.colorName}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-caramel font-medium">
                          相似度 {((1 - m.distance) * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-sand">{m.quantity} {m.unit}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-1">
                      <div
                        className="h-2 flex-1 rounded-full"
                        style={{ backgroundColor: targetColor, opacity: 0.5 }}
                      />
                      <div
                        className="h-2 flex-1 rounded-full"
                        style={{ backgroundColor: m.colorHex }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-sand">目标色</span>
                      <span className="text-xs text-sand">{m.colorHex}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Palette className="w-12 h-12 text-sand mx-auto mb-3" />
                <p className="text-sand">没有找到相近颜色的材料</p>
                <p className="text-xs text-sand mt-1">试试调大容差滑块</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
