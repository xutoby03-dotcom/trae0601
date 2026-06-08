import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

const focusEmojis = ['😴', '😐', '🙂', '😊', '🤩']
const happyEmojis = ['😢', '😐', '🙂', '😄', '🥰']

export default function Calendar() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { sessions, books, getMonthSessions, getSessionsByDate } = useStore()

  const yearMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
  const monthSessions = getMonthSessions(yearMonth)

  const totalMinutes = monthSessions.reduce((sum, s) => sum + s.duration, 0)
  const uniqueBooks = new Set(monthSessions.map((s) => s.bookId)).size

  const sessionDates = new Set(monthSessions.map((s) => s.date))

  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
  }

  const formatDateStr = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const calendarCells: { day: number; dateStr: string; inMonth: boolean }[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const m = currentMonth === 0 ? 11 : currentMonth - 1
    const y = currentMonth === 0 ? currentYear - 1 : currentYear
    calendarCells.push({ day, dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`, inMonth: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, dateStr: formatDateStr(d), inMonth: true })
  }

  const remaining = 7 - (calendarCells.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1
      const y = currentMonth === 11 ? currentYear + 1 : currentYear
      calendarCells.push({ day: d, dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, inMonth: false })
    }
  }

  const selectedSessions = selectedDate ? getSessionsByDate(selectedDate) : []

  const getBookTitle = (bookId: string) => {
    const book = books.find((b) => b.id === bookId)
    return book?.title ?? '未知绘本'
  }

  return (
    <div className="px-4 pt-6 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-bark">睡前阅读日历</h1>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-caramel-light/40 transition-colors">
            <ChevronLeft className="w-5 h-5 text-bark" />
          </button>
          <span className="font-display text-lg text-caramel min-w-[7rem] text-center">
            {currentYear}年{currentMonth + 1}月
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-full hover:bg-caramel-light/40 transition-colors">
            <ChevronRight className="w-5 h-5 text-bark" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card-base p-3 text-center">
          <div className="text-2xl mb-1">🌙</div>
          <div className="font-display text-2xl text-caramel">{monthSessions.length}</div>
          <div className="text-xs text-warm-gray font-body">本月共读</div>
        </div>
        <div className="card-base p-3 text-center">
          <div className="text-2xl mb-1">⏱️</div>
          <div className="font-display text-2xl text-caramel">{totalMinutes}</div>
          <div className="text-xs text-warm-gray font-body">阅读时长</div>
        </div>
        <div className="card-base p-3 text-center">
          <div className="text-2xl mb-1">📖</div>
          <div className="font-display text-2xl text-caramel">{uniqueBooks}</div>
          <div className="text-xs text-warm-gray font-body">绘本数量</div>
        </div>
      </div>

      <div className="card-base p-4">
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-body text-warm-gray py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, idx) => {
            const hasSession = sessionDates.has(cell.dateStr)
            const isToday = cell.dateStr === todayStr
            const isSelected = cell.dateStr === selectedDate

            return (
              <button
                key={idx}
                onClick={() => cell.inMonth && setSelectedDate(isSelected ? null : cell.dateStr)}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center relative
                  transition-all duration-200 font-body text-sm
                  ${!cell.inMonth ? 'opacity-30' : ''}
                  ${hasSession && cell.inMonth ? 'bg-sunny/30' : ''}
                  ${isToday ? 'ring-2 ring-caramel' : ''}
                  ${isSelected ? 'bg-caramel/20 ring-2 ring-caramel' : ''}
                  ${cell.inMonth && !isSelected ? 'hover:bg-caramel-light/20' : ''}
                `}
              >
                <span className={`${isToday ? 'font-bold text-caramel' : cell.inMonth ? 'text-bark' : ''}`}>
                  {cell.day}
                </span>
                {hasSession && cell.inMonth && (
                  <span className="text-[10px] leading-none mt-0.5">🌙</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="space-y-3 animate-fade-up">
          <h3 className="font-display text-lg text-bark">
            {selectedDate} 共读记录
          </h3>
          {selectedSessions.length > 0 ? (
            selectedSessions.map((session) => (
              <div key={session.id} className="card-base p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display text-caramel">{getBookTitle(session.bookId)}</span>
                  <span className="text-sm text-warm-gray font-body">{session.duration}分钟</span>
                </div>
                {session.childReaction && (
                  <p className="text-sm text-bark/80 font-body">{session.childReaction}</p>
                )}
                <div className="flex items-center gap-3 text-sm font-body">
                  <span>专注 {focusEmojis[session.focusScore - 1]}</span>
                  <span>开心 {happyEmojis[session.happinessScore - 1]}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="card-base p-6 text-center text-warm-gray font-body">
              这一天没有共读记录
            </div>
          )}
        </div>
      )}
    </div>
  )
}
