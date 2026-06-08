import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Legend } from 'recharts'
import type { BrewRecord, Flavor } from '@/types'

interface BrewHistoryChartProps {
  brews: BrewRecord[]
  beanFlavor: Flavor
}

function calcMatchScore(brewFlavor: Flavor, beanFlavor: Flavor): number {
  const keys: (keyof Flavor)[] = ['acidity', 'sweetness', 'bitterness', 'body', 'aroma']
  let totalDiff = 0
  for (const k of keys) {
    totalDiff += Math.abs(brewFlavor[k] - beanFlavor[k])
  }
  const maxDiff = 10 * keys.length
  return Math.round(((maxDiff - totalDiff) / maxDiff) * 100)
}

const MatchDot = (props: any) => {
  const { cx, cy, payload, bestId } = props
  if (payload.id === bestId) {
    return (
      <circle cx={cx} cy={cy} r={7} fill="#D4A574" stroke="#6F4E37" strokeWidth={2.5} />
    )
  }
  return (
    <circle cx={cx} cy={cy} r={3} fill="#6F4E37" />
  )
}

const RatingDot = (props: any) => {
  return (
    <circle cx={props.cx} cy={props.cy} r={3} fill="#B8864E" />
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
      <p style={{ margin: 0, color: '#6F4E37', fontWeight: 600, fontSize: 13 }}>
        风味匹配: {data.match}%
      </p>
      <p style={{ margin: 0, color: '#8B6914', fontSize: 13 }}>
        评分: {data.rating}
      </p>
    </div>
  )
}

const BrewHistoryChart = ({ brews, beanFlavor }: BrewHistoryChartProps) => {
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

  const data = sorted.map((b) => {
    const d = new Date(b.brewedAt)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return {
      id: b.id,
      date: `${mm}/${dd}`,
      rating: b.rating,
      match: calcMatchScore(b.flavor, beanFlavor),
    }
  })

  const bestItem = data.reduce((best, cur) =>
    cur.match > best.match ? cur : best
  )

  return (
    <div
      style={{
        background: '#FFFDF8',
        border: '1px solid #E8D5C0',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
          <CartesianGrid stroke="#F5E6D3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6F4E37', fontSize: 12, fontFamily: 'DM Sans' }}
            axisLine={{ stroke: '#D4A574' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="match"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fill: '#6F4E37', fontSize: 11, fontFamily: 'DM Sans' }}
            axisLine={{ stroke: '#D4A574' }}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />
          <YAxis
            yAxisId="rating"
            orientation="right"
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fill: '#8B6914', fontSize: 11, fontFamily: 'DM Sans' }}
            axisLine={{ stroke: '#D4A574' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={28}
            formatter={(value: string) => (
              <span style={{ color: '#6F4E37', fontSize: 12, fontFamily: 'DM Sans' }}>
                {value === 'match' ? '风味匹配度' : '评分'}
              </span>
            )}
          />
          <Line
            yAxisId="match"
            type="monotone"
            dataKey="match"
            stroke="#6F4E37"
            strokeWidth={2.5}
            dot={<MatchDot bestId={bestItem.id} />}
            activeDot={{ r: 5, fill: '#D4A574', stroke: '#6F4E37', strokeWidth: 2 }}
          />
          <Line
            yAxisId="rating"
            type="monotone"
            dataKey="rating"
            stroke="#B8864E"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={<RatingDot />}
          />
          <ReferenceDot
            yAxisId="match"
            x={bestItem.date}
            y={bestItem.match}
            r={7}
            fill="#D4A574"
            stroke="#6F4E37"
            strokeWidth={2.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BrewHistoryChart
export { calcMatchScore }
