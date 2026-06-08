interface ProgressBarProps {
  value: number
  max: number
  color?: string
  height?: number
  showLabel?: boolean
  unit?: string
}

export default function ProgressBar({
  value,
  max,
  color = '#FF6B35',
  height = 6,
  showLabel = true,
  unit = '',
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="text-white/50">
            {Math.round(value)} / {max} {unit}
          </span>
          <span style={{ color }}>{Math.round(percent)}%</span>
        </div>
      )}
      <div
        className="w-full overflow-hidden rounded-full bg-white/10"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${color}90, ${color})`,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  )
}
