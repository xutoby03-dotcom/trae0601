import React, { useState } from 'react'
import { X, Star } from 'lucide-react'
import { useTrialStore } from '../store/trialStore'
import {
  INTEREST_LABELS,
  CONVENIENCE_LABELS,
  type InterestLevel,
  type ConvenienceLevel
} from '../types/trial'

interface Props {
  lessonId: string
  onClose: () => void
}

export const FeedbackModal: React.FC<Props> = ({ lessonId, onClose }) => {
  const { submitFeedback, lessons } = useTrialStore()
  const lesson = lessons.find((l) => l.id === lessonId)

  const [childInterest, setChildInterest] = useState<InterestLevel>(
    lesson?.feedback?.childInterest || 3
  )
  const [teacherFeedback, setTeacherFeedback] = useState(
    lesson?.feedback?.teacherFeedback || ''
  )
  const [convenience, setConvenience] = useState<ConvenienceLevel>(
    lesson?.feedback?.convenience || 3
  )
  const [wantToEnroll, setWantToEnroll] = useState<boolean | null>(
    lesson?.feedback?.wantToEnroll ?? null
  )

  const handleSubmit = () => {
    submitFeedback(lessonId, {
      childInterest,
      teacherFeedback,
      convenience,
      wantToEnroll: wantToEnroll ?? false,
      feedbackAt: new Date().toISOString()
    })
    onClose()
  }

  const renderRatingButtons = (
    value: number,
    onChange: (v: any) => void,
    labels: Record<number, string>
  ) => {
    return (
      <div className="rating-group">
        {([1, 2, 3, 4, 5] as const).map((v) => (
          <button
            key={v}
            type="button"
            className={`rating-btn ${value === v ? 'active' : ''}`}
            onClick={() => onChange(v)}
          >
            <span className="rating-btn-stars">
              {Array.from({ length: v }, (_, i) => (
                <Star key={i} size={12} fill="currentColor" />
              ))}
            </span>
            <span>{labels[v as 1 | 2 | 3 | 4 | 5]}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h2>📋 试听反馈</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {lesson && (
          <div style={{ marginBottom: 16, padding: 12, background: 'var(--primary-light)', borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
              {lesson.organization}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>
              {lesson.courseName}
            </div>
          </div>
        )}

        <div className="form-section">
          <h3>😊 孩子兴趣度</h3>
          {renderRatingButtons(childInterest, setChildInterest, INTEREST_LABELS)}
        </div>

        <div className="form-section">
          <h3>🚇 交通方便度</h3>
          {renderRatingButtons(convenience, setConvenience, CONVENIENCE_LABELS)}
        </div>

        <div className="form-section">
          <h3>💬 老师和课堂反馈</h3>
          <div className="form-group">
            <textarea
              placeholder="请描述老师的教学方式、孩子的课堂表现、整体感受等..."
              value={teacherFeedback}
              onChange={(e) => setTeacherFeedback(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>🤔 是否想报名？</h3>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn yes ${wantToEnroll === true ? 'active' : ''}`}
              onClick={() => setWantToEnroll(true)}
            >
              👍 想报名
            </button>
            <button
              type="button"
              className={`toggle-btn no ${wantToEnroll === false ? 'active' : ''}`}
              onClick={() => setWantToEnroll(false)}
            >
              👎 暂时不考虑
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            提交反馈
          </button>
        </div>
      </div>
    </div>
  )
}
