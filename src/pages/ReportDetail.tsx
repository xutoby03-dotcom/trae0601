import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useReportStore } from '../store/reportStore'
import { ArrowLeft, Phone, Clock, User, RotateCcw, Flame, CheckCircle, XCircle } from 'lucide-react'

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const reports = useReportStore((s) => s.reports)
  const claimReport = useReportStore((s) => s.claimReport)
  const updateStatus = useReportStore((s) => s.updateStatus)

  const report = reports.find((r) => r.id === id)

  const [showClaimForm, setShowClaimForm] = useState(false)
  const [claimName, setClaimName] = useState('')
  const [claimPhone, setClaimPhone] = useState('')
  const [expectedTime, setExpectedTime] = useState('')
  const [showPropertyPanel, setShowPropertyPanel] = useState(false)
  const [propertyNote, setPropertyNote] = useState('')

  if (!report) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>未找到该记录</h3>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>
    )
  }

  const recurrenceReports = reports.filter(
    (r) => r.recurrenceGroupKey === report.recurrenceGroupKey && r.id !== report.id
  )

  const riskColor = report.fireRisk === '高' ? 'high' : report.fireRisk === '中' ? 'medium' : 'low'

  const handleClaim = () => {
    if (!claimName || !expectedTime) return
    claimReport(report.id, claimName, claimPhone, new Date(expectedTime).toISOString())
    setShowClaimForm(false)
  }

  const handleStatusUpdate = (status: '已联系' | '已清理' | '无人认领') => {
    updateStatus(report.id, status, propertyNote)
    setShowPropertyPanel(false)
    setPropertyNote('')
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn-icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1>提醒详情</h1>
      </div>

      <div className={`detail-card risk-border-${riskColor}`}>
        <div className="detail-header">
          <h2>{report.building} · {report.floor}</h2>
          <div className="detail-badges">
            <span className={`risk-badge risk-${riskColor}`}>
              <Flame size={12} /> {report.fireRisk}风险
            </span>
            <span className={`status-badge status-${report.status}`}>
              {report.status}
            </span>
          </div>
        </div>

        <div className="detail-info-grid">
          <div className="detail-info-item">
            <span className="detail-label">物品类型</span>
            <span className="detail-value">📦 {report.itemType}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-label">占用位置</span>
            <span className="detail-value">📍 {report.occupyLocation}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-label">影响通行</span>
            <span className="detail-value">{report.blocksPassage ? '🚫 是' : '✅ 否'}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-label">发现时间</span>
            <span className="detail-value">
              🕐 {new Date(report.discoveryTime).toLocaleString('zh-CN')}
            </span>
          </div>
          <div className="detail-info-item">
            <span className="detail-label">上报时间</span>
            <span className="detail-value">
              📅 {new Date(report.createdAt).toLocaleString('zh-CN')}
            </span>
          </div>
          {report.resolvedAt && (
            <div className="detail-info-item">
              <span className="detail-label">处理时间</span>
              <span className="detail-value">
                ✅ {new Date(report.resolvedAt).toLocaleString('zh-CN')}
              </span>
            </div>
          )}
        </div>

        {report.photo && (
          <div className="detail-photo">
            <img src={report.photo} alt="现场照片" />
          </div>
        )}

        {report.gentleReminder && report.status !== '已清理' && (
          <div className="gentle-reminder detail-reminder">
            💬 {report.gentleReminder}
          </div>
        )}

        {report.recurrenceCount > 0 && (
          <div className="recurrence-alert detail-recurrence">
            <RotateCcw size={16} />
            <span>该位置已复发 {report.recurrenceCount} 次，请重点关注</span>
          </div>
        )}

        {report.claimedBy && (
          <div className="claim-info">
            <h4><User size={14} /> 认领信息</h4>
            <p>认领人：{report.claimedBy}</p>
            {report.claimPhone && <p>联系电话：{report.claimPhone}</p>}
            {report.expectedCleanupTime && (
              <p>
                <Clock size={14} /> 预计清理时间：
                {new Date(report.expectedCleanupTime).toLocaleString('zh-CN')}
              </p>
            )}
          </div>
        )}

        {report.propertyNote && (
          <div className="property-note">
            <h4>📝 物业备注</h4>
            <p>{report.propertyNote}</p>
          </div>
        )}

        {recurrenceReports.length > 0 && (
          <div className="recurrence-history">
            <h4><RotateCcw size={14} /> 历史复发记录</h4>
            {recurrenceReports.map((r) => (
              <div key={r.id} className="recurrence-item">
                <span>{new Date(r.createdAt).toLocaleDateString('zh-CN')}</span>
                <span>{r.itemType}</span>
                <span className={`status-badge status-${r.status}`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="action-section">
        {report.status !== '已清理' && (
          <>
            {!showClaimForm && report.status === '待处理' && (
              <button
                className="btn btn-primary btn-block"
                onClick={() => setShowClaimForm(true)}
              >
                🙋 认领我的物品
              </button>
            )}

            {showClaimForm && (
              <div className="action-form">
                <h4>认领物品</h4>
                <div className="form-group">
                  <label>姓名</label>
                  <input
                    type="text"
                    placeholder="请输入您的姓名"
                    value={claimName}
                    onChange={(e) => setClaimName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>联系电话（选填）</label>
                  <input
                    type="tel"
                    placeholder="方便物业联系您"
                    value={claimPhone}
                    onChange={(e) => setClaimPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>预计清理时间</label>
                  <input
                    type="datetime-local"
                    value={expectedTime}
                    onChange={(e) => setExpectedTime(e.target.value)}
                  />
                </div>
                <div className="btn-row">
                  <button className="btn btn-secondary" onClick={() => setShowClaimForm(false)}>
                    取消
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleClaim}
                    disabled={!claimName || !expectedTime}
                  >
                    确认认领
                  </button>
                </div>
              </div>
            )}

            {!showPropertyPanel && (
              <button
                className="btn btn-secondary btn-block"
                onClick={() => setShowPropertyPanel(true)}
              >
                🏢 物业处理操作
              </button>
            )}

            {showPropertyPanel && (
              <div className="action-form">
                <h4>物业处理</h4>
                <div className="form-group">
                  <label>处理备注</label>
                  <textarea
                    placeholder="记录处理情况..."
                    value={propertyNote}
                    onChange={(e) => setPropertyNote(e.target.value)}
                  />
                </div>
                <div className="property-actions">
                  <button
                    className="btn btn-action btn-contact"
                    onClick={() => handleStatusUpdate('已联系')}
                  >
                    <Phone size={14} /> 已联系
                  </button>
                  <button
                    className="btn btn-action btn-clean"
                    onClick={() => handleStatusUpdate('已清理')}
                  >
                    <CheckCircle size={14} /> 已清理
                  </button>
                  <button
                    className="btn btn-action btn-unclaim"
                    onClick={() => handleStatusUpdate('无人认领')}
                  >
                    <XCircle size={14} /> 无人认领
                  </button>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowPropertyPanel(false)}
                >
                  取消
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
