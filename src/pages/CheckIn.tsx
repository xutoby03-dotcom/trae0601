import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Star, Users, User, Clock, BookOpen, CheckCircle } from 'lucide-react'
import { useReadingStore } from '@/store'

export default function CheckIn() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const bookIdParam = searchParams.get('bookId')

  const { books, addCheckIn, getCheckInsByBook, getTodayCheckIns } = useReadingStore()

  const [selectedBookId, setSelectedBookId] = useState<string | null>(bookIdParam)
  const [duration, setDuration] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)
  const [enjoyment, setEnjoyment] = useState<1 | 2 | 3 | 4 | 5>(4)
  const [retelling, setRetelling] = useState('')
  const [readingType, setReadingType] = useState<'together' | 'independent'>('together')
  const [showCelebration, setShowCelebration] = useState(false)

  const today = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }, [])

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const selectedBook = useMemo(
    () => books.find((b) => b.id === selectedBookId) || null,
    [books, selectedBookId]
  )

  const bookCheckIns = useMemo(
    () => (selectedBookId ? getCheckInsByBook(selectedBookId) : []),
    [selectedBookId, getCheckInsByBook]
  )

  const lastPage = useMemo(() => {
    if (bookCheckIns.length === 0) return 0
    return Math.max(...bookCheckIns.map((c) => c.currentPage))
  }, [bookCheckIns])

  const alreadyCheckedInToday = useMemo(() => {
    if (!selectedBookId) return false
    return getTodayCheckIns().some((c) => c.bookId === selectedBookId)
  }, [selectedBookId, getTodayCheckIns])

  useEffect(() => {
    if (selectedBookId && lastPage > 0) {
      setCurrentPage(lastPage + 1)
    }
  }, [selectedBookId, lastPage])

  const handleSubmit = () => {
    if (!selectedBookId) return

    addCheckIn({
      bookId: selectedBookId,
      date: todayStr,
      duration,
      currentPage,
      enjoyment,
      retelling,
      readingType,
    })

    setShowCelebration(true)
    setTimeout(() => {
      navigate('/')
    }, 2000)
  }

  const stars = [1, 2, 3, 4, 5] as const

  const fallingStars = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.8}s`,
        size: 16 + Math.random() * 16,
      })),
    []
  )

  if (!selectedBookId) {
    return (
      <div className="p-4">
        <h1 className="section-title mb-1">今日打卡</h1>
        <p className="text-stone-500 text-sm mb-4">{today}</p>
        <p className="text-stone-600 mb-3">请先选择一本书</p>
        <div className="grid grid-cols-3 gap-3">
          {books.map((book) => (
            <button
              key={book.id}
              onClick={() => setSelectedBookId(book.id)}
              className="card-hover flex flex-col items-center gap-2 p-3"
            >
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full aspect-[3/4] object-cover rounded-lg"
              />
              <span className="text-xs font-medium text-stone-700 text-center line-clamp-2">
                {book.title}
              </span>
            </button>
          ))}
        </div>
        {books.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
            <p>还没有添加书籍</p>
            <button
              onClick={() => navigate('/books/add')}
              className="btn-primary mt-4 text-sm"
            >
              去添加
            </button>
          </div>
        )}
      </div>
    )
  }

  if (!selectedBook) {
    return (
      <div className="p-4 text-center py-12 text-stone-400">
        <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
        <p>找不到这本书</p>
        <button onClick={() => setSelectedBookId(null)} className="btn-primary mt-4 text-sm">
          重新选择
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 relative">
      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            {fallingStars.map((s) => (
              <div
                key={s.id}
                className="absolute animate-star-fall"
                style={{
                  left: s.left,
                  top: '-20px',
                  animationDelay: s.delay,
                }}
              >
                <Star size={s.size} className="text-amber-400 fill-amber-400" />
              </div>
            ))}
          </div>
          <div className="relative z-10 bg-white/95 rounded-2xl p-8 shadow-xl animate-scale-in flex flex-col items-center">
            <CheckCircle size={64} className="text-warm-500 mb-3" />
            <p className="font-display text-2xl text-warm-700">打卡成功！</p>
            <p className="text-stone-500 mt-1">太棒了，继续加油 🎉</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-1">
        <h1 className="section-title">今日打卡</h1>
        {!bookIdParam && (
          <button
            onClick={() => setSelectedBookId(null)}
            className="text-warm-600 text-sm font-medium"
          >
            换一本
          </button>
        )}
      </div>
      <p className="text-stone-500 text-sm mb-4">{today}</p>

      {alreadyCheckedInToday && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl2 p-3 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-amber-500 flex-shrink-0" />
          <span className="text-amber-700 text-sm">这本书今天已经打过卡了，但仍可以继续打卡哦</span>
        </div>
      )}

      <div className="card flex gap-3 mb-5">
        <img
          src={selectedBook.coverUrl}
          alt={selectedBook.title}
          className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex flex-col justify-center min-w-0">
          <p className="font-bold text-stone-800 truncate">{selectedBook.title}</p>
          <p className="text-stone-500 text-sm">共 {selectedBook.totalPages} 页</p>
          {lastPage > 0 && (
            <p className="text-warm-600 text-sm">上次读到第 {lastPage} 页</p>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="section-title flex items-center gap-2 mb-2">
            <Clock size={18} className="text-warm-500" />
            阅读时长（分钟）
          </label>
          <input
            type="number"
            min={1}
            max={300}
            value={duration}
            onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
            className="input-field text-center text-lg font-bold"
          />
        </div>

        <div>
          <label className="section-title flex items-center gap-2 mb-2">
            <BookOpen size={18} className="text-warm-500" />
            当前页码
          </label>
          <input
            type="number"
            min={1}
            max={selectedBook.totalPages}
            value={currentPage}
            onChange={(e) => setCurrentPage(Math.max(1, Number(e.target.value)))}
            className="input-field text-center text-lg font-bold"
          />
          <p className="text-stone-400 text-xs mt-1">全书共 {selectedBook.totalPages} 页</p>
        </div>

        <div>
          <label className="section-title mb-2 block">阅读感受</label>
          <div className="flex gap-2 justify-center py-2">
            {stars.map((value) => (
              <button
                key={value}
                onClick={() => setEnjoyment(value)}
                className="p-1 active:scale-90 transition-transform"
              >
                <Star
                  size={36}
                  className={
                    value <= enjoyment
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-stone-300 fill-stone-300'
                  }
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-stone-500">
            {['', '不太喜欢', '一般般', '挺喜欢的', '非常喜欢', '超级棒！'][enjoyment]}
          </p>
        </div>

        <div>
          <label className="section-title mb-2 block">一句话复述</label>
          <textarea
            value={retelling}
            onChange={(e) => setRetelling(e.target.value)}
            placeholder="今天读到了什么有趣的内容？"
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="section-title mb-2 block">阅读方式</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setReadingType('together')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl2 border-2 transition-all duration-200 ${
                readingType === 'together'
                  ? 'border-warm-500 bg-warm-50 shadow-md'
                  : 'border-warm-200 bg-white'
              }`}
            >
              <Users
                size={32}
                className={
                  readingType === 'together' ? 'text-warm-500' : 'text-stone-400'
                }
              />
              <span
                className={`font-bold text-base ${
                  readingType === 'together' ? 'text-warm-700' : 'text-stone-500'
                }`}
              >
                亲子共读
              </span>
            </button>
            <button
              onClick={() => setReadingType('independent')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl2 border-2 transition-all duration-200 ${
                readingType === 'independent'
                  ? 'border-warm-500 bg-warm-50 shadow-md'
                  : 'border-warm-200 bg-white'
              }`}
            >
              <User
                size={32}
                className={
                  readingType === 'independent' ? 'text-warm-500' : 'text-stone-400'
                }
              />
              <span
                className={`font-bold text-base ${
                  readingType === 'independent' ? 'text-warm-700' : 'text-stone-500'
                }`}
              >
                自己读
              </span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!duration || !currentPage || currentPage > selectedBook.totalPages}
        className="btn-primary w-full mt-6 text-lg py-4 disabled:opacity-50 disabled:active:scale-100"
      >
        完成打卡
      </button>
    </div>
  )
}
