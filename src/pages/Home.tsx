import { useStore } from '@/store/useStore'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  Server,
  Sparkles,
  Timer,
  Wind,
  ArrowRight,
  CalendarClock,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'

function CountdownRing({ days, total }: { days: number; total: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(1, days / total))
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius / 2.2}
          fill="none"
          stroke="rgba(53,53,96,0.5)"
          strokeWidth="4"
        />
        <circle
          cx="50"
          cy="50"
          r={radius / 2.2}
          fill="none"
          stroke={days <= 3 ? '#DC2626' : days <= 7 ? '#F59E0B' : '#22C55E'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={(circumference / 2.2).toString()}
          strokeDashoffset={(strokeDashoffset / 2.2).toString()}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl text-white">{days}</span>
        <span className="text-[10px] text-surface-300">天</span>
      </div>
    </div>
  )
}

export default function Home() {
  const devices = useStore((s) => s.devices)
  const dryingRecords = useStore((s) => s.dryingRecords)
  const cleaningRecords = useStore((s) => s.cleaningRecords)
  const nextDeepCleanDate = useStore((s) => s.nextDeepCleanDate)
  const getConsecutiveUncleaned = useStore((s) => s.getConsecutiveUncleaned)
  const getAverageDuration = useStore((s) => s.getAverageDuration)
  const isDurationAbnormal = useStore((s) => s.isDurationAbnormal)

  const devicesNeedingClean = devices.filter(
    (d) => getConsecutiveUncleaned(d.id) >= 1
  )

  const recentRecords = [...dryingRecords]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)

  const abnormalRecords = dryingRecords.filter((r) => isDurationAbnormal(r))

  const daysUntilDeepClean = (() => {
    if (!nextDeepCleanDate) return null
    const diff = Math.ceil(
      (new Date(nextDeepCleanDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return diff
  })()

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Wind className="w-6 h-6 text-brand-400" />
          <h2 className="font-display text-xl tracking-wider text-brand-400">
            DASHBOARD
          </h2>
        </div>
        <p className="text-surface-300 text-sm font-body">
          烘干机绒毛清理监控面板
        </p>
      </header>

      {devices.length === 0 && (
        <div className="bg-surface-700/50 rounded-xl border border-surface-500/30 p-8 text-center animate-fade-in">
          <Server className="w-12 h-12 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2 font-body">
            尚未添加烘干机设备
          </h3>
          <p className="text-surface-300 text-sm mb-4 font-body">
            请先添加您的烘干机设备，开始使用绒毛卫士
          </p>
          <Link
            to="/device"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm transition-all duration-200 hover:-translate-y-0.5 font-body"
          >
            添加设备
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {devices.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface-700/50 rounded-xl border border-surface-500/30 p-5 animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center">
                  <Server className="w-4 h-4 text-brand-400" />
                </div>
                <span className="text-xs text-surface-300 font-body">
                  设备总数
                </span>
              </div>
              <p className="font-display text-3xl text-white">
                {devices.length}
              </p>
            </div>

            <div className="bg-surface-700/50 rounded-xl border border-surface-500/30 p-5 animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-warning-500/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-warning-400" />
                </div>
                <span className="text-xs text-surface-300 font-body">
                  待清理
                </span>
              </div>
              <p className="font-display text-3xl text-warning-400">
                {devicesNeedingClean.length}
              </p>
            </div>

            <div className="bg-surface-700/50 rounded-xl border border-surface-500/30 p-5 animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-danger-500/15 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-danger-400" />
                </div>
                <span className="text-xs text-surface-300 font-body">
                  异常耗时
                </span>
              </div>
              <p className="font-display text-3xl text-danger-400">
                {abnormalRecords.length}
              </p>
            </div>

            <div className="bg-surface-700/50 rounded-xl border border-surface-500/30 p-5 animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-success-500/15 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-success-400" />
                </div>
                <span className="text-xs text-surface-300 font-body">
                  烘干次数
                </span>
              </div>
              <p className="font-display text-3xl text-white">
                {dryingRecords.length}
              </p>
            </div>
          </div>

          {devicesNeedingClean.length > 0 && (
            <div
              className={`mb-6 rounded-xl border p-5 animate-slide-up ${
                devices.some((d) => getConsecutiveUncleaned(d.id) >= 3)
                  ? 'bg-danger-500/10 border-danger-500/40 animate-glow'
                  : 'bg-warning-500/10 border-warning-500/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle
                  className={`w-5 h-5 ${
                    devices.some((d) => getConsecutiveUncleaned(d.id) >= 3)
                      ? 'text-danger-400 animate-pulse'
                      : 'text-warning-400'
                  }`}
                />
                <h3
                  className={`text-sm font-medium font-body ${
                    devices.some((d) => getConsecutiveUncleaned(d.id) >= 3)
                      ? 'text-danger-400'
                      : 'text-warning-400'
                  }`}
                >
                  {devices.some((d) => getConsecutiveUncleaned(d.id) >= 3)
                    ? '⚠️ 安全警告：滤网连续未清理！'
                    : '滤网待清理提醒'}
                </h3>
              </div>
              <div className="space-y-2">
                {devicesNeedingClean.map((d) => {
                  const count = getConsecutiveUncleaned(d.id)
                  return (
                    <div
                      key={d.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <Wind className="w-4 h-4 text-surface-300" />
                        <span className="text-sm text-white font-body">
                          {d.model}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-body ${
                            count >= 3
                              ? 'bg-danger-500/20 text-danger-400'
                              : 'bg-warning-500/20 text-warning-400'
                          }`}
                        >
                          连续 {count} 次未清理
                        </span>
                        <Link
                          to="/cleaning"
                          className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-body"
                        >
                          去清理 →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {abnormalRecords.length > 0 && (
            <div className="mb-6 bg-danger-500/10 border border-danger-500/40 rounded-xl p-5 animate-glow">
              <div className="flex items-center gap-2 mb-3">
                <Timer className="w-5 h-5 text-danger-400 animate-pulse" />
                <h3 className="text-sm font-medium text-danger-400 font-body">
                  ⚠️ 烘干时间异常警告
                </h3>
              </div>
              <div className="space-y-2">
                {abnormalRecords.slice(0, 3).map((r) => {
                  const avg = getAverageDuration(r.deviceId)
                  const device = devices.find((d) => d.id === r.deviceId)
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-danger-400" />
                        <span className="text-sm text-white font-body">
                          {device?.model || '未知设备'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-surface-300 font-body">
                          平均 {Math.round(avg)} 分钟
                        </span>
                        <span className="text-xs text-danger-400 font-medium font-body">
                          本次 {r.duration} 分钟
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-700/50 rounded-xl border border-surface-500/30 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white font-body">
                  最近烘干批次
                </h3>
                <Link
                  to="/drying"
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-body"
                >
                  查看全部 →
                </Link>
              </div>
              {recentRecords.length === 0 ? (
                <div className="py-8 text-center text-surface-400 text-sm font-body">
                  暂无烘干记录
                </div>
              ) : (
                <div className="space-y-2">
                  {recentRecords.map((r) => {
                    const device = devices.find((d) => d.id === r.deviceId)
                    const abnormal = isDurationAbnormal(r)
                    return (
                      <div
                        key={r.id}
                        className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${
                          abnormal
                            ? 'bg-danger-500/10 border border-danger-500/20'
                            : 'bg-surface-800/50 hover:bg-surface-600/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              r.filterCleaned
                                ? 'bg-success-500/15'
                                : 'bg-danger-500/15'
                            }`}
                          >
                            {r.filterCleaned ? (
                              <CheckCircle2 className="w-4 h-4 text-success-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-danger-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-white font-body">
                              {device?.model || '未知设备'}
                            </p>
                            <p className="text-xs text-surface-400 font-body">
                              {r.clothingTypes.join('、')} · {r.weight}kg ·{' '}
                              {r.program}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-display ${
                              abnormal ? 'text-danger-400' : 'text-white'
                            }`}
                          >
                            {r.duration}
                            <span className="text-xs ml-0.5">min</span>
                          </p>
                          <p className="text-xs text-surface-400 font-body">
                            {r.date}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-surface-700/50 rounded-xl border border-surface-500/30 p-5">
              <div className="flex items-center gap-2 mb-5">
                <CalendarClock className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-medium text-white font-body">
                  深度清洁倒计时
                </h3>
              </div>
              <div className="flex flex-col items-center">
                <CountdownRing
                  days={daysUntilDeepClean ?? 0}
                  total={90}
                />
                <div className="mt-4 text-center">
                  {daysUntilDeepClean !== null ? (
                    <>
                      <p
                        className={`text-sm font-body ${
                          daysUntilDeepClean <= 3
                            ? 'text-danger-400'
                            : daysUntilDeepClean <= 7
                            ? 'text-warning-400'
                            : 'text-success-400'
                        }`}
                      >
                        {daysUntilDeepClean > 0
                          ? `${daysUntilDeepClean} 天后需深度清洁`
                          : '已到深度清洁时间！'}
                      </p>
                      <p className="text-xs text-surface-400 mt-1 font-body">
                        目标日期：{nextDeepCleanDate || '未设置'}
                      </p>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-surface-300 font-body">
                        尚未设置深度清洁日期
                      </p>
                      <Link
                        to="/cleaning"
                        className="text-xs text-brand-400 hover:text-brand-300 transition-colors mt-2 inline-block font-body"
                      >
                        去设置 →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-500/30">
                <h4 className="text-xs text-surface-300 mb-3 font-body">
                  清理统计
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-400 font-body">
                      总清理次数
                    </span>
                    <span className="text-sm font-display text-white">
                      {cleaningRecords.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-400 font-body">
                      总烘干次数
                    </span>
                    <span className="text-sm font-display text-white">
                      {dryingRecords.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-400 font-body">
                      清理率
                    </span>
                    <span className="text-sm font-display text-brand-400">
                      {dryingRecords.length > 0
                        ? Math.round(
                            (dryingRecords.filter((r) => r.filterCleaned)
                              .length /
                              dryingRecords.length) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
