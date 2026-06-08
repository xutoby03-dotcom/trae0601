import { useGardenStore } from '@/store/useGardenStore'
import { BALCONY_ROWS, BALCONY_COLS, ROW_LABELS, COL_LABELS, VARIETY_PRESETS } from '@/types'
import { cn } from '@/lib/utils'

interface PositionPickerProps {
  selectedRow: number
  selectedCol: number
  onChange: (row: number, col: number) => void
}

const VARIETY_EMOJI_MAP: Record<string, string> = Object.fromEntries(
  VARIETY_PRESETS.map((v) => [v.name, v.emoji])
)

export default function PositionPicker({ selectedRow, selectedCol, onChange }: PositionPickerProps) {
  const plants = useGardenStore((s) => s.plants)
  const occupiedMap = new Map(plants.map((p) => [`${p.gridRow}-${p.gridCol}`, p]))

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="label-text mb-0">🪴 阳台位置 *</span>
        <span className="text-[10px] font-serif text-earth-400">
          {ROW_LABELS[selectedRow]} · {COL_LABELS[selectedCol]}
        </span>
      </div>

      <div className="flex">
        <div className="flex flex-col mr-1 pt-5 shrink-0">
          {ROW_LABELS.map((label, r) => (
            <div key={r} className="h-12 flex items-center justify-center">
              <span
                className="text-[9px] font-serif text-earth-400"
                style={{ writingMode: 'vertical-rl', letterSpacing: '1px' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-4 gap-1 mb-1">
            {COL_LABELS.map((label, c) => (
              <div key={c} className="text-center text-[9px] font-serif text-earth-400 py-0.5">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: BALCONY_ROWS * BALCONY_COLS }, (_, i) => {
              const row = Math.floor(i / BALCONY_COLS)
              const col = i % BALCONY_COLS
              const occupied = occupiedMap.get(`${row}-${col}`)
              const isSelected = selectedRow === row && selectedCol === col

              return (
                <button
                  key={i}
                  type="button"
                  disabled={!!occupied}
                  onClick={() => onChange(row, col)}
                  className={cn(
                    'h-12 rounded-lg border-2 transition-all duration-200 text-[10px] font-serif',
                    occupied && 'bg-wood-100 border-wood-300 text-earth-500 cursor-not-allowed',
                    !occupied && isSelected && 'border-leaf-400 bg-leaf-50 text-leaf-700 shadow-md ring-2 ring-leaf-200',
                    !occupied && !isSelected && 'border-dashed border-earth-300 text-earth-400 hover:border-leaf-300 hover:bg-leaf-50/30',
                  )}
                >
                  {occupied ? (
                    <span className="flex items-center justify-center gap-0.5">
                      <span className="text-xs">{VARIETY_EMOJI_MAP[occupied.variety] || '🌱'}</span>
                      <span className="truncate max-w-[40px]">{occupied.name}</span>
                    </span>
                  ) : isSelected ? (
                    <span className="flex items-center justify-center gap-0.5 text-leaf-600">
                      <span>✓</span>
                      <span>放这里</span>
                    </span>
                  ) : (
                    <span className="text-earth-300">空位</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
