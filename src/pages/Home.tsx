import { useNavigate } from 'react-router-dom'
import { useReportStore } from '../store/reportStore'
import type { ClutterReport, FireRiskLevel } from '../types'
import { AlertTriangle, Flame, Ban, CheckCircle2, Clock, RotateCcw } from 'lucide-react'

function ReportCard({ report }: { report: ClutterReport }) {
  const navigate = useNavigate()
  const riskColor = report.fireRisk === '高' ? 'high' : report.fireRisk === '中' ? 'medium' : 'low'

  const statusIcon = () => {
    switch (report.status) {
      case '待处理': return <Clock size={14} />
      case '已联系': return <Ban size={14} />
      case '已认领': return <CheckCircle2 size={14} />
      case '已清理': return <CheckCircle2 size={14} />
      case '无人认领': return <AlertTriangle size={14} />
    }
  }

  return (
    <div className={`report-card risk-border-${riskColor}`} onClick={() => navigate(`/report/${report.id}`)}>
      <div className="card-header">
        <div className="card-location">
          {report.building} · {report.floor}
        </div>
        <div className="card-badges">
          <span className={`risk-badge risk-${riskColor}`}>
            <Flame size={12} /> {report.fireRisk}风险
          </span>
          <span className={`status-badge status-${report.status}`}>
            {statusIcon()} {report.status}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="card-info">
          <span className="info-item">📦 {report.itemType}</span>
          <span className="info-item">📍 {report.occupyLocation}</span>
          {report.blocksPassage && <span className="info-item alert-text">🚫 影响通行</span>}
        </div>

        {report.photo && (
          <div className="card-photo">
            <img src={report.photo} alt="堆物照片" />
          </div>
        )}

        {report.recurrenceCount > 0 && (
          <div className="recurrence-alert">
            <RotateCcw size={14} />
            <span>该位置已复发 {report.recurrenceCount} 次</span>
          </div>
        )}

        {report.gentleReminder && report.status !== '已清理' && (
          <div className="gentle-reminder">
            💬 {report.gentleReminder}
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="card-time">
          {new Date(report.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
        {report.expectedCleanupTime && report.status === '已认领' && (
          <span className="cleanup-time">
            预计 {new Date(report.expectedCleanupTime).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} 前清理
          </span>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const reports = useReportStore((s) => s.reports)

  const activeReports = reports.filter((r) => r.status !== '已清理')
  const resolvedReports = reports.filter((r) => r.status === '已清理')

  const fireRiskGroup = activeReports.filter((r) => r.fireRisk === '高')
  const blockingGroup = activeReports.filter((r) => r.fireRisk !== '高' && r.blocksPassage)
  const otherGroup = activeReports.filter((r) => r.fireRisk !== '高' && !r.blocksPassage)

  const sortReports = (list: ClutterReport[]) =>
    [...list].sort((a, b) => {
      const riskOrder: Record<FireRiskLevel, number> = { '高': 0, '中': 1, '低': 2 }
      const statusOrder: Record<string, number> = { '待处理': 0, '无人认领': 1, '已联系': 2, '已认领': 3, '已清理': 4 }
      const riskDiff = riskOrder[a.fireRisk] - riskOrder[b.fireRisk]
      if (riskDiff !== 0) return riskDiff
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]
      if (statusDiff !== 0) return statusDiff
      return b.recurrenceCount - a.recurrenceCount
    })

  return (
    <div className="page-container">
      <div className="home-header">
        <h1>🏘️ 楼道堆物提醒</h1>
        <p className="text-muted">共同维护楼道整洁，守护居住安全</p>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <h3>楼道畅通，安心居住</h3>
          <p>暂无堆物提醒，如发现楼道堆物请及时上报</p>
        </div>
      ) : (
        <>
          <div className="summary-bar">
            <div className="summary-item">
              <span className="summary-num">{fireRiskGroup.length}</span>
              <span className="summary-label">高风险</span>
            </div>
            <div className="summary-item">
              <span className="summary-num">{blockingGroup.length}</span>
              <span className="summary-label">影响通行</span>
            </div>
            <div className="summary-item">
              <span className="summary-num">{otherGroup.length}</span>
              <span className="summary-label">待关注</span>
            </div>
            <div className="summary-item">
              <span className="summary-num">{resolvedReports.length}</span>
              <span className="summary-label">已处理</span>
            </div>
          </div>

          {fireRiskGroup.length > 0 && (
            <div className="report-section">
              <div className="section-title section-danger">
                <Flame size={18} />
                <span>消防风险</span>
                <span className="section-count">{fireRiskGroup.length}</span>
              </div>
              {sortReports(fireRiskGroup).map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}
            </div>
          )}

          {blockingGroup.length > 0 && (
            <div className="report-section">
              <div className="section-title section-warning">
                <Ban size={18} />
                <span>影响通行</span>
                <span className="section-count">{blockingGroup.length}</span>
              </div>
              {sortReports(blockingGroup).map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}
            </div>
          )}

          {otherGroup.length > 0 && (
            <div className="report-section">
              <div className="section-title section-info">
                <AlertTriangle size={18} />
                <span>待关注</span>
                <span className="section-count">{otherGroup.length}</span>
              </div>
              {sortReports(otherGroup).map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}
            </div>
          )}

          {resolvedReports.length > 0 && (
            <div className="report-section">
              <div className="section-title section-success">
                <CheckCircle2 size={18} />
                <span>已处理</span>
                <span className="section-count">{resolvedReports.length}</span>
              </div>
              {sortReports(resolvedReports).map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
