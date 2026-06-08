import { useEffect } from 'react'
import { useActivityStore } from '@/store/activityStore'
import ActivityCard from '@/components/ActivityCard'
import type { Activity } from '@/utils/api'

const columns: { status: Activity['status']; label: string; color: string; dotColor: string }[] = [
  { status: 'not_started', label: '未开始', color: 'text-zinc-400', dotColor: 'bg-zinc-400' },
  { status: 'registering', label: '报名中', color: 'text-status', dotColor: 'bg-status' },
  { status: 'full', label: '已满员', color: 'text-urgent', dotColor: 'bg-urgent' },
  { status: 'ended', label: '已结束', color: 'text-zinc-500', dotColor: 'bg-zinc-500' },
]

export default function Home() {
  const { activities, loading, fetchActivities } = useActivityStore()

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const grouped = columns.map((col) => ({
    ...col,
    activities: activities.filter((a) => a.status === col.status),
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">活动看板</h1>
        <p className="mt-1 text-sm text-zinc-500">管理社团活动的报名与进度</p>
      </div>

      {loading && activities.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {grouped.map((col) => (
            <div key={col.status} className="flex flex-col">
              <div className="mb-3 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                <span className="rounded-full bg-dark-hover px-2 py-0.5 text-xs font-medium text-zinc-400">
                  {col.activities.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {col.activities.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-dark-border py-8 text-center text-xs text-zinc-600">
                    暂无活动
                  </div>
                ) : (
                  col.activities.map((activity, idx) => (
                    <ActivityCard key={activity.id} activity={activity} index={idx} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
