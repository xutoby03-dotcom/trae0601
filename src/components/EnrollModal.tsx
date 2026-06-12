import React, { useState } from 'react'
import { X, Gift, Calendar } from 'lucide-react'
import { useTrialStore } from '../store/trialStore'

interface Props {
  lessonId: string
  onClose: () => void
}

export const EnrollModal: React.FC<Props> = ({ lessonId, onClose }) => {
  const { enrollLesson, lessons } = useTrialStore()
  const lesson = lessons.find((l) => l.id === lessonId)

  const [reason, setReason] = useState(lesson?.enrollment?.reason || '')
  const [discountInfo, setDiscountInfo] = useState(lesson?.enrollment?.discountInfo || '')
  const [discountDeadline, setDiscountDeadline] = useState(
    lesson?.enrollment?.discountDeadline || ''
  )

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert('请填写报名理由，帮助以后做参考～')
      return
    }

    enrollLesson(lessonId, {
      decidedAt: new Date().toISOString(),
      reason: reason.trim(),
      discountInfo: discountInfo.trim() || undefined,
      discountDeadline: discountDeadline || undefined
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h2>🎉 报名决定</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {lesson && (
          <div style={{
            marginBottom: 16,
            padding: 14,
            background: 'linear-gradient(135deg, var(--success-light), var(--teal-light))',
            borderRadius: 12,
            border: '1px solid var(--success-border)'
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>
              🏢 {lesson.organization}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: 'var(--text)' }}>
              {lesson.courseName}
            </div>
            <div style={{ fontSize: 12, marginTop: 6, color: 'var(--text-secondary)' }}>
              💰 试听课费用：{lesson.fee === 0 ? '免费' : `¥${lesson.fee}`}
            </div>
          </div>
        )}

        <div className="form-section">
          <h3>📝 报名理由</h3>
          <div className="form-group">
            <textarea
              placeholder="为什么决定报名？比如：孩子特别喜欢、老师专业、性价比高、交通方便等，写下来方便以后参考～"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['孩子很感兴趣', '老师专业有耐心', '性价比高', '离家近交通方便', '课程体系完善'].map((tag) => (
              <button
                key={tag}
                type="button"
                className="chip"
                onClick={() => {
                  if (!reason.includes(tag)) {
                    setReason(reason ? `${reason}、${tag}` : tag)
                  }
                }}
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3><Gift size={16} style={{ color: 'var(--warning)' }} /> 优惠信息（可选）</h3>
          <div className="form-group">
            <label>优惠活动内容</label>
            <input
              type="text"
              placeholder="如：618活动立减2000元，送全套装备"
              value={discountInfo}
              onChange={(e) => setDiscountInfo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label><Calendar size={12} style={{ verticalAlign: -2 }} /> 优惠截止日期</label>
            <input
              type="date"
              value={discountDeadline}
              onChange={(e) => setDiscountDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            再想想
          </button>
          <button className="btn btn-success" onClick={handleSubmit}>
            ✅ 确认报名
          </button>
        </div>
      </div>
    </div>
  )
}
