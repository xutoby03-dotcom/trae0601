interface RadarChartProps {
  aroma: number
  layering: number
  persistence: number
  size?: number
}

export default function RadarChart({ aroma, layering, persistence, size = 200 }: RadarChartProps) {
  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.38

  const axes = [
    { label: '香气强度', value: aroma },
    { label: '层次感', value: layering },
    { label: '持久度', value: persistence },
  ]

  const angles = axes.map((_, i) => (Math.PI * 2 * i) / 3 - Math.PI / 2)

  const gridLevels = [2, 4, 6, 8, 10]

  const getPoint = (angle: number, value: number) => ({
    x: cx + maxR * (value / 10) * Math.cos(angle),
    y: cy + maxR * (value / 10) * Math.sin(angle),
  })

  const dataPoints = axes.map((a, i) => getPoint(angles[i], a.value))
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {gridLevels.map((level) => {
        const pts = angles.map((a) => {
          const p = getPoint(a, level)
          return `${p.x},${p.y}`
        }).join(' ')
        return (
          <polygon
            key={level}
            points={pts}
            fill="none"
            stroke="rgba(184,134,11,0.15)"
            strokeWidth="1"
          />
        )
      })}

      {axes.map((a, i) => {
        const outer = getPoint(angles[i], 10)
        return (
          <line
            key={a.label}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(184,134,11,0.2)"
            strokeWidth="1"
          />
        )
      })}

      <polygon
        points={polygonPoints}
        fill="rgba(232,145,45,0.25)"
        stroke="#E8912D"
        strokeWidth="2"
      />

      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#E8912D"
          stroke="#1A1410"
          strokeWidth="2"
        />
      ))}

      {axes.map((a, i) => {
        const labelPos = getPoint(angles[i], 12)
        return (
          <text
            key={a.label}
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#B8860B"
            fontSize="12"
            fontWeight="600"
          >
            {a.label}
          </text>
        )
      })}
    </svg>
  )
}
