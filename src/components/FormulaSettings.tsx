import { useStore } from '../store'
import { RenderSettings } from '../types'

const FONT_SIZES = [
  { label: '小', value: 1.0 },
  { label: '中', value: 1.4 },
  { label: '大', value: 1.8 },
  { label: '特大', value: 2.4 },
]

const FONT_COLORS = [
  '#1a1b2e', '#e8a838', '#4ecdc4', '#e74c3c', '#2ecc71', '#3498db',
  '#9b59b6', '#f39c12', '#1abc9c', '#e91e63', '#ffffff',
]

const BG_COLORS = [
  '#ffffff', '#f8f7f4', '#1a1b2e', '#0d1117', '#1e1e2e', '#fdf6e3',
  '#f0f9ff', '#fef2f2', '#f0fdf4', '#faf5ff', 'transparent',
]

export default function FormulaSettings() {
  const { renderSettings, setRenderSettings } = useStore()

  return (
    <div className="h-full flex flex-col p-3 gap-4 overflow-y-auto">
      <div className="text-sm font-medium text-[var(--text-secondary)]">渲染设置</div>

      <div>
        <label className="text-xs text-[var(--text-muted)] mb-2 block">公式大小</label>
        <div className="flex gap-1.5">
          {FONT_SIZES.map((fs) => (
            <button
              key={fs.value}
              onClick={() => setRenderSettings({ fontSize: fs.value } as Partial<RenderSettings>)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                renderSettings.fontSize === fs.value
                  ? 'bg-amber-400/90 text-ink-950 font-medium'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {fs.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-[var(--text-muted)] mb-2 block">字体颜色</label>
        <div className="flex flex-wrap gap-1.5">
          {FONT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setRenderSettings({ fontColor: color } as Partial<RenderSettings>)}
              className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                renderSettings.fontColor === color ? 'border-amber-400 scale-110' : 'border-[var(--border-color)]'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-[var(--text-muted)] mb-2 block">背景颜色</label>
        <div className="flex flex-wrap gap-1.5">
          {BG_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setRenderSettings({ bgColor: color } as Partial<RenderSettings>)}
              className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                renderSettings.bgColor === color ? 'border-amber-400 scale-110' : 'border-[var(--border-color)]'
              }`}
              style={{
                backgroundColor: color === 'transparent' ? 'var(--bg-primary)' : color,
                backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)' : undefined,
                backgroundSize: color === 'transparent' ? '8px 8px' : undefined,
                backgroundPosition: color === 'transparent' ? '0 0, 4px 4px' : undefined,
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-[var(--text-muted)] mb-2 block">自定义尺寸</label>
        <input
          type="range"
          min="0.6"
          max="4"
          step="0.1"
          value={renderSettings.fontSize}
          onChange={(e) => setRenderSettings({ fontSize: parseFloat(e.target.value) } as Partial<RenderSettings>)}
          className="w-full accent-amber-400"
        />
        <div className="text-xs text-[var(--text-muted)] text-center mt-1">
          {renderSettings.fontSize.toFixed(1)}em
        </div>
      </div>

      <div>
        <label className="text-xs text-[var(--text-muted)] mb-2 block">自定义颜色</label>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-muted)]">字</span>
            <input
              type="color"
              value={renderSettings.fontColor}
              onChange={(e) => setRenderSettings({ fontColor: e.target.value } as Partial<RenderSettings>)}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-muted)]">底</span>
            <input
              type="color"
              value={renderSettings.bgColor === 'transparent' ? '#ffffff' : renderSettings.bgColor}
              onChange={(e) => setRenderSettings({ bgColor: e.target.value } as Partial<RenderSettings>)}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
