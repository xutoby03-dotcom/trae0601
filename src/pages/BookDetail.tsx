import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import ReadingSessionForm from '@/components/ReadingSessionForm'
import type { ReadingSession } from '@/types'
import { THEME_ICONS } from '@/types'

const focusEmojis = ['😴', '😐', '🙂', '😊', '🤩']
const happyEmojis = ['😢', '😐', '🙂', '😄', '🥰']

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { books, deleteBook, addSession, getBookSessions } = useStore()
  const [formOpen, setFormOpen] = useState(false)

  const book = books.find((b) => b.id === id)
  const sessions = id ? getBookSessions(id) : []

  if (!book) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-body text-bark/60">绘本未找到</p>
      </div>
    )
  }

  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0)
  const avgFocus = sessions.length
    ? (sessions.reduce((sum, s) => sum + s.focusScore, 0) / sessions.length).toFixed(1)
    : '—'

  const handleDelete = () => {
    deleteBook(book.id)
    navigate(-1)
  }

  const handleAddSession = (data: Omit<ReadingSession, 'id' | 'createdAt'>) => {
    addSession(data)
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="sticky top-0 z-10 bg-cream/80 backdrop-blur-sm px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-caramel/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-bark" />
        </button>
      </div>

      <div className="px-4 space-y-5 max-w-2xl mx-auto">
        <div className="card-base p-5">
          <div className="flex gap-4">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-32 md:w-48 aspect-[3/4] rounded-2xl shadow-warm object-cover shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-2">
              <h1 className="font-display text-xl text-bark leading-tight">{book.title}</h1>
              <p className="font-body text-sm text-bark/70">{book.author}</p>
              <div className="flex flex-wrap gap-1.5">
                {book.themes.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-caramel-light/50 text-xs font-body text-bark">
                    {THEME_ICONS[t]} {t}
                  </span>
                ))}
              </div>
              <p className="font-body text-xs text-bark/60">{book.ageRange} · {book.pages}页</p>
            </div>
          </div>

          {book.adultNote && (
            <div className="mt-4 p-3 rounded-xl bg-sunny/30 text-sm font-body text-bark/80">
              💡 {book.adultNote}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button className="btn-secondary flex items-center gap-1.5 text-sm">
              <Pencil className="w-4 h-4" /> 编辑
            </button>
            <button onClick={handleDelete} className="btn-secondary flex items-center gap-1.5 text-sm text-red-500 hover:bg-red-50">
              <Trash2 className="w-4 h-4" /> 删除
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="card-base p-3 text-center">
            <p className="font-display text-2xl text-caramel">{book.readCount}</p>
            <p className="font-body text-xs text-bark/60 mt-0.5">共读次数</p>
          </div>
          <div className="card-base p-3 text-center">
            <p className="font-display text-2xl text-caramel">{totalDuration}</p>
            <p className="font-body text-xs text-bark/60 mt-0.5">总时长(分钟)</p>
          </div>
          <div className="card-base p-3 text-center">
            <p className="font-display text-2xl text-caramel">{avgFocus}</p>
            <p className="font-body text-xs text-bark/60 mt-0.5">平均专注度</p>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-bark mb-4">共读时间线</h2>

          {sessions.length === 0 ? (
            <p className="font-body text-bark/50 text-center py-8">还没有共读记录，开始第一次共读吧！</p>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-caramel/30 rounded-full" />
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="relative">
                    <div className="absolute -left-6 top-3 w-4 h-4 rounded-full bg-caramel border-2 border-cream" />
                    <div className="card-base p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-body text-sm text-bark/60">{session.date}</span>
                        <span className="font-body text-sm text-caramel font-medium">{session.duration} 分钟</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-body">
                        <span>专注 {focusEmojis[session.focusScore - 1]}</span>
                        <span>开心 {happyEmojis[session.happinessScore - 1]}</span>
                      </div>
                      {session.childReaction && (
                        <p className="font-body text-sm text-bark/80">💬 {session.childReaction}</p>
                      )}
                      {session.favoriteCharacter && (
                        <p className="font-body text-sm text-bark/80">⭐ {session.favoriteCharacter}</p>
                      )}
                      {session.questionsAsked && (
                        <p className="font-body text-sm text-bark/80">❓ {session.questionsAsked}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setFormOpen(true)} className="btn-primary w-full mt-4">
            + 添加共读记录
          </button>
        </div>
      </div>

      <ReadingSessionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAddSession}
        bookId={book.id}
        bookTitle={book.title}
      />
    </div>
  )
}
