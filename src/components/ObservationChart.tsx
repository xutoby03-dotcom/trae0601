import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  Scatter,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts'
import { useStore } from '@/store/useStore'
import { detectAnomalies } from '@/utils/anomaly'

interface ObservationChartProps {
  planId: string
}

const FLOAT_MAP: Record<string, number> = { top: 3, middle: 2, bottom: 1 }
const FEEDING_MAP: Record<string, number> = { active: 3, moderate: 2, refuse: 1 }

const FLOAT_LABELS: Record<number, string> = { 3: '上层', 2: '中层', 1: '下层' }
const FEEDING_LABELS: Record<number, string> = { 3: '积极', 2: '一般', 1: '拒绝' }

interface ChartDataPoint {
  dayIndex: number
  extensionLevel: number
  floatHeight: number
  feedingResponse: number
  wallCollision: number | null
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: number }) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-bold text-gray-300">第{(label ?? 0) + 1}天</p>
      {payload.map(entry => {
        let displayValue = ''
        if (entry.dataKey === 'extensionLevel') {
          displayValue = `${entry.value} 星`
        } else if (entry.dataKey === 'floatHeight') {
          displayValue = FLOAT_LABELS[entry.value] ?? `${entry.value}`
        } else if (entry.dataKey === 'feedingResponse') {
          displayValue = FEEDING_LABELS[entry.value] ?? `${entry.value}`
        } else if (entry.dataKey === 'wallCollision') {
          displayValue = entry.value != null ? '是' : '否'
        }
        return (
          <p key={entry.dataKey} style={{ color: entry.color }}>
            {entry.dataKey === 'extensionLevel' && '舒展度: '}
            {entry.dataKey === 'floatHeight' && '漂浮高度: '}
            {entry.dataKey === 'feedingResponse' && '摄食反应: '}
            {entry.dataKey === 'wallCollision' && '撞壁: '}
            {displayValue}
          </p>
        )
      })}
    </div>
  )
}

export default function ObservationChart({ planId }: ObservationChartProps) {
  const observations = useStore(s =>
    s.observations
      .filter(o => o.planId === planId)
      .sort((a, b) => a.dayIndex - b.dayIndex)
  )

  const anomalies = useMemo(() => detectAnomalies(observations), [observations])

  const anomalyDaySet = useMemo(() => {
    const set = new Set<number>()
    anomalies.forEach(a => a.dayIndices.forEach(d => set.add(d)))
    return set
  }, [anomalies])

  const chartData: ChartDataPoint[] = useMemo(() =>
    observations.map(o => ({
      dayIndex: o.dayIndex,
      extensionLevel: o.extensionLevel,
      floatHeight: FLOAT_MAP[o.floatHeight] ?? 2,
      feedingResponse: FEEDING_MAP[o.feedingResponse] ?? 2,
      wallCollision: o.wallCollision ? 0 : null,
    })),
    [observations]
  )

  const anomalyRanges = useMemo(() => {
    const ranges: { x1: number; x2: number }[] = []
    const sortedDays = Array.from(anomalyDaySet).sort((a, b) => a - b)
    if (sortedDays.length === 0) return ranges

    let start = sortedDays[0]
    let end = sortedDays[0]

    for (let i = 1; i < sortedDays.length; i++) {
      if (sortedDays[i] === end + 1) {
        end = sortedDays[i]
      } else {
        ranges.push({ x1: start - 0.5, x2: end + 0.5 })
        start = sortedDays[i]
        end = sortedDays[i]
      }
    }
    ranges.push({ x1: start - 0.5, x2: end + 0.5 })
    return ranges
  }, [anomalyDaySet])

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-gray-800/60 text-gray-500">
        暂无观测数据
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-gray-800/60 p-4">
      <h3 className="mb-4 text-sm font-medium text-gray-300">观测趋势</h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="dayIndex"
            tickFormatter={v => `第${v + 1}天`}
            stroke="#9ca3af"
            tick={{ fontSize: 11 }}
          />
          <YAxis domain={[0, 5]} stroke="#9ca3af" tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={value => {
              const labels: Record<string, string> = {
                extensionLevel: '舒展度',
                floatHeight: '漂浮高度',
                feedingResponse: '摄食反应',
                wallCollision: '撞壁',
              }
              return <span className="text-xs text-gray-300">{labels[value] ?? value}</span>
            }}
          />
          {anomalyRanges.map((range, i) => (
            <ReferenceArea
              key={i}
              x1={range.x1}
              x2={range.x2}
              fill="#ef4444"
              fillOpacity={0.1}
            />
          ))}
          <Line
            type="monotone"
            dataKey="extensionLevel"
            stroke="#00e5c7"
            strokeWidth={2}
            dot={{ fill: '#00e5c7', r: 3 }}
            yAxisId={0}
          />
          <Line
            type="stepAfter"
            dataKey="floatHeight"
            stroke="#1e40af"
            strokeWidth={2}
            dot={{ fill: '#1e40af', r: 3 }}
            yAxisId={0}
          />
          <Line
            type="stepAfter"
            dataKey="feedingResponse"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 3 }}
            yAxisId={0}
          />
          <Scatter
            dataKey="wallCollision"
            fill="#ef4444"
            shape="diamond"
            yAxisId={0}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
