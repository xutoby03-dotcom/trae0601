import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, isSameMonth, isToday, addMonths, subMonths, isWithinInterval, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useStore } from '@/store'
import type { ApplicationStatus } from '@/types'

const STATUS_BADGE: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  pending: { label: '待审核', bg: '#F4A26130', color: '#F4A261' },
  approved: { label: '已通过', bg: '#2D936C30', color: '#2D936C' },
  rejected: { label: '已拒绝', bg: '#E6394630', color: '#E63946' },
  expired: { label: '已过期', bg: '#1A1A2E20', color: '#1A1A2E88' },
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function BoardDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { boards, applications } = useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const board = boards.find(b => b.id === id)
  const boardApps = useMemo(
    () => applications.filter(a => a.boardId === id).sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [applications, id]
  )

  const approvedApps = useMemo(() => boardApps.filter(a => a.status === 'approved'), [boardApps])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDay = getDay(monthStart)

  const getAppsForDay = (date: Date) =>
    approvedApps.filter(a => isWithinInterval(date, { start: parseISO(a.startDate), end: parseISO(a.endDate) }))

  const photoRecords = useMemo(() => {
    const records: { url: string; date: string; status: '张贴' | '下架'; activityName: string }[] = []
    boardApps.forEach(a => {
      if (a.postedPhotoUrl) records.push({ url: a.postedPhotoUrl, date: a.postedAt, status: '张贴', activityName: a.activityName })
      if (a.removedPhotoUrl) records.push({ url: a.removedPhotoUrl, date: a.removedAt, status: '下架', activityName: a.activityName })
    })
    return records
  }, [boardApps])

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8F0' }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: '#1A1A2E' }}>展板不存在</p>
          <button onClick={() => navigate('/boards')} className="mt-4 px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#E8652E' }}>
            返回列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-20">
        <button onClick={() => navigate('/boards')} className="flex items-center gap-1 mb-4 text-sm font-medium" style={{ color: '#E8652E' }}>
          <ArrowLeft size={16} />返回展板列表
        </button>

        <h1 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>{board.name}</h1>
        <p className="text-sm mt-1" style={{ color: '#1A1A2E88' }}>{board.location}</p>

        <div className="mt-6 rounded-xl p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 rounded-lg hover:bg-gray-100">
              <ChevronLeft size={20} style={{ color: '#1A1A2E' }} />
            </button>
            <span className="font-semibold" style={{ color: '#1A1A2E' }}>
              {format(currentMonth, 'yyyy年M月', { locale: zhCN })}
            </span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 rounded-lg hover:bg-gray-100">
              <ChevronRight size={20} style={{ color: '#1A1A2E' }} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px" style={{ backgroundColor: '#1A1A2E10' }}>
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium py-2" style={{ backgroundColor: '#fff', color: '#1A1A2E88' }}>{d}</div>
            ))}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ backgroundColor: '#fff' }} />
            ))}
            {days.map(day => {
              const dayApps = getAppsForDay(day)
              const today = isToday(day)
              const sameMonth = isSameMonth(day, currentMonth)
              return (
                <div
                  key={day.toISOString()}
                  className="p-1 min-h-[60px]"
                  style={{
                    backgroundColor: sameMonth ? '#fff' : '#FFF8F0',
                    outline: today ? '2px solid #E8652E' : 'none',
                    outlineOffset: '-2px',
                  }}
                >
                  <div className="text-xs font-medium" style={{ color: today ? '#E8652E' : '#1A1A2E' }}>
                    {format(day, 'd')}
                  </div>
                  <div className="mt-0.5 space-y-0.5">
                    {dayApps.map(app => (
                      <div
                        key={app.id}
                        className="text-[9px] leading-tight px-0.5 rounded truncate"
                        style={{ backgroundColor: '#E8652E30', color: '#E8652E' }}
                      >
                        {app.clubName.slice(0, 2)}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#1A1A2E' }}>排期列表</h2>
          {boardApps.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{ color: '#1A1A2E44' }}>暂无申请记录</div>
          ) : (
            <div className="space-y-2">
              {boardApps.map(app => {
                const badge = STATUS_BADGE[app.status]
                return (
                  <div key={app.id} className="rounded-xl p-3 shadow-sm flex gap-3" style={{ backgroundColor: '#fff' }}>
                    <span
                      className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full self-start"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm" style={{ color: '#1A1A2E' }}>{app.activityName}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#1A1A2E88' }}>
                        {app.clubName} · {app.startDate} ~ {app.endDate} · {app.size} · {app.contact}
                      </div>
                    </div>
                    {app.status === 'approved' && app.postedPhotoUrl && (
                      <img src={app.postedPhotoUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {photoRecords.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#1A1A2E' }}>照片记录</h2>
            <div className="grid grid-cols-3 gap-3">
              {photoRecords.map((rec, i) => (
                <div key={i} className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: '#fff' }}>
                  <img src={rec.url} alt="" className="w-full h-24 object-cover" />
                  <div className="p-2">
                    <div className="text-xs font-medium truncate" style={{ color: '#1A1A2E' }}>{rec.activityName}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px]" style={{ color: '#1A1A2E66' }}>{rec.date}</span>
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: rec.status === '张贴' ? '#2D936C20' : '#E6394620',
                          color: rec.status === '张贴' ? '#2D936C' : '#E63946',
                        }}
                      >
                        {rec.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
