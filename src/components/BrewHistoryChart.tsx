import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts'
import type { BrewRecord } from '@/types'

interface BrewHistoryChartProps {
  brews: BrewRecord[]
}

const CustomDot = (props: any) => {
  const { cx, cy, payload, bestId } = props
  if (payload.id === bestId) {
    return (
      <circle cx={cx} cy={cy} r={6} fill="#D4A574" stroke="#6F4E37" strokeWidth={2} />
    )
  }
  return (
    <circle cx={cx} cy={cy} r={3} fill="#6F4E37" />
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload
  return (
    <div
      style={{
        background: '#FFFDF8',
        border: '1px solid #D4A574',
        borderRadius: 8,
        padding: '8px 12px',
        fontFamily: 'DM Sans',
      }}
    >
      <p style={{ margin: 0, color: '#6F4E37', fontSize: 12 }}>{data.date}</p>
      <p style={{ margin: 0, color: '#6F4E37', fontWeight: 600, fontSize: 14 }}>
        评分: {data.rating}
      </p>
    </div>
  )
}

const BrewHistoryChart = ({ brews }: BrewHistoryChartProps) => {
  if (!brews.length) {
    return (
      <div
        style={{
          background: '#FFFDF8',
          border: '1px solid #E8D5C0',
          borderRadius: 12,
          padding: 16,
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#B8A090',
          fontFamily: 'DM Sans',
          fontSize: 14,
        }}
      >
        暂无冲煮记录
      </div>
    )
  }

  const sorted = [...brews].sort(
    (a: BrewRecord, b: BrewRecord) => new Date(a.brewedAt).getTime() - new Date(b.brewedAt).getTime()
  )

  const bestBrew = sorted.reduce((best, cur) =>
    cur.rating > best.rating ? cur : best
  )

  const data = sorted.map((b) => {
    const d = new Date(b.brewedAt)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return {
      id: b.id,
      date: `${mm}/${dd}`,
      rating: b.rating,
    }
  })

  const bestPoint = data.find((d) => d.id === bestBrew.id)

  return (
    <div
      style={{
        background: '#FFFDF8',
        border: '1px solid #E8D5C0',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
          <CartesianGrid stroke="#F5E6D3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6F4E37', fontSize: 12, fontFamily: 'DM Sans' }}
            axisLine={{ stroke: '#D4A574' }}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fill: '#6F4E37', fontSize: 12, fontFamily: 'DM Sans' }}
            axisLine={{ stroke: '#D4A574' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#6F4E37"
            strokeWidth={2}
            dot={<CustomDot bestId={bestBrew.id} />}
            activeDot={{ r: 5, fill: '#D4A574', stroke: '#6F4E37', strokeWidth: 2 }}
          />
          {bestPoint && (
            <ReferenceDot
              x={bestPoint.date}
              y={bestPoint.rating}
              r={6}
              fill="#D4A574"
              stroke="#6F4E37"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BrewHistoryChart
