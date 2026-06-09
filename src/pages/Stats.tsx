import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, Flame, Trophy, Heart, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useReadingStore } from '@/store'

const WARM_COLORS = [
  'bg-orange-100 text-orange-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-red-100 text-red-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
  'bg-warm-200 text-warm-800',
  'bg-coral-100 text-coral-500',
]

export default function Stats() {
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { getMonthlyStats, getOverallConsecutiveDays, getLongestConsecutiveDays, getFavoriteThemes, getStuckBooks, books } = useReadingStore()

  const monthlyStats = getMonthlyStats(year, month)
  const currentStreak = getOverallConsecutiveDays()
  const longestStreak = getLongestConsecutiveDays()
  const favoriteThemes = getFavoriteThemes()
  const stuckBooks = getStuckBooks()

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}分钟`
    if (mins === 0) return `${hours}小时`
    return `${hours}小时${mins}分钟`
  }

  const getBookById = (bookId: string) => books.find((b) => b.id === bookId)

  return (
    <div className="min-h-screen bg-warm-50 pb-8">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-bold font-display text-stone-800 text-center mb-6">阅读统计</h1>

        <div className="flex items-center justify-center gap-4 mb-6">
          <button onClick={prevMonth} className="btn-secondary p-2 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-bold font-display text-stone-800 min-w-[120px] text-center">
            {year}年{month}月
          </span>
          <button onClick={nextMonth} className="btn-secondary p-2 rounded-full">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card flex flex-col items-center justify-center py-5">
            <BookOpen size={24} className="text-warm-500 mb-2" />
            <span className="text-3xl font-bold font-display text-stone-800">{monthlyStats.booksRead}</span>
            <span className="text-sm text-stone-500 mt-1">本月读完</span>
          </div>
          <div className="card flex flex-col items-center justify-center py-5">
            <Clock size={24} className="text-warm-500 mb-2" />
            <span className="text-3xl font-bold font-display text-stone-800">{monthlyStats.totalCheckIns}</span>
            <span className="text-sm text-stone-500 mt-1">打卡次数</span>
          </div>
          <div className="card flex flex-col items-center justify-center py-5">
            <Clock size={24} className="text-warm-500 mb-2" />
            <span className="text-xl font-bold font-display text-stone-800">{formatDuration(monthlyStats.totalDuration)}</span>
            <span className="text-sm text-stone-500 mt-1">阅读时长</span>
          </div>
          <div className="card flex flex-col items-center justify-center py-5">
            <Heart size={24} className="text-coral-500 mb-2" />
            <span className="text-3xl font-bold font-display text-stone-800">{monthlyStats.togetherCount}</span>
            <span className="text-sm text-stone-500 mt-1">亲子共读</span>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="section-title mb-4">连续打卡</h2>
          <div className="flex gap-4">
            <div className="flex-1 flex items-center gap-3 bg-orange-50 rounded-xl2 p-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame size={22} className="text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-stone-800">{currentStreak}<span className="text-sm font-normal text-stone-500 ml-1">天</span></div>
                <div className="text-xs text-stone-500">当前连续</div>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3 bg-amber-50 rounded-xl2 p-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Trophy size={22} className="text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-stone-800">{longestStreak}<span className="text-sm font-normal text-stone-500 ml-1">天</span></div>
                <div className="text-xs text-stone-500">最长连续</div>
              </div>
            </div>
          </div>
        </div>

        {favoriteThemes.length > 0 && (
          <div className="card mb-6">
            <h2 className="section-title mb-4">最喜欢的主题</h2>
            <div className="flex flex-wrap gap-2">
              {favoriteThemes.map((item, index) => (
                <span
                  key={item.theme}
                  className={`badge ${WARM_COLORS[index % WARM_COLORS.length]}`}
                >
                  {item.theme} · {item.count}次
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="section-title mb-4">搁置的书籍</h2>
          {stuckBooks.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-stone-400">
              <AlertCircle size={40} className="mb-2" />
              <span className="text-sm">没有搁置的书籍，继续保持吧！</span>
            </div>
          ) : (
            <div className="space-y-3">
              {stuckBooks.map((stuck) => {
                const book = getBookById(stuck.bookId)
                if (!book) return null
                return (
                  <div key={stuck.bookId} className="flex items-center gap-3 bg-warm-50 rounded-xl2 p-3">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-stone-800 truncate">{book.title}</div>
                      <div className="mt-1.5 h-2 bg-warm-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warm-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round(stuck.progress * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-stone-500">已搁置{stuck.daysSinceLastRead}天</span>
                        <span className="text-xs text-stone-400">{Math.round(stuck.progress * 100)}%</span>
                      </div>
                    </div>
                    <button
                      className="btn-primary text-sm py-1.5 px-3 flex-shrink-0"
                      onClick={() => navigate(`/checkin?bookId=${stuck.bookId}`)}
                    >
                      继续阅读
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
