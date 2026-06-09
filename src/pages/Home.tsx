import { useMemo } from 'react'
import { CalendarDays, Clock, Wallet, Bell } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatTime, formatDate, formatDuration, calcShiftEarning, isThisWeek, isThisMonth, isUpcoming, getWeekday, formatMoney } from '@/utils/helpers'
import Accordion from '@/components/Accordion'

export default function Home() {
  const { jobs, shifts } = useStore()
  const today = useMemo(() => new Date(), [])

  const jobMap = useMemo(() => {
    const m = new Map<string, (typeof jobs)[0]>()
    jobs.forEach((j) => m.set(j.id, j))
    return m
  }, [jobs])

  const upcomingShifts = useMemo(
    () => shifts.filter((s) => isUpcoming(s.startTime)).sort((a, b) => a.startTime - b.startTime),
    [shifts]
  )

  const weekShifts = useMemo(
    () => shifts.filter((s) => isThisWeek(s.startTime)).sort((a, b) => a.startTime - b.startTime),
    [shifts]
  )

  const monthShifts = useMemo(() => shifts.filter((s) => isThisMonth(s.startTime)), [shifts])

  const monthTotal = useMemo(
    () =>
      monthShifts.reduce((sum, s) => {
        const job = jobMap.get(s.jobId)
        return sum + calcShiftEarning({ ...s, hourlyRate: job?.hourlyRate ?? 0 })
      }, 0),
    [monthShifts, jobMap]
  )

  const monthUnpaid = useMemo(
    () =>
      monthShifts
        .filter((s) => s.status === 'pending')
        .reduce((sum, s) => {
          const job = jobMap.get(s.jobId)
          return sum + calcShiftEarning({ ...s, hourlyRate: job?.hourlyRate ?? 0 })
        }, 0),
    [monthShifts, jobMap]
  )

  const pendingShifts = useMemo(
    () => shifts.filter((s) => s.status === 'pending').sort((a, b) => a.startTime - b.startTime),
    [shifts]
  )

  const settledShifts = useMemo(
    () => shifts.filter((s) => s.status === 'settled').sort((a, b) => b.startTime - a.startTime),
    [shifts]
  )

  const todayStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">兼职排班管家</h1>
          <p className="text-sm text-stone-400 mt-0.5">{todayStr}</p>
        </div>
        <CalendarDays size={22} className="text-orange-500" />
      </div>

      {upcomingShifts.length > 0 && (
        <div className="animate-pulse-soft bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={18} />
            <span className="font-semibold text-sm">即将开始</span>
          </div>
          {upcomingShifts.map((s) => {
            const job = jobMap.get(s.jobId)
            return (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{job?.name ?? '未知'}</span>
                <span>{formatTime(s.startTime)} - {formatTime(s.endTime)}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={18} />
          <span className="text-sm font-medium opacity-90">本月收入</span>
        </div>
        <p className="text-3xl font-bold tracking-tight">{formatMoney(monthTotal)}</p>
        <div className="mt-3 flex items-center gap-1 text-sm opacity-80">
          <span>待结算</span>
          <span className="font-semibold">{formatMoney(monthUnpaid)}</span>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-stone-700 mb-3">本周班次</h2>
        {weekShifts.length === 0 ? (
          <p className="text-sm text-stone-400 py-4 text-center">本周暂无班次</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {weekShifts.map((s) => {
              const job = jobMap.get(s.jobId)
              const earning = calcShiftEarning({ ...s, hourlyRate: job?.hourlyRate ?? 0 })
              return (
                <div
                  key={s.id}
                  className="flex-shrink-0 w-44 bg-white rounded-2xl p-4 border border-stone-100 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: job?.color ?? '#F97316' }} />
                    <span className="text-sm font-medium text-stone-700 truncate">{job?.name ?? '未知'}</span>
                  </div>
                  <p className="text-xs text-stone-400 mb-1">
                    {getWeekday(s.startTime)} {formatDate(s.startTime)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-stone-500 mb-2">
                    <Clock size={12} />
                    <span>{formatTime(s.startTime)} - {formatTime(s.endTime)}</span>
                  </div>
                  <p className="text-sm font-semibold text-orange-500">{formatMoney(earning)}</p>
                  {s.status === 'settled' && (
                    <span className="inline-block mt-1 text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">已结算</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <Accordion
          title={<span className="text-sm font-semibold text-stone-700">待结算</span>}
          count={pendingShifts.length}
          defaultOpen={true}
        >
          {pendingShifts.length === 0 ? (
            <p className="text-sm text-stone-400 py-3 text-center">暂无待结算班次</p>
          ) : (
            pendingShifts.map((s) => {
              const job = jobMap.get(s.jobId)
              const earning = calcShiftEarning({ ...s, hourlyRate: job?.hourlyRate ?? 0 })
              return (
                <div key={s.id} className="bg-white rounded-xl p-3 border border-stone-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: job?.color ?? '#F97316' }} />
                      <span className="text-sm font-medium text-stone-700">{job?.name ?? '未知'}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">待结算</span>
                    </div>
                    <span className="text-sm font-semibold text-orange-500">{formatMoney(earning)}</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1.5">
                    {formatDate(s.startTime)} {getWeekday(s.startTime)} {formatTime(s.startTime)}-{formatTime(s.endTime)}
                    <span className="ml-1.5">{formatDuration(s.startTime, s.endTime)}</span>
                  </p>
                </div>
              )
            })
          )}
        </Accordion>

        <Accordion
          title={<span className="text-sm font-semibold text-stone-700">已结算</span>}
          count={settledShifts.length}
          defaultOpen={false}
        >
          {settledShifts.length === 0 ? (
            <p className="text-sm text-stone-400 py-3 text-center">暂无已结算班次</p>
          ) : (
            settledShifts.map((s) => {
              const job = jobMap.get(s.jobId)
              const earning = calcShiftEarning({ ...s, hourlyRate: job?.hourlyRate ?? 0 })
              return (
                <div key={s.id} className="bg-white rounded-xl p-3 border border-stone-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: job?.color ?? '#F97316' }} />
                      <span className="text-sm font-medium text-stone-700">{job?.name ?? '未知'}</span>
                      <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">已结算</span>
                    </div>
                    <span className="text-sm font-semibold text-stone-500">{formatMoney(earning)}</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1.5">
                    {formatDate(s.startTime)} {getWeekday(s.startTime)} {formatTime(s.startTime)}-{formatTime(s.endTime)}
                    <span className="ml-1.5">{formatDuration(s.startTime, s.endTime)}</span>
                  </p>
                </div>
              )
            })
          )}
        </Accordion>
      </div>
    </div>
  )
}
