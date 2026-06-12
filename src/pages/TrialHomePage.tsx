import React, { useState, useMemo } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { useTrialStore } from '../store/trialStore'
import type { TrialStatus } from '../types/trial'
import { LessonCard } from '../components/LessonCard'
import { StatsSection } from '../components/StatsSection'
import { AddLessonModal } from '../components/AddLessonModal'
import { FeedbackModal } from '../components/FeedbackModal'
import { EnrollModal } from '../components/EnrollModal'
import { GiveUpModal } from '../components/GiveUpModal'

const TABS: { key: TrialStatus | '全部'; label: string; emoji: string }[] = [
  { key: '全部', label: '全部', emoji: '📋' },
  { key: '待试听', label: '待试听', emoji: '⏳' },
  { key: '已试听', label: '已试听', emoji: '✅' },
  { key: '已报名', label: '已报名', emoji: '🎉' },
  { key: '放弃', label: '放弃', emoji: '❌' }
]

export const TrialHomePage: React.FC = () => {
  const { lessons } = useTrialStore()
  const [activeTab, setActiveTab] = useState<TrialStatus | '全部'>('全部')
  const [showAddModal, setShowAddModal] = useState(false)
  const [feedbackLessonId, setFeedbackLessonId] = useState<string | null>(null)
  const [enrollLessonId, setEnrollLessonId] = useState<string | null>(null)
  const [giveUpLessonId, setGiveUpLessonId] = useState<string | null>(null)

  const filteredLessons = useMemo(() => {
    let result = lessons
    if (activeTab !== '全部') {
      result = lessons.filter((l) => l.status === activeTab)
    }
    return result.sort((a, b) => {
      if (a.status === '待试听' && b.status !== '待试听') return -1
      if (b.status === '待试听' && a.status !== '待试听') return 1
      return new Date(a.trialTime).getTime() - new Date(b.trialTime).getTime()
    })
  }, [lessons, activeTab])

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { 全部: lessons.length }
    TABS.slice(1).forEach((t) => {
      counts[t.key] = lessons.filter((l) => l.status === t.key).length
    })
    return counts
  }, [lessons])

  return (
    <div className="app-shell">
      <div className="app-content">
        <div className="page-container">
          <div className="page-header">
            <div className="page-title-group">
              <div>
                <h1>🎨 试听记录</h1>
                <p className="page-subtitle">
                  已记录 {lessons.length} 个试听课程
                </p>
              </div>
            </div>
            <button
              className="btn-icon primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={20} />
            </button>
          </div>

          <StatsSection />

          <div className="tab-bar">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.emoji}</span>
                {tab.label}
                <span className="tab-count">{tabCounts[tab.key] || 0}</span>
              </button>
            ))}
          </div>

          <div className="lesson-list">
            {filteredLessons.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {activeTab === '全部' ? '📝' : activeTab === '待试听' ? '⏰' : activeTab === '已试听' ? '🎯' : activeTab === '已报名' ? '🎊' : '🗑️'}
                </div>
                <h3>
                  {activeTab === '全部'
                    ? '还没有试听记录'
                    : `暂无${activeTab}的课程`}
                </h3>
                <p>
                  {activeTab === '全部'
                    ? '点击右上角 + 号添加第一个试听吧～'
                    : '切换标签看看其他状态的课程'}
                </p>
                {activeTab === '全部' && (
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 20, width: 'auto', padding: '12px 28px' }}
                    onClick={() => setShowAddModal(true)}
                  >
                    <Sparkles size={16} />
                    添加试听
                  </button>
                )}
              </div>
            ) : (
              filteredLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onFeedback={(id) => setFeedbackLessonId(id)}
                  onEnroll={(id) => setEnrollLessonId(id)}
                  onGiveUp={(id) => setGiveUpLessonId(id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddLessonModal onClose={() => setShowAddModal(false)} />
      )}
      {feedbackLessonId && (
        <FeedbackModal
          lessonId={feedbackLessonId}
          onClose={() => setFeedbackLessonId(null)}
        />
      )}
      {enrollLessonId && (
        <EnrollModal
          lessonId={enrollLessonId}
          onClose={() => setEnrollLessonId(null)}
        />
      )}
      {giveUpLessonId && (
        <GiveUpModal
          lessonId={giveUpLessonId}
          onClose={() => setGiveUpLessonId(null)}
        />
      )}
    </div>
  )
}
