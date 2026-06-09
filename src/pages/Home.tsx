import { useReadingStore } from '@/store'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  Flame,
  Plus,
  ChevronRight,
  BookMarked,
  Trophy,
  Sparkles,
} from 'lucide-react'

function getFormattedDate() {
  const now = new Date()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekDay = weekDays[now.getDay()]
  return `${month}月${day}日 星期${weekDay}`
}

function getEncouragingMessage(streak: number): string {
  if (streak === 0) return '今天开始新的阅读旅程吧 🌱'
  if (streak < 3) return '好的开始！继续加油哦 💪'
  if (streak < 7) return '坚持得真棒！习惯正在养成 ✨'
  if (streak < 14) return '太厉害了！你已经是阅读小达人啦 🌟'
  if (streak < 30) return '不可思议的坚持！超级阅读王 🏆'
  return '传奇阅读家！你的坚持令人敬佩 👑'
}

function BookCover({ coverUrl, title }: { coverUrl: string; title: string }) {
  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt={title}
        className="w-full h-full object-cover rounded-lg"
      />
    )
  }
  return (
    <div className="w-full h-full bg-warm-100 rounded-lg flex items-center justify-center">
      <BookOpen className="w-8 h-8 text-warm-400" />
    </div>
  )
}

export default function Home() {
  const books = useReadingStore((s) => s.books)
  const getTodayCheckIns = useReadingStore((s) => s.getTodayCheckIns)
  const getBookProgress = useReadingStore((s) => s.getBookProgress)
  const getConsecutiveDays = useReadingStore((s) => s.getConsecutiveDays)
  const getOverallConsecutiveDays = useReadingStore((s) => s.getOverallConsecutiveDays)

  const overallStreak = getOverallConsecutiveDays()
  const todayCheckIns = getTodayCheckIns()
  const checkedInBookIds = new Set(todayCheckIns.map((c) => c.bookId))

  const unreadBooks = books.filter((b) => !checkedInBookIds.has(b.id))

  const streakBooks = books
    .map((b) => ({ ...b, streak: getConsecutiveDays(b.id) }))
    .filter((b) => b.streak > 0)
    .sort((a, b) => b.streak - a.streak)

  const almostDoneBooks = books
    .map((b) => {
      const progress = getBookProgress(b.id)
      return { ...b, progress, remainingPages: Math.ceil(b.totalPages * (1 - progress)) }
    })
    .filter((b) => b.progress > 0.8 && b.progress < 1)
    .sort((a, b) => b.progress - a.progress)

  return (
    <div className="space-y-6 pb-4">
      <div className="card bg-gradient-to-br from-warm-500 to-warm-600 text-white border-0">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 opacity-80" />
          <span className="text-sm opacity-90">{getFormattedDate()}</span>
        </div>
        <h1 className="font-display text-2xl mb-1">
          亲子阅读打卡
        </h1>
        <div className="flex items-center gap-2 mt-3">
          <Flame className="w-5 h-5 text-yellow-200 animate-float" />
          <span className="font-display text-xl">
            已连续 {overallStreak} 天
          </span>
        </div>
        <p className="mt-2 text-sm opacity-90">
          {getEncouragingMessage(overallStreak)}
        </p>
      </div>

      <div className="flex gap-3">
        <Link to="/books/add" className="flex-1">
          <button className="btn-secondary w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            添加书籍
          </button>
        </Link>
        <Link to="/checkin" className="flex-1">
          <button className="btn-primary w-full flex items-center justify-center gap-2">
            <BookMarked className="w-4 h-4" />
            去打卡
          </button>
        </Link>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-warm-500" />
          <h2 className="section-title">今日未读</h2>
          {unreadBooks.length > 0 && (
            <span className="badge bg-warm-100 text-warm-700 ml-auto">
              {unreadBooks.length}本
            </span>
          )}
        </div>
        {unreadBooks.length === 0 ? (
          <div className="card text-center py-8 text-stone-400">
            <Sparkles className="w-10 h-10 mx-auto mb-2 text-warm-300" />
            <p className="font-display text-stone-500">
              {books.length === 0 ? '还没有书籍，快去添加吧' : '今天已经全部打卡啦 🎉'}
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
            {unreadBooks.map((book) => (
              <Link
                key={book.id}
                to="/checkin"
                className="flex-shrink-0 w-36 snap-start"
              >
                <div className="card-hover flex flex-col items-center gap-2">
                  <div className="w-28 h-36">
                    <BookCover coverUrl={book.coverUrl} title={book.title} />
                  </div>
                  <p className="text-sm font-medium text-stone-700 text-center line-clamp-2 leading-tight">
                    {book.title}
                  </p>
                  <span className="text-xs text-warm-600 bg-warm-100 px-2 py-1 rounded-full">
                    快去打卡 →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-coral-500" />
          <h2 className="section-title">连续打卡中</h2>
        </div>
        {streakBooks.length === 0 ? (
          <div className="card text-center py-8 text-stone-400">
            <Flame className="w-10 h-10 mx-auto mb-2 text-warm-200" />
            <p className="font-display text-stone-500">还没有连续打卡记录</p>
            <p className="text-sm mt-1 text-stone-400">开始阅读并连续打卡吧</p>
          </div>
        ) : (
          <div className="space-y-2">
            {streakBooks.map((book) => (
              <div key={book.id} className="card flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0">
                  <BookCover coverUrl={book.coverUrl} title={book.title} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">
                    {book.title}
                  </p>
                </div>
                <span className="badge bg-gradient-to-r from-coral-200 to-warm-200 text-coral-500 flex-shrink-0">
                  <Flame className="w-3 h-3 mr-1" />
                  {book.streak}天
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-mint-500" />
          <h2 className="section-title">快读完啦</h2>
        </div>
        {almostDoneBooks.length === 0 ? (
          <div className="card text-center py-8 text-stone-400">
            <Trophy className="w-10 h-10 mx-auto mb-2 text-warm-200" />
            <p className="font-display text-stone-500">暂无快读完的书籍</p>
            <p className="text-sm mt-1 text-stone-400">继续加油，很快就能读完一本啦</p>
          </div>
        ) : (
          <div className="space-y-3">
            {almostDoneBooks.map((book) => (
              <div key={book.id} className="card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 flex-shrink-0">
                    <BookCover coverUrl={book.coverUrl} title={book.title} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">
                      {book.title}
                    </p>
                    <p className="text-xs text-stone-400">
                      还剩 {book.remainingPages} 页
                    </p>
                  </div>
                  <span className="badge bg-mint-100 text-mint-500 flex-shrink-0">
                    {Math.round(book.progress * 100)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-warm-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-warm-400 to-mint-400 rounded-full transition-all duration-500"
                    style={{ width: `${book.progress * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {books.length === 0 && (
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-warm-300" />
          <h3 className="font-display text-xl text-stone-600 mb-2">
            开始你的阅读之旅
          </h3>
          <p className="text-sm text-stone-400 mb-6">
            添加第一本书，开启亲子阅读的美好时光
          </p>
          <Link to="/books/add">
            <button className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加第一本书
            </button>
          </Link>
        </div>
      )}

      {books.length > 0 && unreadBooks.length > 0 && (
        <Link to="/checkin" className="block">
          <div className="card bg-gradient-to-r from-warm-500 to-warm-400 border-0 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <BookMarked className="w-6 h-6" />
              <div>
                <p className="font-display text-base">还有书没打卡哦</p>
                <p className="text-sm opacity-90">点击去完成今日阅读</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-80" />
          </div>
        </Link>
      )}
    </div>
  )
}
