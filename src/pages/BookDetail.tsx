import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, Star, Users, User, PenLine, Pencil, Heart } from 'lucide-react'
import { useReadingStore } from '@/store'
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/types'
import type { CheckInRecord } from '@/types'

type FilterType = 'all' | 'together' | 'independent'

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const books = useReadingStore((s) => s.books)
  const getBookProgress = useReadingStore((s) => s.getBookProgress)
  const getCheckInsByBook = useReadingStore((s) => s.getCheckInsByBook)
  const getConsecutiveDays = useReadingStore((s) => s.getConsecutiveDays)

  const [filter, setFilter] = useState<FilterType>('all')

  const book = useMemo(() => books.find((b) => b.id === id) || null, [books, id])
  const progress = useMemo(() => (id ? getBookProgress(id) : 0), [id, getBookProgress])
  const streak = useMemo(() => (id ? getConsecutiveDays(id) : 0), [id, getConsecutiveDays])
  const allCheckIns = useMemo(() => (id ? getCheckInsByBook(id) : []), [id, getCheckInsByBook])

  const filteredCheckIns = useMemo(() => {
    if (filter === 'all') return allCheckIns
    return allCheckIns.filter((c) => c.readingType === filter)
  }, [allCheckIns, filter])

  const totalDuration = useMemo(
    () => allCheckIns.reduce((sum, c) => sum + c.duration, 0),
    [allCheckIns]
  )

  const togetherCount = allCheckIns.filter((c) => c.readingType === 'together').length
  const independentCount = allCheckIns.filter((c) => c.readingType === 'independent').length

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    const local = new Date(y, m - 1, d)
    return `${m}月${d}日 星期${weekDays[local.getDay()]}`
  }

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}分钟`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
  }

  if (!book) {
    return (
      <div className="p-4 text-center py-20 text-stone-400">
        <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
        <p>找不到这本书</p>
        <button onClick={() => navigate('/books')} className="btn-primary mt-4 text-sm">
          返回书架
        </button>
      </div>
    )
  }

  const percent = Math.round(progress * 100)
  const maxPage = allCheckIns.length > 0 ? Math.max(...allCheckIns.map((c) => c.currentPage)) : 0

  return (
    <div className="pb-6">
      <div className="relative bg-gradient-to-br from-warm-500 to-warm-600 text-white px-4 pt-4 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/books')}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-lg flex-1 truncate">{book.title}</h1>
          <button
            onClick={() => navigate(`/books/${book.id}/edit`)}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil size={18} />
          </button>
        </div>

        <div className="flex gap-4">
          <div className="w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-lg bg-warm-400">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen size={32} className="text-white/60" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 py-1">
            <h2 className="font-display text-xl leading-tight mb-2 line-clamp-2">{book.title}</h2>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="badge bg-white/20 text-white text-[10px]">{book.theme}</span>
              <span className="badge bg-white/20 text-white text-[10px]">{book.ageRange}</span>
              <span className="badge bg-white/20 text-white text-[10px]">
                {DIFFICULTY_LABELS[book.difficulty]}
              </span>
            </div>
            <p className="text-sm text-white/70">共 {book.totalPages} 页</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-500">阅读进度</span>
            <span className="font-display text-lg text-warm-600">{percent}%</span>
          </div>
          <div className="h-3 bg-warm-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-warm-400 to-mint-400 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-stone-400">
            <span>已读到第 {maxPage} 页</span>
            <span>剩余 {book.totalPages - maxPage} 页</span>
          </div>

          <div className="flex gap-3 mt-4 pt-4 border-t border-warm-100">
            <div className="flex-1 flex items-center gap-2 bg-warm-50 rounded-xl2 p-3">
              <Clock size={18} className="text-warm-500" />
              <div>
                <p className="text-sm font-bold text-stone-800">{formatDuration(totalDuration)}</p>
                <p className="text-[10px] text-stone-400">累计时长</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 bg-warm-50 rounded-xl2 p-3">
              <Heart size={18} className="text-coral-400" />
              <div>
                <p className="text-sm font-bold text-stone-800">{streak} 天</p>
                <p className="text-[10px] text-stone-400">连续打卡</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/checkin?bookId=${book.id}`)}
          className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
        >
          <PenLine size={20} />
          继续打卡
        </button>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">打卡记录</h2>
            <span className="text-xs text-stone-400">{allCheckIns.length} 次打卡</span>
          </div>

          <div className="flex gap-2 mb-4">
            {([
              { key: 'all' as FilterType, label: '全部', count: allCheckIns.length },
              { key: 'together' as FilterType, label: '亲子共读', count: togetherCount },
              { key: 'independent' as FilterType, label: '自己读', count: independentCount },
            ]).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-1 py-2 rounded-xl2 text-sm font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-warm-500 text-white shadow-md'
                    : 'bg-white text-stone-500 border border-warm-200'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`ml-1 text-xs ${filter === key ? 'text-white/70' : 'text-stone-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filteredCheckIns.length === 0 ? (
            <div className="card text-center py-10 text-stone-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-warm-200" />
              <p className="font-display text-stone-500">
                {allCheckIns.length === 0 ? '还没有打卡记录' : '没有符合条件的记录'}
              </p>
              <p className="text-sm mt-1 text-stone-400">
                {allCheckIns.length === 0 ? '快去打卡开始阅读吧' : '试试切换筛选条件'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCheckIns.map((record: CheckInRecord) => (
                <div key={record.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-stone-700">{formatDate(record.date)}</span>
                    <span
                      className={`badge text-[10px] ${
                        record.readingType === 'together'
                          ? 'bg-coral-100 text-coral-500'
                          : 'bg-blue-100 text-blue-500'
                      }`}
                    >
                      {record.readingType === 'together' ? (
                        <span className="flex items-center gap-0.5">
                          <Users size={10} />
                          亲子共读
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5">
                          <User size={10} />
                          自己读
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-stone-500 mb-2">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} className="text-warm-400" />
                      读到第 {record.currentPage} 页
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-warm-400" />
                      {record.duration} 分钟
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    {([1, 2, 3, 4, 5] as const).map((v) => (
                      <Star
                        key={v}
                        size={14}
                        className={
                          v <= record.enjoyment
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-200 fill-stone-200'
                        }
                      />
                    ))}
                    <span className="text-xs text-stone-400 ml-1">
                      {['', '不太喜欢', '一般般', '挺喜欢的', '非常喜欢', '超级棒！'][record.enjoyment]}
                    </span>
                  </div>

                  {record.retelling && (
                    <div className="bg-warm-50 rounded-xl2 p-3 mt-2">
                      <p className="text-xs text-stone-400 mb-1">孩子的复述</p>
                      <p className="text-sm text-stone-700 leading-relaxed">{record.retelling}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
