interface BarChartProps {
  data: { label: string; value: number; color: string }[]
  maxValue?: number
}

export default function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-right text-xs text-white/60">
            {item.label}
          </span>
          <div className="flex-1">
            <div className="h-6 overflow-hidden rounded bg-white/5">
              <div
                className="flex h-full items-center rounded transition-all duration-700 ease-out"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  background: `linear-gradient(90deg, ${item.color}30, ${item.color})`,
                  minWidth: item.value > 0 ? '2px' : '0',
                }}
              >
                <span className="ml-2 text-[11px] font-medium text-white/80">
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
