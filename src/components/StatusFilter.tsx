import { StatusBadge } from '@/components/StatusBadge'
import type { GameStatus } from '@/types'
import { STATUS_LABELS } from '@/types'

interface StatusFilterProps {
  current: string
  onChange: (status: string) => void
}

const filters: Array<{ value: string; label: string }> = [
  { value: '', label: '全部' },
  { value: 'complete', label: '齐全' },
  { value: 'missing', label: '缺件' },
  { value: 'lent', label: '外借中' },
]

export function StatusFilter({ current, onChange }: StatusFilterProps) {
  return (
    <div className="flex gap-2">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            current === f.value
              ? 'bg-[var(--color-wood-500)] text-white shadow-sm'
              : 'bg-[var(--color-wood-100)] text-[var(--color-wood-600)] hover:bg-[var(--color-wood-200)]'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

export { StatusBadge }
