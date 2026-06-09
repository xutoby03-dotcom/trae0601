import { useMemo } from 'react'
import { BarChart3, Battery, AlertTriangle, Zap, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subDays } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useStore } from '@/store/useStore'
import { SIDE_LABELS } from '@/types'

const AMBER = '#E8913A'
const INDIGO = '#2D3A4A'
const BG = '#FDF8F3'
const RED = '#EF4444'
const ORANGE = '#F97316'
const GREEN = '#22C55E'

export default function Statistics() {
  const { hearingAids, dailyRecords } = useStore()

  const batteryStats = useMemo(() => {
    return hearingAids.map((aid) => {
      const records = dailyRecords.filter((r) => r.aidId === aid.id)
      if (records.length === 0) {
        return { aid, avgHours: 0, avgBattery: 0, recordCount: 0 }
      }
      const avgHours = records.reduce((s, r) => s + r.wearingHours, 0) / records.length
      const avgBattery = records.reduce((s, r) => s + r.batteryLevel, 0) / records.length
      return { aid, avgHours: Math.round(avgHours * 10) / 10, avgBattery: Math.round(avgBattery), recordCount: records.length }
    })
  }, [hearingAids, dailyRecords])

  const wearingHoursData = useMemo(
    () =>
      batteryStats.map((s) => ({
        name: `${SIDE_LABELS[s.aid.side]} ${s.aid.model}`,
        hours: s.avgHours,
      })),
    [batteryStats]
  )

  const issueAnalysis = useMemo(() => {
    const left = dailyRecords.filter((r) => {
      const aid = hearingAids.find((a) => a.id === r.aidId)
      return aid?.side === 'left' && (r.hasWhistling || r.hasHearingIssue)
    }).length
    const right = dailyRecords.filter((r) => {
      const aid = hearingAids.find((a) => a.id === r.aidId)
      return aid?.side === 'right' && (r.hasWhistling || r.hasHearingIssue)
    }).length
    const pieData = [
      { name: '左耳', value: left },
      { name: '右耳', value: right },
    ]
    const moreIssues = left > right ? '左耳' : right > left ? '右耳' : null
    return { left, right, pieData, moreIssues }
  }, [hearingAids, dailyRecords])

  const chargingStats = useMemo(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const monthRecords = dailyRecords.filter((r) => {
      const d = parseISO(r.date)
      return isWithinInterval(d, { start: monthStart, end: monthEnd })
    })

    const forgotDays = new Set(
      monthRecords.filter((r) => !r.isCharging && r.batteryLevel < 30).map((r) => r.date)
    ).size

    const last30 = subDays(now, 29)
    const recentRecords = dailyRecords.filter((r) => {
      const d = parseISO(r.date)
      return isWithinInterval(d, { start: last30, end: now })
    })

    const dailyBattery: Record<string, number[]> = {}
    recentRecords.forEach((r) => {
      if (!dailyBattery[r.date]) dailyBattery[r.date] = []
      dailyBattery[r.date].push(r.batteryLevel)
    })

    const barData = Object.entries(dailyBattery)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, levels]) => ({
        date: format(parseISO(date), 'MM/dd'),
        level: Math.round(levels.reduce((s, v) => s + v, 0) / levels.length),
        fill: Math.round(levels.reduce((s, v) => s + v, 0) / levels.length) < 20 ? RED : Math.round(levels.reduce((s, v) => s + v, 0) / levels.length) < 50 ? ORANGE : GREEN,
      }))

    const daysWithRecords = new Set(monthRecords.map((r) => r.date)).size
    const daysWithCharging = new Set(monthRecords.filter((r) => r.isCharging).map((r) => r.date)).size
    const chargingFreq = daysWithRecords > 0 ? Math.round((daysWithCharging / daysWithRecords) * 100) : 0

    return { forgotDays, barData, chargingFreq }
  }, [dailyRecords])

  const noData = dailyRecords.length === 0

  return (
    <div style={{ backgroundColor: BG }} className="min-h-screen p-4 pb-8 space-y-6">
      <h1 className="text-xl font-bold" style={{ color: INDIGO }}>
        <BarChart3 className="inline w-5 h-5 mr-2" style={{ color: AMBER }} />
        数据统计
      </h1>

      {noData ? (
        <div className="text-center py-20" style={{ color: INDIGO }}>
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm opacity-60">暂无记录数据</p>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: INDIGO }}>
              <Battery className="w-4 h-4" style={{ color: AMBER }} />
              续航统计
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {batteryStats.map((s) => (
                <div key={s.aid.id} className="rounded-xl p-3 shadow-sm" style={{ backgroundColor: '#fff' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.aid.side === 'left' ? AMBER : INDIGO }} />
                    <span className="text-xs font-medium truncate" style={{ color: INDIGO }}>
                      {SIDE_LABELS[s.aid.side]} {s.aid.model}
                    </span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: AMBER }}>
                    {s.avgHours}<span className="text-xs font-normal ml-1" style={{ color: INDIGO }}>小时/天</span>
                  </div>
                  <div className="text-xs mt-1 flex items-center gap-1" style={{ color: INDIGO, opacity: 0.7 }}>
                    <Battery className="w-3 h-3" />平均电量 {s.avgBattery}%
                  </div>
                </div>
              ))}
            </div>
            {wearingHoursData.length > 0 && (
              <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={wearingHoursData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: INDIGO }} />
                    <YAxis tick={{ fontSize: 11, fill: INDIGO }} />
                    <Tooltip />
                    <Bar dataKey="hours" fill={AMBER} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: INDIGO }}>
              <AlertTriangle className="w-4 h-4" style={{ color: AMBER }} />
              问题分析
            </h2>
            <div className="rounded-xl p-4 shadow-sm flex items-center gap-4" style={{ backgroundColor: '#fff' }}>
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie
                    data={issueAnalysis.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => value > 0 ? `${name} ${value}` : ''}
                  >
                    <Cell fill={AMBER} />
                    <Cell fill={INDIGO} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                <div className="text-sm" style={{ color: INDIGO }}>
                  <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: AMBER }} />
                  左耳: {issueAnalysis.left}次
                </div>
                <div className="text-sm" style={{ color: INDIGO }}>
                  <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: INDIGO }} />
                  右耳: {issueAnalysis.right}次
                </div>
                {issueAnalysis.moreIssues && (
                  <div className="text-xs font-semibold mt-2 px-2 py-1 rounded-lg" style={{ backgroundColor: '#FEF3E2', color: AMBER }}>
                    <AlertTriangle className="inline w-3 h-3 mr-1" />
                    {issueAnalysis.moreIssues}问题较多
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: INDIGO }}>
              <Zap className="w-4 h-4" style={{ color: AMBER }} />
              充电习惯
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 shadow-sm text-center" style={{ backgroundColor: '#fff' }}>
                <Clock className="w-5 h-5 mx-auto mb-1" style={{ color: chargingStats.forgotDays > 0 ? RED : GREEN }} />
                <div className="text-3xl font-bold" style={{ color: chargingStats.forgotDays > 0 ? RED : GREEN }}>
                  {chargingStats.forgotDays}
                </div>
                <div className="text-xs mt-1" style={{ color: INDIGO, opacity: 0.7 }}>本月忘记充电天数</div>
              </div>
              <div className="rounded-xl p-4 shadow-sm text-center" style={{ backgroundColor: '#fff' }}>
                <Zap className="w-5 h-5 mx-auto mb-1" style={{ color: AMBER }} />
                <div className="text-3xl font-bold" style={{ color: AMBER }}>
                  {chargingStats.chargingFreq}%
                </div>
                <div className="text-xs mt-1" style={{ color: INDIGO, opacity: 0.7 }}>充电频率</div>
              </div>
            </div>
            {chargingStats.barData.length > 0 && (
              <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chargingStats.barData}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: INDIGO }} />
                    <YAxis tick={{ fontSize: 11, fill: INDIGO }} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="level" radius={[4, 4, 0, 0]}>
                      {chargingStats.barData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
