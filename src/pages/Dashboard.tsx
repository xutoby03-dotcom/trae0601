import { useMemo } from 'react'
import {
  Car,
  AlertTriangle,
  Droplets,
  KeyRound,
  CalendarClock,
  AlertOctagon,
  MapPin,
  TrendingUp,
  Users,
  ChevronRight,
} from 'lucide-react'
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
  Legend,
} from 'recharts'
import { useStore } from '@/store'
import StatCard from '@/components/StatCard'
import FuelBar from '@/components/FuelBar'
import { RequestStatusBadge } from '@/components/StatusBadges'
import {
  formatDateTime,
  formatTime,
  isOverdue,
  overdueDuration,
  calcHoursBetween,
  isSameDay,
} from '@/utils/date'
import type { Request } from '@/types'

const DEPT_COLORS = [
  '#1E3A5F',
  '#F26B3A',
  '#22C55E',
  '#EAB308',
  '#8B5CF6',
  '#06B6D4',
  '#EC4899',
  '#EF4444',
  '#6366F1',
]

export default function Dashboard() {
  const vehicles = useStore((s) => s.vehicles)
  const requests = useStore((s) => s.requests)
  const returns = useStore((s) => s.returns)
  const navigate = useNavigate()

  const today = new Date()

  const todayUsage = useMemo(() => {
    return requests.filter((r) => {
      if (r.status === 'rejected' || r.status === 'returned') {
        if (r.status === 'returned') {
          return isSameDay(new Date(r.startTime), today)
        }
        return false
      }
      const start = new Date(r.startTime)
      const end = new Date(r.endTime)
      const t = today.getTime()
      return (
        (t >= start.getTime() && t <= end.getTime()) ||
        isSameDay(start, today) ||
        isSameDay(end, today)
      )
    })
  }, [requests])

  const inUseList = useMemo(
    () => requests.filter((r) => r.status === 'in_use'),
    [requests],
  )

  const overdueList = useMemo(
    () => inUseList.filter((r) => isOverdue(r)),
    [inUseList],
  )

  const lowFuelVehicles = useMemo(
    () =>
      vehicles
        .filter((v) => v.currentFuel < 30 && v.status === 'available')
        .sort((a, b) => a.currentFuel - b.currentFuel),
    [vehicles],
  )

  const usageStats = useMemo(() => {
    return vehicles.map((v) => {
      const vehicleReturns = returns.filter((ret) => {
        const req = requests.find((r) => r.id === ret.requestId)
        return req && req.vehicleId === v.id
      })
      const totalHours = vehicleReturns.reduce((sum, ret) => {
        const req = requests.find((r) => r.id === ret.requestId)
        if (!req) return sum
        return sum + calcHoursBetween(req.startTime, ret.returnedAt)
      }, 0)
      return {
        name: v.plateNumber.split('·')[1] || v.plateNumber,
        plateNumber: v.plateNumber,
        totalHours: Math.round(totalHours * 10) / 10,
        tripCount: vehicleReturns.length,
      }
    }).sort((a, b) => b.totalHours - a.totalHours)
  }, [vehicles, returns, requests])

  const deptStats = useMemo(() => {
    const m = new Map<string, number>()
    requests
      .filter((r) => r.status !== 'rejected')
      .forEach((r) => {
        m.set(r.department, (m.get(r.department) || 0) + 1)
      })
    return Array.from(m.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [requests])

  function requestInfo(r: Request) {
    const v = vehicles.find((x) => x.id === r.vehicleId)
    return { v }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">看板总览</h1>
          <p className="text-sm text-slate-500 mt-1">
            {today.getFullYear()}年{today.getMonth() + 1}月{today.getDate()}日 · 公司公车使用实时情况
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          tone="primary"
          label="今日用车"
          value={todayUsage.length}
          icon={CalendarClock}
          subtext={`${inUseList.length} 辆正在使用中`}
        />
        <StatCard
          tone="warning"
          label="逾期未还"
          value={overdueList.length}
          icon={AlertOctagon}
          subtext={
            overdueList.length > 0
              ? '请尽快联系相关人员'
              : '当前无逾期，管理良好'
          }
        />
        <StatCard
          tone="accent"
          label="油量偏低"
          value={lowFuelVehicles.length}
          icon={Droplets}
          subtext="油量低于 30% 的车辆"
        />
        <StatCard
          tone="success"
          label="在册车辆"
          value={vehicles.length}
          icon={Car}
          subtext={`可用 ${vehicles.filter((v) => v.status === 'available').length} · 维修中 ${vehicles.filter((v) => v.status === 'maintenance').length}`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">今日用车排程</h2>
              <p className="text-xs text-slate-500 mt-1">
                包括使用中、已批准待使用的车辆，点击查看详情
              </p>
            </div>
            <button
              onClick={() => navigate('/requests')}
              className="btn-ghost text-xs"
            >
              全部申请 <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {todayUsage.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <CalendarClock size={40} className="mx-auto mb-2 opacity-40" />
                今日暂无用车计划
              </div>
            )}
            {todayUsage.map((r) => {
              const { v } = requestInfo(r)
              const overdue = r.status === 'in_use' && isOverdue(r)
              return (
                <div
                  key={r.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    overdue
                      ? 'bg-red-50 border-red-200'
                      : r.status === 'in_use'
                        ? 'bg-primary-50/40 border-primary-100'
                        : 'bg-slate-50/50 border-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={v?.photo}
                      alt=""
                      className="w-24 h-16 rounded-xl object-cover shrink-0 border border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">
                              {v?.plateNumber}
                            </span>
                            <span className="text-xs text-slate-500">{v?.model}</span>
                            <RequestStatusBadge status={r.status} />
                            {overdue && (
                              <span className="badge bg-red-500 text-white border border-red-500">
                                <AlertOctagon size={11} />
                                逾期 {overdueDuration(r)}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-700 mt-1">
                            <Users size={12} className="inline mr-1" />
                            {r.driver} · {r.department}
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="text-slate-500">预计用时</div>
                          <div className="font-mono font-semibold text-slate-800">
                            {calcHoursBetween(r.startTime, r.endTime)} h
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs flex-wrap">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <CalendarClock size={12} />
                          <span>
                            {formatTime(r.startTime)} - {formatTime(r.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin size={12} />
                          <span className="truncate max-w-[200px]">{r.destination}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <TrendingUp size={12} />
                          <span>{r.estimatedMileage.toLocaleString()} km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">油量预警</h2>
                <p className="text-xs text-slate-500 mt-1">油量低于 30%，建议加油</p>
              </div>
              <button
                onClick={() => navigate('/vehicles')}
                className="btn-ghost text-xs"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {lowFuelVehicles.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <Droplets size={32} className="mx-auto mb-2 opacity-40" />
                  当前油量正常
                </div>
              )}
              {lowFuelVehicles.map((v) => (
                <div
                  key={v.id}
                  className="rounded-xl p-3 border border-accent-100 bg-accent-50/40"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={v.photo}
                      alt=""
                      className="w-14 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-mono font-semibold text-sm text-slate-800 truncate">
                          {v.plateNumber}
                        </div>
                        <div className="text-xs font-semibold text-accent-600 shrink-0">
                          ⚠ {v.currentFuel}%
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 truncate">{v.model}</div>
                      <div className="mt-1.5">
                        <FuelBar value={v.currentFuel} showLabel={false} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {overdueList.length > 0 && (
            <div className="card border-red-100" style={{ borderWidth: '1px' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    逾期未还
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    请尽快联系驾驶人确认归还时间
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {overdueList.map((r) => {
                  const v = vehicles.find((x) => x.id === r.vehicleId)
                  return (
                    <button
                      key={r.id}
                      onClick={() => navigate('/returns')}
                      className="w-full text-left rounded-xl p-3 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-mono font-semibold text-slate-800 text-sm">
                              {v?.plateNumber}
                            </div>
                            <span className="text-xs font-semibold text-red-600 shrink-0">
                              {overdueDuration(r)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5 truncate">
                            {r.driver} · 目的地 {r.destination}
                          </div>
                          <div className="text-xs text-red-500 mt-0.5">
                            应还：{formatDateTime(r.endTime)}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">车辆使用时长统计</h2>
              <p className="text-xs text-slate-500 mt-1">基于已完成订单统计累计使用小时数</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <KeyRound size={12} />
              {usageStats.reduce((s, i) => s + i.tripCount, 0)} 次出行
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageStats} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2A548A" />
                    <stop offset="100%" stopColor="#4C75AB" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  unit="h"
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                  }}
                  formatter={(value: number) => [`${value} h`, '使用时长']}
                  labelFormatter={(l) => `车牌 ${l}`}
                />
                <Bar
                  dataKey="totalHours"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">部门用车占比</h2>
              <p className="text-xs text-slate-500 mt-1">各部门申请次数统计</p>
            </div>
          </div>
          <div className="h-72">
            {deptStats.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                暂无数据
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptStats}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {deptStats.map((_, i) => (
                      <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                    }}
                    formatter={(value: number) => [`${value} 次`, '申请次数']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                    formatter={(value) => (
                      <span className="text-slate-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
