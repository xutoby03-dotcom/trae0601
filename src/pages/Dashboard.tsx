import { useState, useEffect } from 'react'
import {
  ClipboardList,
  Ticket,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import StatCard from '@/components/StatCard'
import { api } from '@/utils/api'
import type { OverviewStats, TrendData, ErrorTypeData, RecurrenceData } from '@/types'

export default function Dashboard() {
  const [overview, setOverview] = useState<OverviewStats | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [errorTypes, setErrorTypes] = useState<ErrorTypeData[]>([])
  const [recurrence, setRecurrence] = useState<RecurrenceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [overviewData, trend, errors, recur] = await Promise.all([
        api.get<OverviewStats>('/statistics/overview'),
        api.get<TrendData[]>('/statistics/trend?days=30'),
        api.get<ErrorTypeData[]>('/statistics/error-types?days=30'),
        api.get<RecurrenceData[]>('/statistics/recurrence?days=30&limit=5'),
      ])
      setOverview(overviewData)
      setTrendData(trend)
      setErrorTypes(errors)
      setRecurrence(recur)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxProblemCount = recurrence.length > 0 ? Math.max(...recurrence.map(r => r.problemCount)) : 1

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 h-80 animate-pulse" />
          <div className="bg-white rounded-xl p-5 h-80 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="今日巡查"
          value={overview?.todayInspections || 0}
          icon={ClipboardList}
          color="green"
        />
        <StatCard
          title="待处理工单"
          value={overview?.pendingTickets || 0}
          icon={Ticket}
          color="amber"
        />
        <StatCard
          title="本月问题数"
          value={overview?.monthProblems || 0}
          icon={AlertTriangle}
          change={overview?.problemChange}
          changeLabel="较上月"
          color="red"
        />
        <StatCard
          title="整改完成率"
          value={`${overview?.completionRate || 0}%`}
          icon={CheckCircle2}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">问题趋势</h3>
            <span className="text-sm text-gray-500">近30天</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">问题类型分布</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={errorTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {errorTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {errorTypes.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-800">{item.value}次</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">高频问题点位</h3>
          <span className="text-sm text-gray-500">近30天 Top5</span>
        </div>
        <div className="space-y-4">
          {recurrence.map((item, index) => (
            <div key={item.id} className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? 'bg-amber-100 text-amber-700'
                    : index === 1
                    ? 'bg-gray-100 text-gray-700'
                    : index === 2
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800">{item.building}</span>
                  <span className="text-sm text-gray-500">{item.problemCount}次</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(item.problemCount / maxProblemCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
