import { useState, useEffect } from 'react'
import { store, checkAndCreateConflicts, uid } from '../store'
import { DogProfile, WalkPlan, TimeSlot, MergedRoute, ConflictAlert } from '../types'

interface Props {
  onNavigate: (tab: 'dogs' | 'plans' | 'records' | 'stats') => void
}

function getDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

function getNextWeekendDates(): string[] {
  const now = new Date()
  const dates: string[] = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    if (d.getDay() === 0 || d.getDay() === 6) {
      dates.push(getDateStr(d))
    }
  }
  return dates
}

function getTodayEveningNight() {
  const today = getDateStr(new Date())
  return { today, evening: '傍晚' as TimeSlot, night: '夜间' as TimeSlot }
}

export default function Home({ onNavigate }: Props) {
  const [dogs] = useState<DogProfile[]>(store.dogs.getAll())
  const [plans, setPlans] = useState<WalkPlan[]>(store.plans.getAll())
  const [conflicts, setConflicts] = useState<ConflictAlert[]>(store.conflicts.getAll())
  const [filterRoute, setFilterRoute] = useState('')

  useEffect(() => {
    setPlans(store.plans.getAll())
    setConflicts(store.conflicts.getAll())
  }, [])

  const today = getDateStr(new Date())
  const weekendDates = getNextWeekendDates()

  const todayEveningPlans = plans.filter(
    (p) => p.date === today && p.timeSlot === '傍晚'
  )
  const todayNightPlans = plans.filter(
    (p) => p.date === today && p.timeSlot === '夜间'
  )
  const weekendPlans = plans.filter(
    (p) =>
      weekendDates.includes(p.date) &&
      (p.timeSlot === '周末上午' || p.timeSlot === '周末下午')
  )

  const upcomingPlans = [...todayEveningPlans, ...todayNightPlans, ...weekendPlans]

  const activeConflicts = conflicts.filter((c) => !c.resolved)

  function mergePlans(plans: WalkPlan[]): MergedRoute[] {
    const grouped = new Map<string, WalkPlan[]>()
    for (const p of plans) {
      const key = `${p.date}-${p.route}-${p.timeSlot}-${p.specificTime}`
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(p)
    }

    const merged: MergedRoute[] = []
    for (const [, groupPlans] of grouped) {
      const first = groupPlans[0]
      const routeConflicts = activeConflicts.filter(
        (c) =>
          c.route === first.route &&
          c.date === first.date &&
          c.timeSlot === first.timeSlot &&
          c.specificTime === first.specificTime
      )
      merged.push({
        route: first.route,
        date: first.date,
        timeSlot: first.timeSlot,
        specificTime: first.specificTime,
        plans: groupPlans,
        hasConflict: routeConflicts.length > 0,
        conflicts: routeConflicts,
      })
    }

    if (filterRoute) {
      return merged.filter((m) =>
        m.route.toLowerCase().includes(filterRoute.toLowerCase())
      )
    }
    return merged
  }

  const sizeEmoji: Record<string, string> = {
    '小型': '🐶',
    '中型': '🐕',
    '大型': '🐕‍🦺',
  }

  const timeSlotLabel: Record<string, string> = {
    '傍晚': '🌅 傍晚',
    '夜间': '🌙 夜间',
    '周末上午': '☀️ 周末上午',
    '周末下午': '🌤️ 周末下午',
  }

  function renderMergedGroup(
    title: string,
    icon: string,
    plans: WalkPlan[],
    showDate: boolean = false
  ) {
    const merged = mergePlans(plans)
    if (merged.length === 0) {
      return (
        <div key={title}>
          <div className="time-group-header">
            <span className="time-group-icon">{icon}</span>
            <span className="time-group-title">{title}</span>
          </div>
          <div className="empty-state" style={{ padding: '24px' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🦴</div>
            <div className="empty-state-text">暂无遛狗计划</div>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('plans')}>
              发布计划
            </button>
          </div>
        </div>
      )
    }

    return (
      <div key={title}>
        <div className="time-group-header">
          <span className="time-group-icon">{icon}</span>
          <span className="time-group-title">{title}</span>
          <span className="time-group-count">{plans.length} 个计划</span>
        </div>
        {merged.map((m) => (
          <div
            key={`${m.route}-${m.date}-${m.timeSlot}-${m.specificTime}`}
            className={`merged-card ${m.hasConflict ? 'has-conflict' : ''}`}
          >
            <div className="card-header">
              <div className="card-title">
                📍 {m.route}
                {showDate && (
                  <span className="badge badge-info">{m.date}</span>
                )}
                <span className="badge badge-primary">
                  {timeSlotLabel[m.timeSlot] || m.timeSlot}
                </span>
              </div>
              <span className="badge badge-success">
                {m.plans.length} 只狗
              </span>
            </div>

            {m.hasConflict &&
              m.conflicts.map((c) => (
                <div key={c.id} className="conflict-banner">
                  <span className="conflict-banner-icon">⚠️</span>
                  <div className="conflict-banner-content">
                    <div className="conflict-banner-title">{c.reason}</div>
                    <div className="conflict-banner-desc">
                      {c.owner1Name} 的 {c.dog1Name} vs {c.owner2Name} 的{' '}
                      {c.dog2Name} · {c.route} · {c.date} {c.specificTime}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      store.conflicts.resolve(c.id)
                      setConflicts(store.conflicts.getAll())
                    }}
                  >
                    已知悉
                  </button>
                </div>
              ))}

            {m.plans.map((p) => {
              const dog = dogs.find((d) => d.id === p.dogId)
              return (
                <div key={p.id} className="plan-item">
                  <div
                    className="plan-dot"
                    style={{
                      background: p.willingToJoin ? 'var(--success)' : 'var(--text-secondary)',
                    }}
                  />
                  <div className="plan-info">
                    <div className="plan-dog-name">
                      {sizeEmoji[dog?.size || '中型']} {p.dogName}
                      <span
                        className="badge"
                        style={{
                          marginLeft: 6,
                          background: dog?.size === '大型' ? 'var(--warning-light)' : 'var(--primary-light)',
                          color: dog?.size === '大型' ? 'var(--warning)' : 'var(--primary-dark)',
                          fontSize: 11,
                        }}
                      >
                        {dog?.size}
                      </span>
                    </div>
                    <div className="plan-meta">
                      {p.ownerName} · {p.specificTime} · {p.duration}分钟
                      {p.willingToJoin ? ' · ✅ 可结伴' : ' · 🚫 独行'}
                      {p.notes && ` · ${p.notes}`}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="page-title">
        🐾 今日遛狗看板
        {activeConflicts.length > 0 && (
          <span className="badge badge-danger">
            {activeConflicts.length} 个冲突
          </span>
        )}
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          className="form-input"
          placeholder="🔍 搜索路线..."
          value={filterRoute}
          onChange={(e) => setFilterRoute(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <button className="btn btn-primary" onClick={() => onNavigate('plans')}>
          + 发布计划
        </button>
      </div>

      {renderMergedGroup('今天傍晚', '🌅', todayEveningPlans)}
      {renderMergedGroup('今天夜间', '🌙', todayNightPlans)}
      {renderMergedGroup('周末', '🗓️', weekendPlans, true)}

      {upcomingPlans.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🐕</div>
          <div className="empty-state-text">
            还没有任何遛狗计划
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => onNavigate('dogs')}>
              先添加狗狗
            </button>
            <button className="btn btn-primary" onClick={() => onNavigate('plans')}>
              发布遛狗计划
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
