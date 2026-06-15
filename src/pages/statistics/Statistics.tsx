import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { TrendingUp, Clock, AlertTriangle, Home, ExternalLink } from 'lucide-react'
import { api } from '@/utils/api'
import type { RecurrenceData, RepairTimeData, ErrorTypeData, FocusBuilding } from '@/types'

export default function Statistics() {
  const navigate = useNavigate()
  const [recurrence, setRecurrence] = useState<RecurrenceData[]>([])
  const [repairTime, setRepairTime] = useState<RepairTimeData[]>([])
  const [errorTypes, setErrorTypes] = useState<ErrorTypeData[]>([])
  const [focusBuildings, setFocusBuildings] = useState<FocusBuilding[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [recurData, repairData, errorData, focusData] = await Promise.all([
        api.get<RecurrenceData[]>('/statistics/recurrence?days=30&limit=10'),
        api.get<RepairTimeData[]>('/statistics/repair-time'),
        api.get<ErrorTypeData[]>('/statistics/error-types?days=30'),
        api.get<FocusBuilding[]>('/statistics/focus-buildings?threshold=3'),
      ])
      setRecurrence(recurData)
      setRepairTime(repairData)
      setErrorTypes(errorData)
      setFocusBuildings(focusData)
    } catch (error) {
      console.error('加载统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxProblemCount = recurrence.length > 0 ? Math.max(...recurrence.map(r => r.problemCount)) : 1

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  }

  const priorityLabels: Record<string, string> = {
    high: '重点关注',
    medium: '需要关注',
    low: '一般关注',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 h-80 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">问题复发排行</h3>
              <p className="text-sm text-gray-500">近30天各点位问题次数</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recurrence} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis
                  type="category"
                  dataKey="building"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`${value}次`, '问题次数']}
                  cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                />
                <Bar
                  dataKey="problemCount"
                  fill="#10B981"
                  radius={[0, 4, 4, 0]}
                  onClick={(data: any) => navigate(`/points/${data.id}`)}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {recurrence.length > 0 && (
            <p className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
              <ExternalLink className="w-3 h-3" />
              点击柱子查看点位详情
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">整改时效排行</h3>
              <p className="text-sm text-gray-500">各点位平均整改时长</p>
            </div>
          </div>
          <div className="h-72">
            {repairTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={repairTime} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" unit="h" />
                  <YAxis
                    type="category"
                    dataKey="building"
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [`${value}小时`, '平均整改时长']}
                  />
                  <Bar dataKey="avgHours" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                暂无整改数据
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">错误类型分布</h3>
              <p className="text-sm text-gray-500">近30天</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={errorTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
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

        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">重点宣传楼栋</h3>
              <p className="text-sm text-gray-500">问题次数较多，建议加强宣传</p>
            </div>
          </div>
          <div className="space-y-3">
            {focusBuildings.map((building, index) => (
              <div
                key={building.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors group"
                onClick={() => navigate(`/points/${building.id}`)}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800 group-hover:text-emerald-600 transition-colors">
                      {building.building}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full border ${
                        priorityColors[building.priority]
                      }`}
                    >
                      {priorityLabels[building.priority]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    督导员：{building.supervisor} · 已宣传 {building.promotionCount} 次
                  </p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-xl font-bold text-gray-800">
                      {building.problemCount}
                      <span className="text-sm font-normal text-gray-500 ml-1">次</span>
                    </p>
                    <p className="text-xs text-gray-500">近30天问题</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
          {focusBuildings.length > 0 && (
            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              <ExternalLink className="w-3 h-3" />
              点击楼栋查看点位详情
            </p>
          )}
          {focusBuildings.length === 0 && (
            <div className="text-center py-10 text-gray-400">暂无需要重点宣传的楼栋</div>
          )}
        </div>
      </div>
    </div>
  )
}
