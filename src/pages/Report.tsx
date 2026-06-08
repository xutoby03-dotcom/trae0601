import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Download, BookOpen, Moon, Clock, Star } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { THEME_ICONS } from '@/types'

export default function Report() {
  const { books, sessions, getMonthSessions } = useStore()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [exporting, setExporting] = useState(false)

  const yearMonth = `${year}-${String(month).padStart(2, '0')}`
  const monthSessions = useMemo(() => getMonthSessions(yearMonth), [getMonthSessions, yearMonth])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const stats = useMemo(() => {
    if (monthSessions.length === 0) return null
    const uniqueBookIds = new Set(monthSessions.map(s => s.bookId))
    const totalMinutes = monthSessions.reduce((sum, s) => sum + s.duration, 0)
    const avgHappiness = monthSessions.reduce((sum, s) => sum + s.happinessScore, 0) / monthSessions.length
    return {
      bookCount: uniqueBookIds.size,
      sessionCount: monthSessions.length,
      totalMinutes,
      avgHappiness: Math.round(avgHappiness * 10) / 10,
    }
  }, [monthSessions])

  const topBooks = useMemo(() => {
    const countMap: Record<string, number> = {}
    monthSessions.forEach(s => { countMap[s.bookId] = (countMap[s.bookId] || 0) + 1 })
    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([bookId, count]) => {
        const book = books.find(b => b.id === bookId)
        return book ? { ...book, sessionCount: count } : null
      })
      .filter(Boolean)
  }, [monthSessions, books])

  const highlights = useMemo(() => {
    if (monthSessions.length === 0) return null
    const bestFocus = monthSessions.reduce((best, s) => s.focusScore > best.focusScore ? s : best)
    const happiest = monthSessions.reduce((best, s) => s.happinessScore > best.happinessScore ? s : best)
    const mostQuestions = monthSessions.reduce((best, s) =>
      (s.questionsAsked?.length || 0) > (best.questionsAsked?.length || 0) ? s : best
    )
    return { bestFocus, happiest, mostQuestions }
  }, [monthSessions])

  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      const h = Math.floor(mins / 60)
      const m = mins % 60
      return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
    }
    return `${mins}分钟`
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const el = document.getElementById('report-card')
      if (!el) return
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#FFF8F0',
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `亲子阅读月报_${year}年${month}月.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setExporting(false)
    }
  }

  const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-bark">亲子阅读月报</h1>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="btn-secondary !px-3 !py-1.5">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-display text-bark min-w-[6rem] text-center">
            {year}年{monthNames[month - 1]}
          </span>
          <button onClick={nextMonth} className="btn-secondary !px-3 !py-1.5">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {monthSessions.length === 0 ? (
        <div className="card-base flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="text-5xl">📖</div>
          <p className="font-display text-lg text-bark">{year}年{month}月还没有共读记录</p>
          <p className="text-sm text-warm-gray">快和宝贝一起读一本绘本吧！</p>
        </div>
      ) : (
        <>
          <div
            id="report-card"
            className="card-base p-6 md:p-8"
            style={{
              background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF1E0 50%, #FFF8F0 100%)',
            }}
          >
            <div className="relative">
              <div className="absolute -top-4 -right-4 text-6xl opacity-10">📚</div>
              <div className="absolute -bottom-2 -left-2 text-5xl opacity-10">🌙</div>

              <h2 className="font-display text-xl text-bark text-center md:text-2xl">
                {year}年{month}月 亲子阅读月报
              </h2>
              <div className="mx-auto mt-3 mb-6 h-0.5 w-24 rounded-full bg-gradient-to-r from-transparent via-caramel to-transparent" />

              {stats && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                  <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/60 p-3">
                    <span className="text-2xl">📚</span>
                    <span className="text-2xl font-bold text-caramel-dark">{stats.bookCount}</span>
                    <span className="text-xs text-warm-gray">共读本数</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/60 p-3">
                    <span className="text-2xl">🌙</span>
                    <span className="text-2xl font-bold text-caramel-dark">{stats.sessionCount}</span>
                    <span className="text-xs text-warm-gray">共读次数</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/60 p-3">
                    <span className="text-2xl">⏱️</span>
                    <span className="text-2xl font-bold text-caramel-dark">{stats.totalMinutes >= 60 ? `${Math.floor(stats.totalMinutes / 60)}h${stats.totalMinutes % 60}m` : `${stats.totalMinutes}m`}</span>
                    <span className="text-xs text-warm-gray">阅读时长</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/60 p-3">
                    <span className="text-2xl">⭐</span>
                    <span className="text-2xl font-bold text-caramel-dark">{stats.avgHappiness}/5</span>
                    <span className="text-xs text-warm-gray">平均开心</span>
                  </div>
                </div>
              )}

              {topBooks.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-display text-bark mb-3 text-base">📖 最爱绘本</h3>
                  <div className="flex flex-col gap-2">
                    {topBooks.map((book, i) => book && (
                      <div key={book.id} className="flex items-center gap-3 rounded-xl bg-white/60 p-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-caramel text-sm font-bold text-white">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-bark text-sm truncate">{book.title}</p>
                          <p className="text-xs text-warm-gray truncate">{book.author}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-sunny/80 px-2 py-0.5 text-xs font-bold text-bark">
                            ×{book.sessionCount}
                          </span>
                          {book.themes?.slice(0, 2).map(t => (
                            <span key={t} className="rounded-full bg-blush/60 px-2 py-0.5 text-xs text-caramel-dark">
                              {THEME_ICONS[t] || ''}{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {highlights && (
                <div className="mt-6">
                  <h3 className="font-display text-bark mb-3 text-base">✨ 阅读亮点</h3>
                  <div className="flex flex-col gap-2">
                    <div className="rounded-xl bg-white/60 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">🎯</span>
                        <span className="text-sm font-medium text-bark">最专注</span>
                        <span className="text-xs text-caramel-dark bg-mint/50 rounded-full px-2 py-0.5">
                          专注度 {highlights.bestFocus.focusScore}/5
                        </span>
                      </div>
                      {highlights.bestFocus.childReaction && (
                        <p className="text-xs text-warm-gray pl-6">{highlights.bestFocus.childReaction}</p>
                      )}
                    </div>
                    <div className="rounded-xl bg-white/60 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">😊</span>
                        <span className="text-sm font-medium text-bark">最开心</span>
                        <span className="text-xs text-caramel-dark bg-sunny/60 rounded-full px-2 py-0.5">
                          开心度 {highlights.happiest.happinessScore}/5
                        </span>
                      </div>
                      {highlights.happiest.childReaction && (
                        <p className="text-xs text-warm-gray pl-6">{highlights.happiest.childReaction}</p>
                      )}
                    </div>
                    {highlights.mostQuestions.questionsAsked && (
                      <div className="rounded-xl bg-white/60 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">💬</span>
                          <span className="text-sm font-medium text-bark">问题最多</span>
                        </div>
                        <p className="text-xs text-warm-gray pl-6">{highlights.mostQuestions.questionsAsked}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-xs text-warm-gray/80">Generated by 绘本共读记 ❤️</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {exporting ? '生成中...' : '导出月报图片'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
