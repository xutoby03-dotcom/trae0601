import { useMemo } from 'react'
import { Printer } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { detectAnomalies } from '@/utils/anomaly'
import { cn } from '@/lib/utils'

interface HandoverCardProps {
  planId: string
}

const anomalyLabels: Record<string, string> = {
  extension: '舒展度异常',
  float: '漂浮异常',
  feeding: '摄食异常',
  collision: '撞壁异常',
}

function ParamTable({ title, schedule }: { title: string; schedule: { blueRatio: number; whiteRatio: number; purpleRatio: number; brightness: number } | undefined }) {
  if (!schedule) return null

  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 print:text-gray-600">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 print:text-gray-600">
            <th className="pb-1 text-left font-medium">蓝光</th>
            <th className="pb-1 text-left font-medium">白光</th>
            <th className="pb-1 text-left font-medium">紫光</th>
            <th className="pb-1 text-left font-medium">亮度</th>
          </tr>
        </thead>
        <tbody>
          <tr className="text-gray-200 print:text-gray-900">
            <td className="py-1">{schedule.blueRatio}%</td>
            <td className="py-1">{schedule.whiteRatio}%</td>
            <td className="py-1">{schedule.purpleRatio}%</td>
            <td className="py-1">{schedule.brightness}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function AdjustmentRecord({
  targetDay,
  original,
  adjusted,
  reason,
}: {
  targetDay: number
  original: { blue: number; white: number; purple: number; brightness: number }
  adjusted: { blue: number; white: number; purple: number; brightness: number }
  reason: string
}) {
  const rows = [
    { label: '蓝光', orig: original.blue, adj: adjusted.blue },
    { label: '白光', orig: original.white, adj: adjusted.white },
    { label: '紫光', orig: original.purple, adj: adjusted.purple },
    { label: '亮度', orig: original.brightness, adj: adjusted.brightness },
  ]

  return (
    <div className="mb-3 rounded border border-gray-700/40 print:border-gray-400 bg-gray-800/30 print:bg-gray-50 p-2.5 print:break-inside-avoid">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-emerald-400 print:text-emerald-700">
          第{targetDay + 1}天 已应用
        </span>
        <span className="rounded-full bg-emerald-500/15 print:bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-400 print:text-emerald-700">
          已应用
        </span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[10px] text-gray-500 print:text-gray-600">
            <th className="pb-0.5 text-left font-normal">参数</th>
            <th className="pb-0.5 text-right font-normal">原值</th>
            <th className="pb-0.5 text-center font-normal">→</th>
            <th className="pb-0.5 text-right font-normal">调整后</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const diff = row.adj - row.orig
            const colorClass = diff < 0
              ? 'text-red-400 print:text-red-700'
              : diff === 0
                ? 'text-emerald-400 print:text-emerald-700'
                : 'text-blue-400 print:text-blue-700'
            return (
              <tr key={row.label} className="text-[11px] text-gray-300 print:text-gray-800">
                <td className="py-0.5">{row.label}</td>
                <td className="py-0.5 text-right text-gray-400 print:text-gray-600">{row.orig}%</td>
                <td className="py-0.5 text-center text-gray-500">→</td>
                <td className={cn('py-0.5 text-right font-medium', colorClass)}>
                  {row.adj}%
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="mt-1 text-[10px] text-gray-400 print:text-gray-600 leading-relaxed">
        {reason}
      </p>
    </div>
  )
}

export default function HandoverCard({ planId }: HandoverCardProps) {
  const plan = useStore(s => s.plans.find(p => p.id === planId))
  const schedules = useStore(s => s.schedules.filter(s => s.planId === planId))
  const observations = useStore(s => s.observations.filter(o => o.planId === planId))
  const appliedAdjustments = useStore(s => s.appliedAdjustments.filter(a => a.planId === planId))

  const anomalies = useMemo(() => detectAnomalies(observations), [observations])

  const sortedSchedules = useMemo(
    () => [...schedules].sort((a, b) => a.dayIndex - b.dayIndex),
    [schedules]
  )

  const sortedAdjustments = useMemo(
    () => [...appliedAdjustments].sort((a, b) => a.targetDay - b.targetDay),
    [appliedAdjustments]
  )

  const todayIndex = useMemo(() => {
    if (!plan) return 0
    const start = new Date(plan.startDate)
    const now = new Date()
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, Math.min(diff, plan.totalDays - 1))
  }, [plan])

  const currentSchedule = sortedSchedules.find(s => s.dayIndex === todayIndex)
  const nextSchedule = sortedSchedules.find(s => s.dayIndex === todayIndex + 1)

  if (!plan) return null

  const handlePrint = () => window.print()

  return (
    <>
      <button
        onClick={handlePrint}
        className="print-action mb-4 flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
      >
        <Printer className="h-4 w-4" />
        打印交接卡
      </button>

      <div
        className={cn(
          'handover-card mx-auto rounded-xl border border-gray-700/50 bg-gray-900 p-6 text-gray-100',
          'print:border-gray-300 print:bg-white print:text-gray-900 print:shadow-none',
          'print:break-after-page'
        )}
        style={{ maxWidth: '210mm', minHeight: '148mm' }}
      >
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 print:border-gray-300">
          <h1 className="text-xl font-bold tracking-wide">灯谱交接卡</h1>
          <svg width="60" height="20" viewBox="0 0 60 20" className="text-indigo-500 print:text-gray-400">
            <path d="M0 10 Q7.5 0 15 10 Q22.5 20 30 10 Q37.5 0 45 10 Q52.5 20 60 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="text-gray-400 print:text-gray-600">缸号：</span>
            <span className="font-medium">{plan.tankNumber}</span>
          </div>
          <div>
            <span className="text-gray-400 print:text-gray-600">品种：</span>
            <span className="font-medium">{plan.species}</span>
          </div>
          <div>
            <span className="text-gray-400 print:text-gray-600">驯化周期：</span>
            <span className="font-medium">{plan.totalDays}天</span>
          </div>
          <div>
            <span className="text-gray-400 print:text-gray-600">开始日期：</span>
            <span className="font-medium">{plan.startDate}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-6">
          <ParamTable title={`第${todayIndex + 1}天参数（当日）`} schedule={currentSchedule} />
          <ParamTable title={`第${todayIndex + 2}天参数（次日）`} schedule={nextSchedule} />
        </div>

        <div className="mt-3">
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 print:text-gray-600">异常摘要</h3>
          {anomalies.length === 0 ? (
            <p className="text-sm text-emerald-400 print:text-emerald-700">暂无异常</p>
          ) : (
            <ul className="flex flex-col gap-0.5 text-sm">
              {anomalies.map((a, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-block h-1.5 w-1.5 rounded-full',
                      a.severity === 'critical' ? 'bg-red-500 print:bg-red-700' : 'bg-yellow-500 print:bg-yellow-600'
                    )}
                  />
                  <span>
                    {anomalyLabels[a.type] ?? a.type}（第{a.dayIndices.map(d => d + 1).join('、')}天）
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-3">
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 print:text-gray-600">调光调整记录</h3>
          {sortedAdjustments.length === 0 ? (
            <p className="text-sm text-gray-400 print:text-gray-500">暂无调整记录</p>
          ) : (
            <div>
              {sortedAdjustments.map(a => (
                <AdjustmentRecord
                  key={a.id}
                  targetDay={a.targetDay}
                  original={{ blue: a.originalBlue, white: a.originalWhite, purple: a.originalPurple, brightness: a.originalBrightness }}
                  adjusted={{ blue: a.adjustedBlue, white: a.adjustedWhite, purple: a.adjustedPurple, brightness: a.adjustedBrightness }}
                  reason={a.reason}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-3">
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 print:text-gray-600">备注</h3>
          <div className="space-y-2">
            <div className="border-b border-dashed border-gray-600 print:border-gray-400" />
            <div className="border-b border-dashed border-gray-600 print:border-gray-400" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-6">
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 print:text-gray-600">早班签收</h3>
            <div className="flex items-end gap-4 text-sm">
              <div className="flex-1">
                <span className="text-gray-400 print:text-gray-600">日期：</span>
                <span className="inline-block w-24 border-b border-dashed border-gray-600 print:border-gray-400" />
              </div>
              <div className="flex-1">
                <span className="text-gray-400 print:text-gray-600">签名：</span>
                <span className="inline-block w-24 border-b border-dashed border-gray-600 print:border-gray-400" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 print:text-gray-600">晚班签收</h3>
            <div className="flex items-end gap-4 text-sm">
              <div className="flex-1">
                <span className="text-gray-400 print:text-gray-600">日期：</span>
                <span className="inline-block w-24 border-b border-dashed border-gray-600 print:border-gray-400" />
              </div>
              <div className="flex-1">
                <span className="text-gray-400 print:text-gray-600">签名：</span>
                <span className="inline-block w-24 border-b border-dashed border-gray-600 print:border-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .handover-card,
          .handover-card * {
            visibility: visible;
          }
          .handover-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none;
            margin: 10mm;
            border-radius: 0;
          }
          .print-action {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}
