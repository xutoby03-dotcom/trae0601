import React from 'react'
import { useTrialStore } from '../store/trialStore'
import { CATEGORY_ICONS } from '../types/trial'

export const StatsSection: React.FC = () => {
  const { lessons, getStats } = useTrialStore()
  const stats = getStats()

  const categoryStats: Record<string, { total: number; interest: number }> = {}
  lessons.forEach((l) => {
    if (!categoryStats[l.category]) {
      categoryStats[l.category] = { total: 0, interest: 0 }
    }
    categoryStats[l.category].total += 1
    if (l.feedback) {
      categoryStats[l.category].interest += l.feedback.childInterest
    }
  })

  const sortedCategories = Object.entries(categoryStats).sort(
    (a, b) => b[1].total - a[1].total
  )
  const maxTotal = Math.max(...Object.values(categoryStats).map((c) => c.total), 1)

  return (
    <>
      <div className="stats-header">
        <div className="stat-card fee">
          <div className="stat-icon">💸</div>
          <div className="stat-num">¥{stats.totalFee}</div>
          <div className="stat-label">试听总费用</div>
        </div>
        <div className="stat-card favorite">
          <div className="stat-icon">❤️</div>
          <div className="stat-num">
            {stats.favoriteCategory
              ? `${CATEGORY_ICONS[stats.favoriteCategory]} ${stats.favoriteCategory}`
              : '暂无数据'}
          </div>
          <div className="stat-label">孩子最喜欢</div>
        </div>
        <div className="stat-card remaining">
          <div className="stat-icon">📋</div>
          <div className="stat-num">{stats.remainingTrials}</div>
          <div className="stat-label">待试听数量</div>
        </div>
      </div>

      {sortedCategories.length > 0 && (
        <div className="category-chart">
          <h3>📊 课程类别分布</h3>
          {sortedCategories.map(([cat, data]) => {
            const feedbackCount = lessons.filter(l => l.category === cat && l.feedback).length
            const avgInterest = data.interest > 0 && feedbackCount > 0
              ? ` ⭐${(data.interest / feedbackCount).toFixed(1)}`
              : ''
            return (
              <div key={cat} className="chart-row">
                <span className="chart-label">
                  {CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] || '📦'}
                  {cat}
                </span>
                <div className="chart-track">
                  <div
                    className="chart-fill"
                    style={{ width: `${(data.total / maxTotal) * 100}%` }}
                  />
                </div>
                <span className="chart-value">{data.total}节{avgInterest}</span>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
