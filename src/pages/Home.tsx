import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Battery, AlertTriangle, Zap, Plus, Bell, ChevronRight, ChevronDown, Calendar } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { SIDE_LABELS, BATTERY_TYPE_LABELS, REMINDER_TYPE_LABELS } from '@/types'
import type { HearingAid, DailyRecord } from '@/types'

function getLatestRecord(records: DailyRecord[], aidId: string) {
  return records
    .filter((r) => r.aidId === aidId)
    .sort((a, b) => b.date.localeCompare(a.date))[0]
}

function isRecent(dateStr: string, days: number) {
  const d = new Date(dateStr)
  const now = new Date()
  return now.getTime() - d.getTime() <= days * 24 * 60 * 60 * 1000
}

export default function Home() {
  const hearingAids = useStore((s) => s.hearingAids)
  const dailyRecords = useStore((s) => s.dailyRecords)
  const reminders = useStore((s) => s.reminders)

  const { needCharge, needReplace, abnormalAids } = useMemo(() => {
    const charge: (HearingAid & { batteryLevel: number })[] = []
    const replace: (HearingAid & { batteryLevel: number })[] = []
    const abnormal: (HearingAid & { issues: string[]; lastAbnormalDate: string; abnormalRecords: DailyRecord[] })[] = []

    hearingAids.forEach((aid) => {
      const latest = getLatestRecord(dailyRecords, aid.id)
      if (latest) {
        if (aid.batteryType === 'rechargeable' && latest.batteryLevel <= 30) {
          charge.push({ ...aid, batteryLevel: latest.batteryLevel })
        }
        if (aid.batteryType !== 'rechargeable' && latest.batteryLevel <= 20) {
          replace.push({ ...aid, batteryLevel: latest.batteryLevel })
        }
      }

      const recentRecords = dailyRecords.filter(
        (r) => r.aidId === aid.id && isRecent(r.date, 7)
      )
      const issueSet = new Set<string>()
      const abRecords: DailyRecord[] = []
      recentRecords.forEach((r) => {
        if (r.hasWhistling || r.hasHearingIssue) {
          if (r.hasWhistling) issueSet.add('啸叫')
          if (r.hasHearingIssue) issueSet.add('听不清')
          abRecords.push(r)
        }
      })
      if (issueSet.size > 0) {
        abRecords.sort((a, b) => b.date.localeCompare(a.date))
        abnormal.push({ ...aid, issues: Array.from(issueSet), lastAbnormalDate: abRecords[0].date, abnormalRecords: abRecords })
      }
    })

    return { needCharge: charge, needReplace: replace, abnormalAids: abnormal }
  }, [hearingAids, dailyRecords])

  const activeReminders = reminders.filter((r) => r.enabled)
  const [expandedAidId, setExpandedAidId] = useState<string | null>(null)

  const now = new Date()

  return (
    <div className="min-h-screen px-4 pb-28 pt-6">
      <header className="mb-6 animate-slide-in">
        <h1 className="text-3xl font-bold text-indigo">
          👋 您好！
        </h1>
        <p className="mt-1 text-lg text-indigo-light">
          {format(now, 'yyyy年M月d日 EEEE')}
        </p>
        <p className="text-base text-indigo-light/70">
          {format(now, 'HH:mm')}
        </p>
      </header>

      <section className="mb-6 animate-slide-in" style={{ animationDelay: '0.05s' }}>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-indigo">
          <Zap className="h-5 w-5 text-amber" />
          今日充电
        </h2>
        {needCharge.length === 0 ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-base text-indigo-light">暂无需充电设备</p>
        ) : (
          <div className="space-y-3">
            {needCharge.map((aid) => (
              <div
                key={aid.id}
                className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Battery className="h-7 w-7 text-amber-dark" />
                    <div>
                      <p className="text-lg font-semibold text-indigo">
                        {SIDE_LABELS[aid.side]} · {aid.model}
                      </p>
                      <p className="text-sm text-indigo-light">
                        {BATTERY_TYPE_LABELS[aid.batteryType]}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-amber-dark">{aid.batteryLevel}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-amber-200">
                  <div
                    className="battery-bar h-full rounded-full bg-amber"
                    style={{ width: `${aid.batteryLevel}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-indigo">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          快换电池
        </h2>
        {needReplace.length === 0 ? (
          <p className="rounded-xl bg-green-50 px-4 py-3 text-base text-indigo-light">电池状态良好</p>
        ) : (
          <div className="space-y-3">
            {needReplace.map((aid) => (
              <div
                key={aid.id}
                className="animate-pulse-warning rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-7 w-7 text-red-500" />
                    <div>
                      <p className="text-lg font-semibold text-indigo">
                        {SIDE_LABELS[aid.side]} · {aid.model}
                      </p>
                      <p className="text-sm text-red-600">
                        {BATTERY_TYPE_LABELS[aid.batteryType]} · 电量不足
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-500">{aid.batteryLevel}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6 animate-slide-in" style={{ animationDelay: '0.15s' }}>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-indigo">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          异常反馈
        </h2>
        {abnormalAids.length === 0 ? (
          <p className="rounded-xl bg-green-50 px-4 py-3 text-base text-indigo-light">近期无异常</p>
        ) : (
          <div className="space-y-3">
            {abnormalAids.map((aid) => {
              const isExpanded = expandedAidId === aid.id
              return (
                <div
                  key={aid.id}
                  className="rounded-xl border border-yellow-300 bg-yellow-50 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    className="w-full p-4 text-left"
                    onClick={() => setExpandedAidId(isExpanded ? null : aid.id)}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-7 w-7 shrink-0 text-yellow-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold text-indigo">
                          {SIDE_LABELS[aid.side]} · {aid.model}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-yellow-700">
                          <span>{aid.issues.join(' · ')}</span>
                          <span className="text-yellow-500">|</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            最近异常 {format(new Date(aid.lastAbnormalDate), 'M月d日')}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 shrink-0 text-yellow-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 shrink-0 text-yellow-600" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-yellow-200 bg-yellow-50/50 px-4 py-3 space-y-2">
                      <p className="text-xs font-medium text-yellow-600 mb-2">近7天异常明细</p>
                      {aid.abnormalRecords.map((r) => (
                        <div
                          key={r.id}
                          className="rounded-lg bg-white/80 px-3 py-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-indigo">
                              {format(new Date(r.date), 'M月d日')}
                            </span>
                            <span className="text-xs text-yellow-700">
                              {r.hasWhistling && '啸叫'}
                              {r.hasWhistling && r.hasHearingIssue && ' · '}
                              {r.hasHearingIssue && '听不清'}
                            </span>
                          </div>
                          {r.notes?.trim() ? (
                            <p className="mt-1 text-xs text-indigo-light">{r.notes.trim()}</p>
                          ) : (
                            <p className="mt-1 text-xs text-indigo-light/40">未填写备注</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {activeReminders.length > 0 && (
        <section className="mb-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-indigo">
            <Bell className="h-5 w-5 text-amber" />
            活跃提醒
          </h2>
          <div className="space-y-2">
            {activeReminders.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="text-base font-medium text-indigo">
                    {REMINDER_TYPE_LABELS[r.type]}
                  </p>
                  <p className="text-sm text-indigo-light">{r.description}</p>
                </div>
                <div className="flex items-center gap-2 text-amber">
                  <span className="text-sm font-medium">{r.time}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Link
        to="/daily"
        className="animate-slide-in fixed bottom-8 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber text-white shadow-lg shadow-amber/30 transition-transform hover:scale-105 active:scale-95"
        style={{ animationDelay: '0.25s' }}
      >
        <Plus className="h-7 w-7" />
      </Link>
    </div>
  )
}
