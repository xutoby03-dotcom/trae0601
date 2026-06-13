interface FuelBarProps {
  value: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export default function FuelBar({ value, showLabel = true, size = 'md' }: FuelBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))

  let tone = ''
  let bar = ''
  if (pct > 50) {
    tone = 'text-emerald-600'
    bar = 'bg-gradient-to-r from-emerald-400 to-emerald-500'
  } else if (pct > 25) {
    tone = 'text-amber-600'
    bar = 'bg-gradient-to-r from-amber-400 to-amber-500'
  } else {
    tone = 'text-accent-500'
    bar = 'bg-gradient-to-r from-accent-400 to-accent-500'
  }

  const h = size === 'sm' ? 'h-2' : 'h-2.5'

  return (
    <div className="space-y-1">
      {showLabel && (
      <div className={`text-xs font-medium ${tone}`}>油量 {pct}%</div>
    )}
      <div className={`w-full ${h} rounded-full bg-slate-100 overflow-hidden`}>
        <div
          className={`h-full ${bar} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
