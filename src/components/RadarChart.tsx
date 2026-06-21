import { INDICATOR_LABELS } from "@/types"

interface RadarChartProps {
  data: number[]
  size?: number
  label?: string
}

export default function RadarChart({
  data,
  size = 160,
  label,
}: RadarChartProps) {
  const center = size / 2
  const maxRadius = size / 2 - 28
  const levels = 3
  const labels = Object.values(INDICATOR_LABELS)
  const angleStep = (2 * Math.PI) / data.length
  const startAngle = -Math.PI / 2

  function getPoint(index: number, value: number): [number, number] {
    const angle = startAngle + index * angleStep
    const r = (value / 3) * maxRadius
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }

  const gridPaths: string[] = []
  for (let level = 1; level <= levels; level++) {
    const points = data.map((_, i) => {
      const angle = startAngle + i * angleStep
      const r = (level / levels) * maxRadius
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
    })
    gridPaths.push(`M${points.join("L")}Z`)
  }

  const axisLines = data.map((_, i) => {
    const angle = startAngle + i * angleStep
    return `M${center},${center} L${center + maxRadius * Math.cos(angle)},${center + maxRadius * Math.sin(angle)}`
  })

  const dataPoints = data.map((v, i) => getPoint(i, v))
  const dataPath = `M${dataPoints.map(([x, y]) => `${x},${y}`).join("L")}Z`

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {gridPaths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#3a3a55"
            strokeWidth="1"
            opacity={0.5}
          />
        ))}

        {axisLines.map((d, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + maxRadius * Math.cos(startAngle + i * angleStep)}
            y2={center + maxRadius * Math.sin(startAngle + i * angleStep)}
            stroke="#3a3a55"
            strokeWidth="1"
            opacity={0.3}
          />
        ))}

        <path
          d={dataPath}
          fill="rgba(232,168,56,0.15)"
          stroke="#e8a838"
          strokeWidth="2"
        />

        {dataPoints.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill="#e8a838"
            stroke="#1a1a2e"
            strokeWidth="1.5"
          />
        ))}

        {labels.map((lbl, i) => {
          const angle = startAngle + i * angleStep
          const labelR = maxRadius + 18
          const x = center + labelR * Math.cos(angle)
          const y = center + labelR * Math.sin(angle)
          const anchor =
            Math.abs(Math.cos(angle)) < 0.1
              ? "middle"
              : Math.cos(angle) > 0
                ? "start"
                : "end"
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="central"
              fill="#a0a0b8"
              fontSize="9"
            >
              {lbl}
            </text>
          )
        })}
      </svg>
      {label && (
        <span className="mt-1 text-xs text-[#6b8f9e]">{label}</span>
      )}
    </div>
  )
}
