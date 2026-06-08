import { useState } from 'react'
import { X, Clock, Heart, Brain, MessageCircle, Star, Smile } from 'lucide-react'
import type { ReadingSession } from '@/types'

interface ReadingSessionFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<ReadingSession, 'id' | 'createdAt'>) => void
  bookId: string
  bookTitle: string
}

const today = () => new Date().toISOString().split('T')[0]

const focusEmojis = ['😴', '😐', '🙂', '😊', '🤩']
const happyEmojis = ['😢', '😐', '🙂', '😄', '🥰']

export default function ReadingSessionForm({ open, onClose, onSubmit, bookId, bookTitle }: ReadingSessionFormProps) {
  const [date, setDate] = useState(today())
  const [duration, setDuration] = useState(15)
  const [childReaction, setChildReaction] = useState('')
  const [favoriteCharacter, setFavoriteCharacter] = useState('')
  const [questionsAsked, setQuestionsAsked] = useState('')
  const [focusScore, setFocusScore] = useState(3)
  const [happinessScore, setHappinessScore] = useState(3)

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      bookId,
      date,
      duration,
      childReaction,
      favoriteCharacter,
      questionsAsked,
      focusScore,
      happinessScore,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center backdrop-blur-sm bg-bark/30" onClick={onClose}>
      <div
        className="animate-slide-up w-full max-w-lg rounded-t-3xl md:rounded-3xl bg-cream shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <h2 className="font-display text-xl text-caramel">记录共读 · {bookTitle}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-caramel/10 transition-colors">
            <X className="w-5 h-5 text-bark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 pb-6 space-y-5 flex-1">
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-sm font-body text-bark/70">
              <Clock className="w-4 h-4" /> 日期
            </label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-base" />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-sm font-body text-bark/70">
              <Clock className="w-4 h-4" /> 时长（分钟）
            </label>
            <div className="flex items-center gap-2">
              <input type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="input-base w-24" />
              <span className="text-sm text-bark/60 font-body">分钟</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-sm font-body text-bark/70">
              <MessageCircle className="w-4 h-4" /> 孩子反应
            </label>
            <textarea value={childReaction} onChange={(e) => setChildReaction(e.target.value)} placeholder="孩子读了有什么反应？" className="input-base min-h-[72px] resize-none" />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-sm font-body text-bark/70">
              <Star className="w-4 h-4" /> 最喜欢的角色
            </label>
            <input type="text" value={favoriteCharacter} onChange={(e) => setFavoriteCharacter(e.target.value)} placeholder="最喜欢哪个角色？" className="input-base" />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-sm font-body text-bark/70">
              <Brain className="w-4 h-4" /> 孩子的问题
            </label>
            <textarea value={questionsAsked} onChange={(e) => setQuestionsAsked(e.target.value)} placeholder="孩子问了什么问题？" className="input-base min-h-[72px] resize-none" />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-body text-bark/70">
              <Smile className="w-4 h-4" /> 专注度
            </label>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{focusEmojis[focusScore - 1]}</span>
              <input type="range" min={1} max={5} value={focusScore} onChange={(e) => setFocusScore(Number(e.target.value))} className="flex-1 accent-caramel" />
            </div>
            <div className="flex justify-between text-xs text-bark/50 font-body">
              {focusEmojis.map((e, i) => <span key={i}>{e}{i + 1}</span>)}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-body text-bark/70">
              <Heart className="w-4 h-4" /> 开心度
            </label>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{happyEmojis[happinessScore - 1]}</span>
              <input type="range" min={1} max={5} value={happinessScore} onChange={(e) => setHappinessScore(Number(e.target.value))} className="flex-1 accent-caramel" />
            </div>
            <div className="flex justify-between text-xs text-bark/50 font-body">
              {happyEmojis.map((e, i) => <span key={i}>{e}{i + 1}</span>)}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">取消</button>
            <button type="submit" className="btn-primary flex-1">保存记录</button>
          </div>
        </form>
      </div>
    </div>
  )
}
