import React from 'react'
import {
  Calendar,
  MapPin,
  User,
  Users,
  Check,
  Star,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Clock,
  AlertCircle
} from 'lucide-react'
import type { TrialLesson } from '../types/trial'
import {
  STATUS_COLORS,
  CATEGORY_ICONS,
  INTEREST_LABELS,
  CONVENIENCE_LABELS
} from '../types/trial'
import { useTrialStore } from '../store/trialStore'

interface Props {
  lesson: TrialLesson
  onFeedback: (id: string) => void
  onEnroll: (id: string) => void
  onGiveUp: (id: string) => void
}

function startOfLocalDay(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function localDayDiff(iso: string): number {
  const target = startOfLocalDay(new Date(iso))
  const today = startOfLocalDay(new Date())
  return Math.round((target - today) / (24 * 60 * 60 * 1000))
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const diffDays = localDayDiff(iso)

  const dateStr = `${d.getMonth() + 1}月${d.getDate()}日`
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  let dayLabel = ''

  if (diffDays === 0) dayLabel = '今天'
  else if (diffDays === 1) dayLabel = '明天'
  else if (diffDays === 2) dayLabel = '后天'
  else if (diffDays === 3) dayLabel = '大后天'
  else if (diffDays === -1) dayLabel = '昨天'
  else if (diffDays === -2) dayLabel = '前天'
  else if (diffDays > 3) dayLabel = `${diffDays}天后`
  else if (diffDays < -2) dayLabel = `${-diffDays}天前`

  return `${dayLabel ? dayLabel + ' · ' : ''}${dateStr} ${timeStr}`
}

function isUpcomingSoon(iso: string): boolean {
  const diffDays = localDayDiff(iso)
  if (diffDays < 0 || diffDays > 3) return false
  if (diffDays > 0) return true
  const d = new Date(iso).getTime()
  const now = Date.now()
  return d > now
}

export const LessonCard: React.FC<Props> = ({ lesson, onFeedback, onEnroll, onGiveUp }) => {
  const { togglePrepItem } = useTrialStore()
  const statusStyle = STATUS_COLORS[lesson.status]

  const completedPrep = lesson.prepItems.filter((p) => p.completed).length
  const totalPrep = lesson.prepItems.length
  const prepPercent = totalPrep > 0 ? Math.round((completedPrep / totalPrep) * 100) : 0

  const renderStars = (level: number, max: number = 5) => {
    return (
      <span className="rating-stars">
        {Array.from({ length: max }, (_, i) => (
          <Star
            key={i}
            size={12}
            className={`star ${i < level ? 'filled' : ''}`}
            fill={i < level ? 'currentColor' : 'none'}
          />
        ))}
      </span>
    )
  }

  return (
    <div className="lesson-card">
      <div className="card-photo">
        <img src={lesson.classroomPhoto} alt={lesson.courseName} loading="lazy" />
        <div className="card-photo-overlay" />
        <span
          className="card-status-badge"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
        >
          {lesson.status}
        </span>
        <span className="card-category-tag">
          <span>{CATEGORY_ICONS[lesson.category]}</span>
          {lesson.category}
        </span>
        <span className={`card-fee-tag ${lesson.fee === 0 ? 'free' : ''}`}>
          {lesson.fee === 0 ? '🆓 免费' : `💰 ¥${lesson.fee}`}
        </span>
      </div>

      <div className="card-body">
        <div className="card-title-row">
          <span className="card-org">{lesson.organization}</span>
        </div>
        <div className="card-course-name">{lesson.courseName}</div>

        <div className="card-info-grid">
          <div className="card-info-item">
            <Users size={14} className="card-info-icon" />
            <span className="card-info-text">{lesson.ageGroup}</span>
          </div>
          <div className="card-info-item">
            <User size={14} className="card-info-icon" />
            <span className="card-info-text">{lesson.teacher}</span>
          </div>
          <div className="card-info-item" style={{ gridColumn: 'span 2' }}>
            <Calendar size={14} className="card-info-icon" />
            <span className="card-info-text" style={{ color: isUpcomingSoon(lesson.trialTime) && lesson.status === '待试听' ? 'var(--warning)' : 'inherit', fontWeight: isUpcomingSoon(lesson.trialTime) && lesson.status === '待试听' ? 600 : 400 }}>
              {formatDateTime(lesson.trialTime)}
            </span>
          </div>
          <div className="card-info-item" style={{ gridColumn: 'span 2' }}>
            <MapPin size={14} className="card-info-icon" />
            <span className="card-info-text">{lesson.address}</span>
          </div>
        </div>

        {lesson.status === '待试听' && isUpcomingSoon(lesson.trialTime) && (
          <div className="date-warning">
            <Clock size={14} />
            试听即将到来，别忘了哦！
          </div>
        )}

        {lesson.status === '待试听' && totalPrep > 0 && (
          <div className="card-section">
            <div className="card-section-title">
              <Sparkles size={14} style={{ color: 'var(--warning)' }} />
              试听准备事项
            </div>
            <div className="prep-progress">
              <div className="prep-progress-bar">
                <div className="prep-progress-fill" style={{ width: `${prepPercent}%` }} />
              </div>
              <span className="prep-progress-text">
                {completedPrep}/{totalPrep}
              </span>
            </div>
            <div className="prep-list">
              {lesson.prepItems.map((item) => (
                <div
                  key={item.id}
                  className={`prep-item ${item.completed ? 'completed' : ''}`}
                  onClick={() => togglePrepItem(lesson.id, item.id)}
                >
                  <div className="prep-check">
                    {item.completed && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span className="prep-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {lesson.status === '已试听' && lesson.feedback && (
          <div className="card-section">
            <div className="card-section-title">
              <Star size={14} style={{ color: '#fbbf24' }} />
              试听反馈
            </div>
            <div className="feedback-preview">
              <div className="feedback-row">
                <span className="feedback-label">孩子兴趣度</span>
                <span className="feedback-value">
                  {renderStars(lesson.feedback.childInterest)}
                  <span style={{ marginLeft: 6 }}>{INTEREST_LABELS[lesson.feedback.childInterest]}</span>
                </span>
              </div>
              <div className="feedback-row">
                <span className="feedback-label">交通方便度</span>
                <span className="feedback-value">
                  {renderStars(lesson.feedback.convenience)}
                  <span style={{ marginLeft: 6 }}>{CONVENIENCE_LABELS[lesson.feedback.convenience]}</span>
                </span>
              </div>
              {lesson.feedback.teacherFeedback && (
                <p className="feedback-text">💬 {lesson.feedback.teacherFeedback}</p>
              )}
            </div>
          </div>
        )}

        {lesson.status === '已报名' && lesson.enrollment && (
          <div className="card-section">
            <div className="enrollment-banner">
              <div className="enrollment-title">
                <Check size={16} />
                已决定报名
              </div>
              <p className="enrollment-reason">📝 {lesson.enrollment.reason}</p>
              {lesson.enrollment.discountInfo && (
                <div className="discount-info">🎁 {lesson.enrollment.discountInfo}</div>
              )}
              {lesson.enrollment.discountDeadline && (
                <div className="discount-deadline">
                  <AlertCircle size={12} style={{ verticalAlign: -2 }} />
                  优惠截止：{lesson.enrollment.discountDeadline}
                </div>
              )}
            </div>
          </div>
        )}

        {lesson.status === '放弃' && lesson.giveUpReason && (
          <div className="card-section">
            <div className="giveup-banner">
              <div className="giveup-title">
                <ThumbsDown size={16} />
                已放弃
              </div>
              <p className="giveup-reason">{lesson.giveUpReason}</p>
            </div>
          </div>
        )}

        <div className="card-actions">
          {lesson.status === '待试听' && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => onGiveUp(lesson.id)}>
                <ThumbsDown size={14} />
                放弃
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => onFeedback(lesson.id)}>
                <Sparkles size={14} />
                填写反馈
              </button>
            </>
          )}
          {lesson.status === '已试听' && (
            <>
              <button className="btn btn-danger btn-sm" onClick={() => onGiveUp(lesson.id)}>
                <ThumbsDown size={14} />
                放弃
              </button>
              <button className="btn btn-success btn-sm" onClick={() => onEnroll(lesson.id)}>
                <ThumbsUp size={14} />
                决定报名
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
