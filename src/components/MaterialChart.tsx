import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useInsectHotel } from '../hooks/useInsectHotel'

export function MaterialChart() {
  const { getMaterialStats } = useInsectHotel()
  const materialStats = getMaterialStats()

  const colors = [
    '#22c55e',
    '#4ade80',
    '#86efac',
    '#bbf7d0',
    '#fef08a',
    '#fde047',
    '#facc15',
    '#fbbf24',
    '#f59e0b',
    '#d97706',
  ]

  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 p-6">
      <h3 className="text-xl font-bold text-stone-800 mb-6">📊 各材料入住率对比</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={materialStats}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis
              type="number"
              domain={[0, 100]}
              stroke="#78716c"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              dataKey="materialName"
              type="category"
              stroke="#78716c"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fefce8',
                border: '2px dashed #eab308',
                borderRadius: '12px',
              }}
              formatter={(value: number) => [
                `${value}% (${materialStats.find((m) => m.occupancyRate === value)?.occupiedCells}/${materialStats.find((m) => m.occupancyRate === value)?.totalCells})`,
                '入住率',
              ]}
            />
            <Bar dataKey="occupancyRate" radius={[0, 8, 8, 0]}>
              {materialStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        {materialStats.slice(0, 5).map((stat, index) => (
          <div
            key={stat.material}
            className="p-3 rounded-lg bg-stone-50 text-center"
          >
            <div className="text-2xl font-bold" style={{ color: colors[index] }}>
              {stat.occupancyRate}%
            </div>
            <div className="text-xs text-stone-500">{stat.materialName}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
