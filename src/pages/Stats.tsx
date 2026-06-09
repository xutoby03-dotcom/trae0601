import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useBakingStore } from '@/store/bakingStore'
import { PROBLEM_TAG_LABELS } from '@/types'
import { ArrowLeft, BarChart3, TrendingDown, PieChart, Trash2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts'

const PIE_COLORS = ['#D4A574', '#8B5E3C', '#27AE60', '#F39C12']

export default function Stats() {
  const records = useBakingStore((s) => s.records)
  const getProblemTagStats = useBakingStore((s) => s.getProblemTagStats)
  const getSuccessRateByType = useBakingStore((s) => s.getSuccessRateByType)
  const getMonthlyWaste = useBakingStore((s) => s.getMonthlyWaste)

  const problemStats = useMemo(() => getProblemTagStats(), [records, getProblemTagStats])
  const successRateData = useMemo(() => getSuccessRateByType(), [records, getSuccessRateByType])
  const monthlyWaste = useMemo(() => getMonthlyWaste(), [records, getMonthlyWaste])

  const totalRecords = records.length
  const successRecords = records.filter((r) => r.result === 'success').length
  const failureRecords = records.filter((r) => r.result === 'failure').length
  const totalWaste = records
    .filter((r) => r.result === 'failure')
    .reduce((sum, r) => sum + (r.materialCost || 0), 0)

  const barData = problemStats.map((s) => ({
    name: PROBLEM_TAG_LABELS[s.tag],
    count: s.count,
  }))

  const pieData = successRateData.map((d) => ({
    name: d.type,
    value: d.total,
  }))

  const wasteLineData = monthlyWaste.map((m) => ({
    month: m.month,
    失败次数: m.failures,
    浪费金额: m.cost,
  }))

  return (
    <div className="min-h-screen bg-bake-cream font-body">
      <header className="sticky top-0 z-10 bg-bake-card/95 backdrop-blur-sm border-b border-bake-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-bake-warm transition-colors text-bake-brown">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-display font-bold text-bake-dark">烘焙统计</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-bake bg-bake-card p-4 shadow-sm text-center">
            <p className="text-2xl font-display font-bold text-bake-dark">{totalRecords}</p>
            <p className="text-xs text-bake-brown/60 mt-1">总记录数</p>
          </div>
          <div className="rounded-bake bg-bake-card p-4 shadow-sm text-center">
            <p className="text-2xl font-display font-bold text-bake-green">{successRecords}</p>
            <p className="text-xs text-bake-brown/60 mt-1">成功次数</p>
          </div>
          <div className="rounded-bake bg-bake-card p-4 shadow-sm text-center">
            <p className="text-2xl font-display font-bold text-bake-red">{failureRecords}</p>
            <p className="text-xs text-bake-brown/60 mt-1">失败次数</p>
          </div>
        </section>

        {totalWaste > 0 && (
          <section className="rounded-bake bg-gradient-to-r from-bake-red/10 to-bake-amber/10 p-5 shadow-sm border border-bake-red/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-bake-red/15 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-bake-red" />
              </div>
              <div>
                <p className="text-sm text-bake-brown/70">累计材料浪费</p>
                <p className="text-2xl font-display font-bold text-bake-red">
                  ¥{totalWaste.toFixed(2)}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-bake bg-bake-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-bake-brown mb-4 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-bake-caramel" />
            最常失败原因
          </h2>
          {barData.length === 0 ? (
            <div className="text-center py-8 text-bake-brown/40 text-sm">暂无失败记录数据</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
                  <XAxis type="number" tick={{ fill: '#5C3D2E', fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={70}
                    tick={{ fill: '#5C3D2E', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFAF5',
                      border: '1px solid #E8D5C4',
                      borderRadius: '12px',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#D4A574" radius={[0, 6, 6, 0]} name="出现次数" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-bake bg-bake-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-bake-brown mb-4 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-bake-caramel" />
            作品类型分布与成功率
          </h2>
          {successRateData.length === 0 ? (
            <div className="text-center py-8 text-bake-brown/40 text-sm">暂无作品类型数据</div>
          ) : (
            <div className="space-y-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 12, color: '#5C3D2E' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFAF5',
                        border: '1px solid #E8D5C4',
                        borderRadius: '12px',
                        fontSize: 12,
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {successRateData.map((d, idx) => (
                  <div
                    key={d.type}
                    className="flex items-center justify-between p-3 rounded-lg bg-bake-light"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="text-sm text-bake-dark font-medium">{d.type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-bake-brown/70">
                      <span>共{d.total}次</span>
                      <span>成功{d.success}次</span>
                      <span className="font-semibold text-bake-dark">{d.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-bake bg-bake-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-bake-brown mb-4 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-bake-caramel" />
            月度材料浪费趋势
          </h2>
          {wasteLineData.length === 0 ? (
            <div className="text-center py-8 text-bake-brown/40 text-sm">暂无月度数据</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wasteLineData} margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
                  <XAxis dataKey="month" tick={{ fill: '#5C3D2E', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#5C3D2E', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFAF5',
                      border: '1px solid #E8D5C4',
                      borderRadius: '12px',
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#5C3D2E' }} />
                  <Line
                    type="monotone"
                    dataKey="失败次数"
                    stroke="#E74C3C"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#E74C3C' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="浪费金额"
                    stroke="#D4A574"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#D4A574' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
