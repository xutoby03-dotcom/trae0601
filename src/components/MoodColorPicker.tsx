import { MOOD_COLORS } from '@/lib/utils'

interface Props {
  value: string
  onChange: (color: string) => void
}

export default function MoodColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {MOOD_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          className="group relative flex flex-col items-center gap-1"
        >
          <div
            className={`h-9 w-9 rounded-full transition-all duration-200 ${
              value === c.value ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'
            }`}
            style={{
              background: `linear-gradient(135deg, ${c.value}, ${c.value}CC)`,
              boxShadow: value === c.value ? `0 0 0 2px #2C1810, 0 0 0 4px ${c.value}, 0 0 12px ${c.value}50` : undefined,
            }}
          />
          <span
            className={`text-[10px] transition-colors ${
              value === c.value ? 'font-medium' : 'opacity-50'
            }`}
            style={{ color: value === c.value ? c.value : '#8B7355' }}
          >
            {c.name}
          </span>
        </button>
      ))}
    </div>
  )
}
