import { useMemo } from 'react'
import { useStore } from '@/store'
import { SAMPLE_TYPES } from '@/types'
import { cn } from '@/lib/utils'
import { FlaskConical, ClipboardList, AlertTriangle, Thermometer, TrendingUp, Clock } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const PIE_COLORS = ['#0F766E', '#D97706', '#DC2626', '#2563EB', '#7C3AED']

export default function Dashboard() {
  const samples = useStore((s) => s.samples)
  const checkouts = useStore((s) => s.checkouts)
  const returns = useStore((s) => s.returns)

  const confirmedCheckouts = useMemo(
    () => checkouts.filter((c) => c.status === 'confirmed'),
    [checkouts],
  )

  const tempAbnormalSamples = useMemo(
    () => samples.filter((s) => s.status === 'temp_abnormal'),
    [samples],
  )

  const consumptionData = useMemo(() => {
    const allConfirmed = checkouts.filter((c) => c.status === 'confirmed' || c.status === 'returned' || c.status === 'disposed')
    return SAMPLE_TYPES.map((type) => {
      const typeSamples = samples.filter((s) => s.type === type)
      const typeSampleIds = new Set(typeSamples.map((s) => s.id))
      const total = allConfirmed
        .filter((c) => typeSampleIds.has(c.sampleId))
        .reduce((sum, c) => sum + c.quantity, 0)
      return { name: type, value: total }
    })
  }, [samples, checkouts])

  const disposalReasonData = useMemo(() => {
    const disposeReturns = returns.filter((r) => r.type === 'dispose')
    const reasonCounts: Record<string, number> = {}
    disposeReturns.forEach((r) => {
      const reason = r.reason || '未注明'
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    })
    return Object.entries(reasonCounts).map(([name, value]) => ({ name, value }))
  }, [returns])

  const unreturnedTableData = useMemo(
    () =>
      confirmedCheckouts.map((c) => {
        const sample = samples.find((s) => s.id === c.sampleId)
        const checkoutDate = new Date(c.checkoutTime)
        const now = new Date()
        const daysSince = Math.floor((now.getTime() - checkoutDate.getTime()) / (1000 * 60 * 60 * 24))
        return {
          id: c.id,
          code: sample?.code ?? '-',
          className: c.className,
          studentName: c.studentName,
          quantity: c.quantity,
          checkoutTime: c.checkoutTime,
          daysSince,
        }
      }),
    [confirmedCheckouts, samples],
  )

  const tempAlertData = useMemo(
    () =>
      tempAbnormalSamples.map((s) => {
        const belowMin = s.currentTemp < s.tempMin
        const aboveMax = s.currentTemp > s.tempMax
        const deviation = belowMin
          ? s.tempMin - s.currentTemp
          : aboveMax
            ? s.currentTemp - s.tempMax
            : 0
        return {
          id: s.id,
          code: s.code,
          type: s.type,
          tempMin: s.tempMin,
          tempMax: s.tempMax,
          currentTemp: s.currentTemp,
          outOfRange: belowMin || aboveMax,
          deviation,
        }
      }),
    [tempAbnormalSamples],
  )

  const statCards = [
    { label: '样本总数', value: samples.length, icon: FlaskConical, color: 'bg-teal-50 text-teal-700', iconBg: 'bg-teal-100', trend: <TrendingUp className="h-4 w-4 text-teal-500" /> },
    { label: '领用中', value: confirmedCheckouts.length, icon: ClipboardList, color: 'bg-blue-50 text-blue-700', iconBg: 'bg-blue-100', trend: <TrendingUp className="h-4 w-4 text-blue-500" /> },
    { label: '未归还', value: confirmedCheckouts.length, icon: AlertTriangle, color: 'bg-amber-50 text-amber-700', iconBg: 'bg-amber-100', trend: <Clock className="h-4 w-4 text-amber-500" /> },
    { label: '温度异常', value: tempAbnormalSamples.length, icon: Thermometer, color: 'bg-red-50 text-red-700', iconBg: 'bg-red-100', trend: <AlertTriangle className="h-4 w-4 text-red-500" /> },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className={cn('rounded-xl border p-5 shadow-sm', card.color)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{card.label}</p>
                <p className="mt-1 text-3xl font-bold">{card.value}</p>
              </div>
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', card.iconBg)}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs opacity-70">
              {card.trend}
              <span>实时统计</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-800">消耗统计</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0F766E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-800">废弃原因分析</h3>
          {disposalReasonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={disposalReasonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {disposalReasonData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-400">暂无废弃记录</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-800">未归还样本</h3>
          {unreturnedTableData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4 font-medium">样本编号</th>
                    <th className="pb-2 pr-4 font-medium">班级</th>
                    <th className="pb-2 pr-4 font-medium">学生</th>
                    <th className="pb-2 pr-4 font-medium">数量</th>
                    <th className="pb-2 pr-4 font-medium">领用时间</th>
                    <th className="pb-2 font-medium">距今天数</th>
                  </tr>
                </thead>
                <tbody>
                  {unreturnedTableData.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b last:border-0',
                        row.daysSince > 3 && 'bg-amber-50',
                      )}
                    >
                      <td className="py-2.5 pr-4 font-mono text-xs">{row.code}</td>
                      <td className="py-2.5 pr-4">{row.className}</td>
                      <td className="py-2.5 pr-4">{row.studentName}</td>
                      <td className="py-2.5 pr-4">{row.quantity}</td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        {new Date(row.checkoutTime).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="py-2.5">
                        <span className={cn(row.daysSince > 3 && 'font-semibold text-amber-600')}>
                          {row.daysSince}天
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-gray-400">暂无未归还样本</div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-800">温度异常告警</h3>
          {tempAlertData.length > 0 ? (
            <ul className="space-y-3">
              {tempAlertData.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-3"
                >
                  <Thermometer className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-gray-800">{item.code}</span>
                      <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">{item.type}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      要求温度：{item.tempMin}°C ~ {item.tempMax}°C
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs">
                      <span className="text-gray-500">当前温度：</span>
                      <span className={cn('font-semibold', item.outOfRange ? 'text-red-600' : 'text-gray-700')}>
                        {item.currentTemp}°C
                      </span>
                      {item.outOfRange && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-700">
                          偏差 {item.deviation}°C
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-32 items-center justify-center text-gray-400">暂无温度异常</div>
          )}
        </div>
      </div>
    </div>
  )
}
