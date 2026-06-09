import { useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { useStore } from '@/store'
import { formatTime } from '@/utils/helpers'
import { Users, UserX, Clock } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

const TEAL = '#0F766E'
const TEAL_BG = 'rgba(15, 118, 110, 0.15)'
const ORANGE = '#F97316'

export default function Stats() {
  const getStatsData = useStore((s) => s.getStatsData)
  const getEmployee = useStore((s) => s.getEmployee)

  const stats = useMemo(() => getStatsData(), [getStatsData])
  const { dailyCounts, departmentStats, noShowRate, overtimeVisitors } = stats

  const totalVisitors = dailyCounts.reduce((sum, d) => sum + d.count, 0)

  const lineData = {
    labels: dailyCounts.map((d) => {
      const parts = d.date.split('-')
      return `${parts[1]}/${parts[2]}`
    }),
    datasets: [
      {
        data: dailyCounts.map((d) => d.count),
        borderColor: TEAL,
        backgroundColor: TEAL_BG,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: TEAL,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { stepSize: 1, font: { size: 11 } } },
    },
  }

  const barData = {
    labels: departmentStats.map((d) => d.department),
    datasets: [
      {
        data: departmentStats.map((d) => d.count),
        backgroundColor: ORANGE,
        borderRadius: 4,
      },
    ],
  }

  const barOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { stepSize: 1, font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 12 } } },
    },
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">统计报表</h1>
        <p className="text-sm text-gray-400 mt-1">近14天数据</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
            <Users size={20} className="text-teal-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">总访客量</p>
            <p className="text-2xl font-bold text-gray-900">{totalVisitors}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <UserX size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">爽约率</p>
            <p className="text-2xl font-bold text-gray-900">{noShowRate}<span className="text-sm font-normal text-gray-400">%</span></p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">超时停留</p>
            <p className="text-2xl font-bold text-gray-900">{overtimeVisitors.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">每日访客趋势</h3>
          <div className="h-64">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">部门接待排行</h3>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {overtimeVisitors.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">超时停留访客</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">姓名</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">公司</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">签到时间</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">预计离开</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">接待部门</th>
                </tr>
              </thead>
              <tbody>
                {overtimeVisitors.map((v) => {
                  const host = getEmployee(v.hostId)
                  return (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-gray-800">{v.name}</td>
                      <td className="py-2.5 px-3 text-gray-600">{v.company}</td>
                      <td className="py-2.5 px-3 text-gray-600">
                        {v.actualArrival ? formatTime(v.actualArrival) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">
                        {v.actualArrival ? formatTime(new Date(new Date(v.actualArrival).getTime() + 3 * 3600000).toISOString()) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">{host?.department ?? '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
