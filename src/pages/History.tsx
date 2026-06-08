import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Calendar, Flame, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useActivityStore } from '@/store/activityStore'

export default function History() {
  const { historyStats, activityTypeStats, fetchHistoryStats, fetchActivityTypeStats } = useActivityStore()

  useEffect(() => {
    fetchHistoryStats()
    fetchActivityTypeStats()
  }, [fetchHistoryStats, fetchActivityTypeStats])

  const statsActivities = historyStats?.activities ?? []
  const totalParticipants = activityTypeStats.reduce((s, t) => s + t.participantCount, 0)
  const topType = totalParticipants > 0
    ? activityTypeStats.reduce((a, b) => a.participantCount > b.participantCount ? a : b)
    : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">历史活动</h1>
        <p className="mt-1 text-sm text-zinc-500">查看过往活动统计与出勤数据</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-dark-border bg-dark-surface p-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">总活动数</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{historyStats?.totalActivities ?? 0}</p>
        </div>
        <div className="rounded-xl border border-dark-border bg-dark-surface p-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">平均出勤率</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-status">
            {historyStats?.avgAttendanceRate != null
              ? `${Math.round(historyStats.avgAttendanceRate * 100)}%`
              : '-'}
          </p>
        </div>
        <div className="col-span-2 rounded-xl border border-dark-border bg-dark-surface p-5 sm:col-span-1">
          <div className="flex items-center gap-2 text-zinc-500">
            <Flame className="h-4 w-4" />
            <span className="text-xs">最受欢迎类型</span>
          </div>
          {topType ? (
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-accent">{topType.type}</p>
              <span className="text-xs text-zinc-500">{topType.participantCount} 人参与</span>
            </div>
          ) : (
            <p className="mt-2 text-2xl font-bold text-zinc-600">-</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" />
          <h2 className="font-heading text-lg font-semibold text-white">活动类型参与人数</h2>
        </div>
        {totalParticipants > 0 ? (
          <div className="rounded-xl border border-dark-border bg-dark-surface p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={activityTypeStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3F3F46" />
                <XAxis
                  dataKey="type"
                  tick={{ fill: '#A1A1AA', fontSize: 12 }}
                  axisLine={{ stroke: '#3F3F46' }}
                />
                <YAxis
                  tick={{ fill: '#A1A1AA', fontSize: 12 }}
                  axisLine={{ stroke: '#3F3F46' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F1F23',
                    border: '1px solid #3F3F46',
                    borderRadius: '8px',
                    color: '#FAFAFA',
                  }}
                />
                <Bar dataKey="participantCount" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-dark-border py-12 text-center text-sm text-zinc-600">
            暂无活动类型数据，结束活动后将在此展示
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-heading text-lg font-semibold text-white">已结束活动列表</h2>
        {statsActivities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-dark-border py-12 text-center text-sm text-zinc-600">
            暂无已结束的活动
          </div>
        ) : (
          <div className="space-y-2">
            {statsActivities.map((a) => {
              const rate = Math.round(a.attendanceRate * 100)
              return (
                <Link
                  key={a.id}
                  to={`/activity/${a.id}`}
                  className="flex items-center justify-between rounded-xl border border-dark-border bg-dark-surface px-4 py-3 transition-colors hover:bg-dark-hover"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-white truncate">{a.title}</h3>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      已报名 {a.confirmedCount} 人 · 已签到 {a.checkedInCount} 人
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${rate >= 70 ? 'text-success' : rate >= 40 ? 'text-status' : 'text-urgent'}`}>
                        {rate}%
                      </span>
                      <p className="text-xs text-zinc-600">出勤率</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
