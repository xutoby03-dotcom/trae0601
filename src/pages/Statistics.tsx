import { useReportStore } from '../store/reportStore'
import { Building2, Clock, RotateCcw, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react'

export default function Statistics() {
  const reports = useReportStore((s) => s.reports)

  const totalReports = reports.length
  const resolvedReports = reports.filter((r) => r.status === '已清理')
  const pendingReports = reports.filter((r) => r.status !== '已清理')
  const highRiskReports = reports.filter((r) => r.fireRisk === '高' && r.status !== '已清理')

  const floorMap = new Map<string, number>()
  reports.forEach((r) => {
    const key = `${r.building} ${r.floor}`
    floorMap.set(key, (floorMap.get(key) || 0) + 1)
  })
  const floorRanking = [...floorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const maxFloorCount = floorRanking.length > 0 ? floorRanking[0][1] : 1

  const resolvedWithTime = resolvedReports.filter((r) => r.resolvedAt)
  const avgResolutionMs =
    resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((sum, r) => {
          const created = new Date(r.createdAt).getTime()
          const resolved = new Date(r.resolvedAt!).getTime()
          return sum + (resolved - created)
        }, 0) / resolvedWithTime.length
      : 0
  const avgResolutionHours = Math.round(avgResolutionMs / (1000 * 60 * 60) * 10) / 10

  const groupKeyMap = new Map<string, { key: string; building: string; floor: string; location: string; count: number }>()
  reports.forEach((r) => {
    const existing = groupKeyMap.get(r.recurrenceGroupKey)
    if (existing) {
      existing.count++
    } else {
      groupKeyMap.set(r.recurrenceGroupKey, {
        key: r.recurrenceGroupKey,
        building: r.building,
        floor: r.floor,
        location: r.occupyLocation,
        count: 1,
      })
    }
  })
  const recurrenceRanking = [...groupKeyMap.values()]
    .filter((g) => g.count >= 2)
    .sort((a, b) => b.count - a.count)

  const totalRecurrenceCount = recurrenceRanking.reduce((sum, r) => sum + r.count, 0)

  const itemTypeMap = new Map<string, number>()
  reports.forEach((r) => {
    itemTypeMap.set(r.itemType, (itemTypeMap.get(r.itemType) || 0) + 1)
  })
  const itemTypeRanking = [...itemTypeMap.entries()].sort((a, b) => b[1] - a[1])

  const statusDistribution = new Map<string, number>()
  reports.forEach((r) => {
    statusDistribution.set(r.status, (statusDistribution.get(r.status) || 0) + 1)
  })

  return (
    <div className="page-container">
      <div className="page-header-center">
        <h1>📊 统计分析</h1>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-num">{totalReports}</div>
          <div className="stat-label">总提醒数</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-num">{pendingReports.length}</div>
          <div className="stat-label">待处理</div>
        </div>
        <div className="stat-card stat-resolved">
          <div className="stat-num">{resolvedReports.length}</div>
          <div className="stat-label">已处理</div>
        </div>
        <div className="stat-card stat-danger">
          <div className="stat-num">{highRiskReports.length}</div>
          <div className="stat-label">高风险</div>
        </div>
      </div>

      <div className="stats-section">
        <div className="section-title section-info">
          <Building2 size={18} />
          <span>楼层堆物排行</span>
        </div>
        {floorRanking.length === 0 ? (
          <div className="stats-empty">暂无数据</div>
        ) : (
          <div className="bar-chart">
            {floorRanking.map(([floor, count], i) => (
              <div key={floor} className="bar-row">
                <div className="bar-label">{floor}</div>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${i < 3 ? 'bar-fill-hot' : ''}`}
                    style={{ width: `${(count / maxFloorCount) * 100}%` }}
                  />
                </div>
                <div className="bar-value">{count} 次</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="stats-section">
        <div className="section-title section-warning">
          <Clock size={18} />
          <span>平均处理时长</span>
        </div>
        <div className="metric-card">
          {resolvedWithTime.length === 0 ? (
            <div className="stats-empty">暂无已处理记录</div>
          ) : (
            <>
              <div className="metric-value">
                {avgResolutionHours >= 24
                  ? `${Math.round(avgResolutionHours / 24)} 天`
                  : `${avgResolutionHours} 小时`}
              </div>
              <div className="metric-desc">
                基于 {resolvedWithTime.length} 条已处理记录计算
              </div>
            </>
          )}
        </div>
      </div>

      <div className="stats-section">
        <div className="section-title section-danger">
          <RotateCcw size={18} />
          <span>复发统计</span>
        </div>
        <div className="metric-card">
          <div className="metric-row">
            <div className="metric-item">
              <div className="metric-value">{recurrenceRanking.length}</div>
              <div className="metric-desc">复发位置数</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{totalRecurrenceCount}</div>
              <div className="metric-desc">累计复发次数</div>
            </div>
          </div>
        </div>
        {recurrenceRanking.length > 0 && (
          <div className="recurrence-list">
            {recurrenceRanking.map((r) => (
              <div key={r.key} className="recurrence-list-item">
                <div className="recurrence-loc">
                  <AlertTriangle size={14} />
                  <span>{r.building} {r.floor} · {r.location}</span>
                </div>
                <div className="recurrence-count">
                  <RotateCcw size={14} />
                  <span>{r.count} 次</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="stats-section">
        <div className="section-title section-info">
          <BarChart3 size={18} />
          <span>物品类型分布</span>
        </div>
        {itemTypeRanking.length === 0 ? (
          <div className="stats-empty">暂无数据</div>
        ) : (
          <div className="type-distribution">
            {itemTypeRanking.map(([type, count]) => (
              <div key={type} className="type-row">
                <span className="type-name">{type}</span>
                <div className="type-bar-track">
                  <div
                    className="type-bar-fill"
                    style={{ width: `${(count / totalReports) * 100}%` }}
                  />
                </div>
                <span className="type-count">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="stats-section">
        <div className="section-title section-success">
          <TrendingUp size={18} />
          <span>处理状态分布</span>
        </div>
        <div className="status-distribution">
          {[...statusDistribution.entries()].map(([status, count]) => (
            <div key={status} className={`status-stat status-stat-${status}`}>
              <div className="status-stat-num">{count}</div>
              <div className="status-stat-label">{status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
