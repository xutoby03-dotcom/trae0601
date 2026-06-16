import { useState } from 'react'
import { useStore } from '@/store'
import { STATUS_LABELS, STATUS_COLORS, CHECKOUT_STATUS_LABELS, CHECKOUT_STATUS_COLORS, type Goggle } from '@/types'
import { timeAgo, hoursSince, isOverdue, isDisinfectionOverdue } from '@/utils/format'
import { Package, ArrowRightLeft, Wrench, Ban, AlertTriangle, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import StatusFlowModal from '@/components/StatusFlowModal'

const PIE_COLORS = ['#10b981', '#d97706', '#f97316', '#0ea5e9', '#6366f1', '#14b8a6', '#f43f5e', '#6b7280']

export default function Dashboard() {
  const { goggles, labs, checkouts, classes, getLabById, getClassById, getTeacherById } = useStore()
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedGoggles, setSelectedGoggles] = useState<Goggle[]>([])

  const statusCounts = goggles.reduce((acc, g) => {
    acc[g.status] = (acc[g.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const availableCount = (statusCounts['available'] || 0) + (statusCounts['stored'] || 0)
  const checkedOutCount = statusCounts['checked_out'] || 0
  const repairCount = statusCounts['under_repair'] || 0
  const retiredCount = statusCounts['retired'] || 0

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
    value: count,
    status,
  }))

  const labStats = labs.map(lab => {
    const labGoggles = goggles.filter(g => g.labId === lab.id)
    const labAvailable = labGoggles.filter(g => g.status === 'available' || g.status === 'stored').length
    const labCheckedOut = labGoggles.filter(g => g.status === 'checked_out').length
    const labRepair = labGoggles.filter(g => g.status === 'under_repair' || g.status === 'retired').length
    return { lab, total: labGoggles.length, available: labAvailable, checkedOut: labCheckedOut, repair: labRepair }
  })

  const classReturnData = classes.map(cls => {
    const classCheckouts = checkouts.filter(c => c.classId === cls.id)
    const returnedCheckouts = classCheckouts.filter(c => c.status === 'returned' && c.actualReturnTime)
    const avgHours = returnedCheckouts.length > 0
      ? returnedCheckouts.reduce((sum, c) => {
          const diff = new Date(c.actualReturnTime!).getTime() - new Date(c.checkoutTime).getTime()
          return sum + diff / 3600000
        }, 0) / returnedCheckouts.length
      : 0
    return { name: cls.name, avgHours: Math.round(avgHours * 10) / 10, count: classCheckouts.length }
  }).filter(c => c.count > 0).sort((a, b) => b.avgHours - a.avgHours)

  const overdueCheckouts = checkouts.filter(c => c.status === 'active' && isOverdue(c.expectedReturnTime))

  const disinfectionOverdue = goggles.filter(g => isDisinfectionOverdue(g.updatedAt, g.status))

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">管理看板</h2>
        <p className="text-slate-500 mt-1">实时掌握实验室护目镜库存、归还和消毒状态</p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        <div className="card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">可借数量</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{availableCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">借出中</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{checkedOutCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="card p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">维修中</p>
              <p className="text-3xl font-bold text-rose-600 mt-1">{repairCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="card p-5 border-l-4 border-l-gray-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">已停用</p>
              <p className="text-3xl font-bold text-gray-500 mt-1">{retiredCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
              <Ban className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="card p-6 col-span-2">
          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            各实验室库存概览
          </h3>
          <div className="space-y-4">
            {labStats.map(item => (
              <div key={item.lab.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.lab.name}</span>
                  <span className="text-slate-500">{item.available} / {item.total} 可借</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                  <div className="bg-emerald-500 transition-all" style={{ width: `${(item.available / item.total) * 100}%` }} />
                  <div className="bg-amber-400 transition-all" style={{ width: `${(item.checkedOut / item.total) * 100}%` }} />
                  <div className="bg-rose-400 transition-all" style={{ width: `${(item.repair / item.total) * 100}%` }} />
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />可借 {item.available}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />借出 {item.checkedOut}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />维修 {item.repair}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            状态分布
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} 副`, name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            {pieData.map((item, i) => (
              <div key={item.status} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="text-slate-400 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="card p-6 col-span-2">
          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            班级归还效率
          </h3>
          {classReturnData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classReturnData} layout="vertical" margin={{ left: 80, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} unit="h" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: number) => [`${value} 小时`, '平均归还时间']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                  />
                  <Bar dataKey="avgHours" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {classReturnData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.avgHours > 4 ? '#ef4444' : entry.avgHours > 2.5 ? '#f59e0b' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">暂无归还数据</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            逾期未还
          </h3>
          {overdueCheckouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">暂无逾期记录</p>
              <p className="text-xs text-slate-400 mt-1">所有领用均按时归还</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueCheckouts.slice(0, 5).map(co => {
                const cls = getClassById(co.classId)
                const teacher = getTeacherById(co.teacherId)
                const lab = getLabById(co.labId)
                return (
                  <div key={co.id} className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-rose-900">{cls?.name}</span>
                      <span className="badge bg-rose-100 text-rose-700">逾期</span>
                    </div>
                    <p className="text-xs text-rose-700">{co.experimentProject}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-rose-600">
                      <span>{teacher?.name} · {lab?.name}</span>
                      <span>应还 {timeAgo(co.expectedReturnTime)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent-600 animate-pulse-slow" />
            消毒超时预警
            {disinfectionOverdue.length > 0 && (
              <span className="badge bg-accent-100 text-accent-700 ml-2">{disinfectionOverdue.length} 项超时</span>
            )}
          </h3>
          {disinfectionOverdue.length > 0 && (
            <button
              onClick={() => {
                setSelectedGoggles(disinfectionOverdue)
                setShowStatusModal(true)
              }}
              className="btn-primary text-xs px-3 py-1.5"
            >
              批量处理
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {disinfectionOverdue.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500">所有护目镜消毒流程均在时限内</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {disinfectionOverdue.slice(0, 6).map(g => {
              const lab = getLabById(g.labId)
              const elapsed = Math.round(hoursSince(g.updatedAt))
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGoggles([g])
                    setShowStatusModal(true)
                  }}
                  className="text-left p-4 bg-accent-50 rounded-lg border border-accent-200 relative overflow-hidden hover:border-accent-400 hover:shadow-md transition-all group"
                >
                  <div className="absolute top-0 right-0 w-2 h-full bg-accent-500 animate-pulse-slow" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-900">{g.code}</span>
                    <span className="badge bg-accent-200 text-accent-800">{STATUS_LABELS[g.status]}</span>
                  </div>
                  <p className="text-xs text-slate-600">{lab?.name}</p>
                  <p className="text-xs text-accent-700 mt-1 font-medium">已等待 {elapsed} 小时</p>
                  <p className="text-xs text-accent-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    点击处理 <ArrowRight className="w-3 h-3" />
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {showStatusModal && (
        <StatusFlowModal
          goggles={selectedGoggles}
          onClose={() => setShowStatusModal(false)}
          title="消毒流程状态处理"
        />
      )}

      <div className="card p-6 mt-5">
        <h3 className="text-base font-semibold text-slate-900 mb-4">近期领用记录</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">班级</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">实验项目</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">实验室</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">数量</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">负责教师</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">状态</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.slice(0, 8).map(co => {
                const cls = getClassById(co.classId)
                const teacher = getTeacherById(co.teacherId)
                const lab = getLabById(co.labId)
                return (
                  <tr key={co.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">{cls?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{co.experimentProject}</td>
                    <td className="py-3 px-4 text-slate-600">{lab?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{co.quantity} 副</td>
                    <td className="py-3 px-4 text-slate-600">{teacher?.name}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${CHECKOUT_STATUS_COLORS[co.status]}`}>
                        {CHECKOUT_STATUS_LABELS[co.status]}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
