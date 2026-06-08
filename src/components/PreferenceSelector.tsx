import type { Preference } from '@/types'

const PREFERENCES: { value: Preference; label: string; emoji: string }[] = [
  { value: 'light', label: '清淡', emoji: '🍃' },
  { value: 'heavy', label: '重口', emoji: '🌶️' },
  { value: 'quick', label: '快手', emoji: '⚡' },
  { value: 'budget', label: '省钱', emoji: '💰' },
  { value: 'protein', label: '高蛋白', emoji: '💪' },
]

interface Props {
  value: Preference | null
  onChange: (p: Preference) => void
}

export default function PreferenceSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {PREFERENCES.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            value === p.value
              ? 'bg-orange-500 text-white scale-105 shadow-lg shadow-orange-500/25'
              : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-600 hover:text-stone-300'
          }`}
        >
          <span>{p.emoji}</span>
          <span>{p.label}</span>
        </button>
      ))}
    </div>
  )
}
