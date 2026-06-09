import { useState, useEffect } from 'react'
import { store } from '../store'
import { WalkPlan, WalkRecord, ConflictAlert, DogProfile } from '../types'

export default function Stats() {
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [plans, setPlans] = useState<WalkPlan[]>([])
  const [records, setRecords] = useState<WalkRecord[]>([])
  const [conflicts, setConflicts] = useState<ConflictAlert[]>([])

  useEffect(() => {
    setDogs(store.dogs.getAll())
    setPlans(store.plans.getAll())
    setRecords(store.records.getAll())
    setConflicts(store.conflicts.getAll())
  }, [])

  const totalDogs = dogs.length
  const totalPlans = plans.length
  const totalConflicts = conflicts.length
  const resolvedConflicts = conflicts.filter((c) => c.resolved).length
  const activeConflicts = totalConflicts - resolvedConflicts

  const joinPlans = plans.filter((p) => p.willingToJoin)
  const joinCount = joinPlans.length

  const routeCount = new Map<string, number>()
  for (const p of plans) {
    routeCount.set(p.route, (routeCount.get(p.route) || 0) + 1)
  }
  const topRoutes = [...routeCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const maxRouteCount = topRoutes.length > 0 ? topRoutes[0][1] : 1

  const recordTypeCount = new Map<string, number>()
  for (const r of records) {
    recordTypeCount.set(r.recordType, (recordTypeCount.get(r.recordType) || 0) + 1)
  }
  const topRecordTypes = [...recordTypeCount.entries()].sort((a, b) => b[1] - a[1])
  const maxRecordCount = topRecordTypes.length > 0 ? topRecordTypes[0][1] : 1

  const dogPlanCount = new Map<string, { name: string; count: number }>()
  for (const p of plans) {
    const existing = dogPlanCount.get(p.dogId)
    if (existing) {
      existing.count++
    } else {
      dogPlanCount.set(p.dogId, { name: p.dogName, count: 1 })
    }
  }
  const topDogs = [...dogPlanCount.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  const maxDogCount = topDogs.length > 0 ? topDogs[0].count : 1

  const timeSlotCount = new Map<string, number>()
  for (const p of plans) {
    timeSlotCount.set(p.timeSlot, (timeSlotCount.get(p.timeSlot) || 0) + 1)
  }

  const typeEmoji: Record<string, string> = {
    '打架': '💥',
    '捡到东西': '🎁',
    '遇到流浪狗': '🐕',
    '友好互动': '🤝',
    '其他': '📋',
  }

  const typeBadge: Record<string, string> = {
    '打架': 'badge-danger',
    '捡到东西': 'badge-warning',
    '遇到流浪狗': 'badge-info',
    '友好互动': 'badge-success',
    '其他': 'badge-primary',
  }

  return (
    <div>
      <div className="page-title">📊 统计数据</div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{totalDogs}</div>
          <div className="stat-label">🐕 狗狗总数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalPlans}</div>
          <div className="stat-label">📅 遛狗计划数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{joinCount}</div>
          <div className="stat-label">🤝 结伴次数</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            {activeConflicts}
          </div>
          <div className="stat-label">⚠️ 未解决冲突</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {resolvedConflicts}
          </div>
          <div className="stat-label">✅ 已解决冲突</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{records.length}</div>
          <div className="stat-label">📝 遛狗记录</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>
          📍 最常去的路线
        </div>
        {topRoutes.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            暂无数据
          </div>
        ) : (
          topRoutes.map(([route, count]) => (
            <div key={route} className="stat-bar-container">
              <div className="stat-bar-label">
                <span>{route}</span>
                <span>{count} 次</span>
              </div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill"
                  style={{ width: `${(count / maxRouteCount) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>
          🐕 出行最多的狗狗
        </div>
        {topDogs.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            暂无数据
          </div>
        ) : (
          topDogs.map((dog) => (
            <div key={dog.name} className="stat-bar-container">
              <div className="stat-bar-label">
                <span>{dog.name}</span>
                <span>{dog.count} 次</span>
              </div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill"
                  style={{
                    width: `${(dog.count / maxDogCount) * 100}%`,
                    background: 'var(--success)',
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>
          📝 遛狗记录分布
        </div>
        {topRecordTypes.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            暂无数据
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {topRecordTypes.map(([type, count]) => (
              <div
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: 'var(--bg)',
                }}
              >
                <span>{typeEmoji[type]}</span>
                <span className={`badge ${typeBadge[type]}`}>{type}</span>
                <span style={{ fontWeight: 600 }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {timeSlotCount.size > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>
            ⏰ 时间段分布
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['傍晚', '夜间', '周末上午', '周末下午'].map((slot) => {
              const count = timeSlotCount.get(slot) || 0
              const slotIcon: Record<string, string> = {
                '傍晚': '🌅',
                '夜间': '🌙',
                '周末上午': '☀️',
                '周末下午': '🌤️',
              }
              return (
                <div
                  key={slot}
                  style={{
                    flex: '1 1 140px',
                    textAlign: 'center',
                    padding: '16px 12px',
                    borderRadius: 12,
                    background: 'var(--bg)',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 4 }}>
                    {slotIcon[slot]}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--primary)' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {slot}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
