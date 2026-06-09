import { useMemo } from 'react'
import { Wallet, TrendingUp, Clock } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatTime, formatDate, formatDuration, calcShiftEarning, isThisMonth, formatMoney } from '@/utils/helpers'
import Accordion from '@/components/Accordion'

export default function Income() {
  const shifts = useStore((s) => s.shifts)
  const jobs = useStore((s) => s.jobs)

  const monthShifts = useMemo(() => shifts.filter((s) => isThisMonth(s.startTime)), [shifts])

  const jobMap = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, j])), [jobs])

  const totalIncome = useMemo(
    () =>
      monthShifts.reduce((sum, s) => {
        const job = jobMap[s.jobId]
        return sum + calcShiftEarning({ ...s, hourlyRate: job?.hourlyRate ?? 0 })
      }, 0),
    [monthShifts, jobMap]
  )

  const pendingIncome = useMemo(
    () =>
      monthShifts
        .filter((s) => s.status === 'pending')
        .reduce((sum, s) => {
          const job = jobMap[s.jobId]
          return sum + calcShiftEarning({ ...s, hourlyRate: job?.hourlyRate ?? 0 })
        }, 0),
    [monthShifts, jobMap]
  )

  const settledIncome = totalIncome - pendingIncome

  const grouped = useMemo(() => {
    const map = new Map<string, typeof monthShifts>()
    monthShifts.forEach((s) => {
      const list = map.get(s.jobId) ?? []
      list.push(s)
      map.set(s.jobId, list)
    })
    return map
  }, [monthShifts])

  if (monthShifts.length === 0) {
    return (
      <div className="px-4 pt-14 pb-6 min-h-screen bg-stone-50">
        <h1 className="text-xl font-bold text-stone-800 mb-6">收入明细</h1>
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Wallet size={48} strokeWidth={1.5} className="mb-4" />
          <p className="text-base">本月暂无收入记录</p>
          <p className="text-sm mt-1">添加班次后即可查看收入</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-14 pb-6 min-h-screen bg-stone-50">
      <h1 className="text-xl font-bold text-stone-800 mb-6">收入明细</h1>

      <div className="rounded-2xl p-5 mb-6 bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-200">
        <div className="flex items-center gap-2 mb-3 opacity-90">
          <Wallet size={16} />
          <span className="text-sm font-medium">本月总收入</span>
        </div>
        <div className="text-3xl font-bold mb-4">{formatMoney(totalIncome)}</div>
        <div className="flex gap-6">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-green-200" />
            <span className="text-xs opacity-90">已结算</span>
            <span className="text-sm font-semibold">{formatMoney(settledIncome)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-blue-200" />
            <span className="text-xs opacity-90">待结算</span>
            <span className="text-sm font-semibold">{formatMoney(pendingIncome)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {Array.from(grouped.entries()).map(([jobId, jobShifts]) => {
          const job = jobMap[jobId]
          if (!job) return null

          const subtotal = jobShifts.reduce(
            (sum, s) => sum + calcShiftEarning({ ...s, hourlyRate: job.hourlyRate }),
            0
          )
          const jobPending = jobShifts
            .filter((s) => s.status === 'pending')
            .reduce((sum, s) => sum + calcShiftEarning({ ...s, hourlyRate: job.hourlyRate }), 0)

          return (
            <Accordion
              key={jobId}
              count={jobShifts.length}
              title={
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: job.color }}
                  />
                  <span className="font-medium text-stone-700 text-sm">{job.name}</span>
                  <span className="text-orange-500 font-semibold text-sm ml-auto mr-2">
                    {formatMoney(subtotal)}
                  </span>
                  {jobPending > 0 && (
                    <span className="text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                      待{formatMoney(jobPending)}
                    </span>
                  )}
                </div>
              }
            >
              {jobShifts
                .sort((a, b) => b.startTime - a.startTime)
                .map((shift) => {
                  const earning = calcShiftEarning({ ...shift, hourlyRate: job.hourlyRate })
                  const hours = (shift.endTime - shift.startTime) / 3600000
                  const basePay = hours * job.hourlyRate
                  const isSettled = shift.status === 'settled'

                  return (
                    <div
                      key={shift.id}
                      className="bg-white rounded-xl p-4 border border-stone-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-stone-700">
                          {formatDate(shift.startTime)} {formatTime(shift.startTime)}-{formatTime(shift.endTime)}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isSettled
                              ? 'bg-green-50 text-green-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {isSettled ? '已结算' : '待结算'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-stone-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDuration(shift.startTime, shift.endTime)}
                        </span>
                        <span>时薪 {formatMoney(job.hourlyRate)}/h</span>
                      </div>

                      <div className="space-y-1 text-xs text-stone-500">
                        <div className="flex justify-between">
                          <span>基本工资</span>
                          <span>{formatMoney(basePay)}</span>
                        </div>
                        {shift.transportFee > 0 && (
                          <div className="flex justify-between">
                            <span>交通补贴</span>
                            <span>+{formatMoney(shift.transportFee)}</span>
                          </div>
                        )}
                        {shift.mealAllowance > 0 && (
                          <div className="flex justify-between">
                            <span>餐饮补贴</span>
                            <span>+{formatMoney(shift.mealAllowance)}</span>
                          </div>
                        )}
                        {shift.lateDeduction > 0 && (
                          <div className="flex justify-between text-red-500">
                            <span>迟到扣款</span>
                            <span>-{formatMoney(shift.lateDeduction)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-1.5 border-t border-stone-100 text-stone-800 font-semibold">
                          <span>合计</span>
                          <span className="text-orange-500">{formatMoney(earning)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </Accordion>
          )
        })}
      </div>
    </div>
  )
}
