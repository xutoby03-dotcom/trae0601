import { useStore } from '@/store'
import { COST_TYPE_LABELS, DISEASE_TYPE_LABELS } from '@/types'
import type { FollowUpRecord, CostType } from '@/types'
import { BarChart3, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { subMonths, addMonths, format, parseISO, isAfter } from 'date-fns'

export default function Stats() {
  const { elders, chronicDiseases, followUpRecords, healthIndicators, familyTasks } = useStore()

  const now = new Date()
  const sixMonthsAgo = subMonths(now, 6)
  const recentRecords = followUpRecords.filter((r) => isAfter(parseISO(r.date), sixMonthsAgo))

  const sortedByDisease = new Map<string, FollowUpRecord[]>()
  for (const r of followUpRecords) {
    const list = sortedByDisease.get(r.diseaseId) ?? []
    list.push(r)
    sortedByDisease.set(r.diseaseId, list)
  }
  for (const [, list] of sortedByDisease) {
    list.sort((a, b) => a.date.localeCompare(b.date))
  }

  let onTime = 0
  let delayed = 0
  let missed = 0
  for (const [, list] of sortedByDisease) {
    for (let i = 0; i < list.length; i++) {
      if (i === 0) { onTime++; continue }
      const prev = list[i - 1]
      if (!prev.nextDate) { onTime++; continue }
      const actual = parseISO(list[i].date)
      const expected = parseISO(prev.nextDate)
      if (!isAfter(actual, expected)) onTime++
      else if (isAfter(actual, addMonths(expected, 1))) missed++
      else delayed++
    }
  }
  const totalVisits = onTime + delayed + missed
  const onTimeRate = totalVisits > 0 ? Math.round((onTime / totalVisits) * 100) : 0

  const medTotal = recentRecords.filter((r) => r.costType === 'medication').reduce((s, r) => s + r.cost, 0)
  const examTotal = recentRecords.filter((r) => r.costType === 'examination').reduce((s, r) => s + r.cost, 0)

  const monthlyData: { month: string; med: number; exam: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const m = subMonths(now, i)
    const key = format(m, 'yyyy-MM')
    const label = format(m, 'MM月')
    const monthRecords = recentRecords.filter((r) => r.date.startsWith(key))
    monthlyData.push({
      month: label,
      med: monthRecords.filter((r) => r.costType === 'medication').reduce((s, r) => s + r.cost, 0),
      exam: monthRecords.filter((r) => r.costType === 'examination').reduce((s, r) => s + r.cost, 0),
    })
  }

  const thisMonthKey = format(now, 'yyyy-MM')
  const thisMonthRecords = followUpRecords.filter((r) => r.date.startsWith(thisMonthKey))
  const thisMonthCost = thisMonthRecords.reduce((s, r) => s + r.cost, 0)
  const pendingTasks = familyTasks.filter((t) => t.status !== 'completed').length
  const abnormalCount = healthIndicators.filter((h) => h.isAbnormal).length

  const maxCost = Math.max(...monthlyData.map((d) => d.med + d.exam), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">数据统计</h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: '本月复诊次数', value: thisMonthRecords.length, color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: DollarSign, label: '本月费用总计', value: `¥${thisMonthCost}`, color: 'text-coral-500', bg: 'bg-coral-50' },
          { icon: Clock, label: '待完成任务数', value: pendingTasks, color: 'text-amber-500', bg: 'bg-amber-50' },
          { icon: AlertTriangle, label: '异常指标数', value: abnormalCount, color: 'text-red-500', bg: 'bg-red-50' },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl p-4`}>
            <item.icon size={20} className={item.color} />
            <p className="text-2xl font-bold mt-2 text-gray-800">{item.value}</p>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" /> 复诊按时率
          </h2>
          <div className="flex items-center justify-center">
            <div className="relative w-36 h-36">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: totalVisits > 0
                    ? `conic-gradient(#22c55e 0% ${onTimeRate}%, #f59e0b ${onTimeRate}% ${onTimeRate + Math.round((delayed / totalVisits) * 100)}%, #ef4444 ${onTimeRate + Math.round((delayed / totalVisits) * 100)}% 100%)`
                    : '#e5e7eb',
                }}
              />
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{onTimeRate}%</span>
                <span className="text-xs text-gray-400">按时率</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {[
              { label: '按时次数', value: onTime, color: 'text-green-500' },
              { label: '延期次数', value: delayed, color: 'text-amber-500' },
              { label: '错过次数', value: missed, color: 'text-red-500' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-coral-500" /> 费用统计
          </h2>
          <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
            <span>近6个月</span>
            <div className="flex gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-coral-500" />{COST_TYPE_LABELS.medication} ¥{medTotal}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />{COST_TYPE_LABELS.examination} ¥{examTotal}</span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-32">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center" style={{ height: '120px' }}>
                  <div className="w-full flex-1 flex flex-col justify-end gap-0.5">
                    <div
                      className="w-full bg-amber-500 rounded-t"
                      style={{ height: maxCost > 0 ? `${(d.exam / maxCost) * 80}px` : '0px' }}
                    />
                    <div
                      className="w-full bg-coral-500 rounded-b"
                      style={{ height: maxCost > 0 ? `${(d.med / maxCost) * 80}px` : '0px' }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
