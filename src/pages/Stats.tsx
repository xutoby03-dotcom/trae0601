import { BarChart3, Clock, MapPin, CalendarX, TrendingUp, DollarSign } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { calcShiftEarning, isThisMonth, formatMoney } from '@/utils/helpers'

interface JobStats {
  jobId: string
  name: string
  color: string
  totalIncome: number
  totalHours: number
  totalCommute: number
  shiftCount: number
  absenceCount: number
}

export default function Stats() {
  const { shifts, jobs, leaveSwaps } = useStore()

  const monthShifts = shifts.filter((s) => isThisMonth(s.startTime))
  const shiftMap = new Map(shifts.map((s) => [s.id, s]))
  const monthLeaves = leaveSwaps.filter((l) => {
    if (l.type !== 'leave') return false
    const shift = shiftMap.get(l.shiftId)
    return shift ? isThisMonth(shift.startTime) : false
  })

  const jobStats: JobStats[] = jobs.map((job) => {
    const jobShifts = monthShifts.filter((s) => s.jobId === job.id)
    const jobLeaves = monthLeaves.filter((l) => l.jobId === job.id)
    const totalIncome = jobShifts.reduce((sum, s) => sum + calcShiftEarning({ ...s, hourlyRate: job.hourlyRate }), 0)
    const totalHours = jobShifts.reduce((sum, s) => sum + (s.endTime - s.startTime) / 3600000, 0)
    const totalCommute = jobShifts.reduce((sum, s) => sum + s.commuteMinutes, 0)
    return {
      jobId: job.id,
      name: job.name,
      color: job.color,
      totalIncome,
      totalHours,
      totalCommute,
      shiftCount: jobShifts.length,
      absenceCount: jobLeaves.length,
    }
  })

  const totalIncome = jobStats.reduce((s, j) => s + j.totalIncome, 0)
  const totalHours = jobStats.reduce((s, j) => s + j.totalHours, 0)
  const totalCommute = jobStats.reduce((s, j) => s + j.totalCommute, 0)
  const totalShifts = jobStats.reduce((s, j) => s + j.shiftCount, 0)
  const totalAbsences = monthLeaves.length
  const avgHourlyRate = totalHours > 0 ? totalIncome / totalHours : 0

  const sortedByIncome = [...jobStats].sort((a, b) => b.totalIncome - a.totalIncome)
  const maxIncome = sortedByIncome.length > 0 ? sortedByIncome[0].totalIncome : 0

  if (monthShifts.length === 0 && monthLeaves.length === 0) {
    return (
      <div className="px-5 pt-14 pb-6">
        <h1 className="text-2xl font-bold text-stone-900">统计分析</h1>
        <div className="flex flex-col items-center justify-center py-24 text-stone-400">
          <BarChart3 size={48} strokeWidth={1.5} />
          <p className="mt-4 text-sm">本月暂无数据</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 pt-14 pb-6">
      <h1 className="text-2xl font-bold text-stone-900">统计分析</h1>

      {sortedByIncome.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-stone-500 mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} />
            最赚钱兼职
          </h2>
          <div className="bg-stone-50 rounded-xl p-4 space-y-3">
            {sortedByIncome.map((job) => (
              <div key={job.jobId} className="flex items-center gap-3">
                <span className="text-xs text-stone-600 w-16 truncate shrink-0">{job.name}</span>
                <div className="flex-1 h-6 bg-stone-200 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: maxIncome > 0 ? `${(job.totalIncome / maxIncome) * 100}%` : '0%',
                      backgroundColor: job.color,
                      minWidth: job.totalIncome > 0 ? '2rem' : '0',
                    }}
                  >
                    {job.totalIncome > 0 && (
                      <span className="text-[10px] font-semibold text-white whitespace-nowrap">
                        {formatMoney(job.totalIncome)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-stone-500 mb-3">本月概览</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-orange-500 mb-1">
              <DollarSign size={14} />
              <span className="text-[11px] font-medium">平均时薪</span>
            </div>
            <p className="text-lg font-bold text-stone-900">{formatMoney(avgHourlyRate)}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-blue-500 mb-1">
              <MapPin size={14} />
              <span className="text-[11px] font-medium">总通勤时间</span>
            </div>
            <p className="text-lg font-bold text-stone-900">
              {totalCommute >= 60
                ? `${Math.floor(totalCommute / 60)}小时${totalCommute % 60 > 0 ? `${totalCommute % 60}分` : ''}`
                : `${totalCommute}分钟`}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-green-500 mb-1">
              <Clock size={14} />
              <span className="text-[11px] font-medium">总班次数</span>
            </div>
            <p className="text-lg font-bold text-stone-900">{totalShifts}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-red-500 mb-1">
              <CalendarX size={14} />
              <span className="text-[11px] font-medium">缺勤次数</span>
            </div>
            <p className="text-lg font-bold text-stone-900">{totalAbsences}</p>
          </div>
        </div>
      </section>

      {jobStats.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-stone-500 mb-3">各兼职详情</h2>
          <div className="space-y-3">
            {jobStats.map((job) => {
              const avgRate = job.totalHours > 0 ? job.totalIncome / job.totalHours : 0
              const avgCommute = job.shiftCount > 0 ? Math.round(job.totalCommute / job.shiftCount) : 0
              return (
                <div key={job.jobId} className="bg-stone-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: job.color }} />
                    <span className="text-sm font-semibold text-stone-900 truncate">{job.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[10px] text-stone-400">平均时薪</p>
                      <p className="text-sm font-bold text-stone-800">{formatMoney(avgRate)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400">平均通勤</p>
                      <p className="text-sm font-bold text-stone-800">{avgCommute}分钟</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400">缺勤次数</p>
                      <p className="text-sm font-bold text-stone-800">{job.absenceCount}次</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
