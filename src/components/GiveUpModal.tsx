import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useTrialStore } from '../store/trialStore'

interface Props {
  lessonId: string
  onClose: () => void
}

export const GiveUpModal: React.FC<Props> = ({ lessonId, onClose }) => {
  const { giveUpLesson, lessons } = useTrialStore()
  const lesson = lessons.find((l) => l.id === lessonId)

  const [reason, setReason] = useState(lesson?.giveUpReason || '')

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert('请简单写一下放弃的原因，帮助以后做决策～')
      return
    }
    giveUpLesson(lessonId, reason.trim())
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h2>😔 放弃试听</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {lesson && (
          <div style={{
            marginBottom: 16,
            padding: 14,
            background: 'var(--danger-light)',
            borderRadius: 12,
            border: '1px solid var(--danger-border)'
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)' }}>
              🏢 {lesson.organization}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: 'var(--text)' }}>
              {lesson.courseName}
            </div>
          </div>
        )}

        <div className="form-section">
          <h3>📝 放弃原因</h3>
          <div className="form-group">
            <textarea
              placeholder="为什么放弃？比如：孩子不感兴趣、距离太远、价格太贵、老师不满意等，写下来以后就不用再纠结啦～"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['孩子没兴趣', '距离太远交通不便', '价格偏贵', '老师不满意', '课时安排不合适', '对比后选择了别家'].map((tag) => (
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

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            再想想
          </button>
          <button className="btn btn-danger" onClick={handleSubmit}>
            确认放弃
          </button>
        </div>
      </div>
    </div>
  )
}
