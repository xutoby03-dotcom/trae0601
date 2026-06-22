import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useInsectHotel } from '../hooks/useInsectHotel'
import { formatDateDisplay } from '../utils/dateUtils'

export function TrendChart() {
  const { getTrendData } = useInsectHotel()
  const trendData = getTrendData()

  const displayData = trendData
    .filter((_, index) => index % 3 === 0 || index === trendData.length - 1)
    .map((item) => ({
      ...item,
      date: formatDateDisplay(item.date),
    }))

  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 p-6">
      <h3 className="text-xl font-bold text-stone-800 mb-6">📈 30天入住变化趋势</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis
              dataKey="date"
              stroke="#78716c"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#78716c"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fefce8',
                border: '2px dashed #eab308',
                borderRadius: '12px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="occupied"
              name="已入住"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ fill: '#22c55e', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="underObservation"
              name="观察中"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="empty"
              name="空置"
              stroke="#a8a29e"
              strokeWidth={3}
              dot={{ fill: '#a8a29e', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
