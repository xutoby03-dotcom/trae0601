import { useState, useMemo } from 'react'
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'
import { useStore } from '@/store'

const STAT_CARDS = [
  { key: 'total', label: '总申请数', icon: FileText, color: '#E8652E' },
  { key: 'pending', label: '待处理', icon: Clock, color: '#F4A261' },
  { key: 'approved', label: '已通过', icon: CheckCircle, color: '#2D936C' },
  { key: 'conflicts', label: '冲突数', icon: AlertTriangle, color: '#E63946' },
] as const

const MEDALS = ['🥇', '🥈', '🥉']

function ConflictHeatmap() {
  const [month, setMonth] = useState(new Date())
  const getConflicts = useStore(s => s.getConflicts)

  const dateCounts = useMemo(() => {
    const conflicts = getConflicts()
    const counts: Record<string, number> = {}
    conflicts.forEach(c => {
      const start = new Date(c.overlapStart)
      const end = new Date(c.overlapEnd)
      const days = eachDayOfInterval({ start, end })
      days.forEach(d => {
        const key = format(d, 'yyyy-MM-dd')
        counts[key] = (counts[key] || 0) + 1
      })
    })
    return counts
  }, [getConflicts])

  const days = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    return eachDayOfInterval({ start, end }).map(d => ({
      date: d,
      key: format(d, 'yyyy-MM-dd'),
      count: dateCounts[format(d, 'yyyy-MM-dd')] || 0,
      isCurrentMonth: isSameMonth(d, month),
      isToday: isToday(d),
    }))
  }, [month, dateCounts])

  const firstDayOffset = startOfMonth(month).getDay()

  const getCellColor = (count: number) => {
    if (count === 0) return '#E5E7EB'
    if (count === 1) return '#FDBA74'
    return '#E63946'
  }

  return (
    <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: '#FFF8F0', border: '1px solid #E5E7EB' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold" style={{ color: '#1A1A2E' }}>冲突热力图</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMonth(m => subMonths(m, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:opacity-80"
            style={{ backgroundColor: '#1A1A2E', color: '#FFF8F0' }}
          >‹</button>
          <span className="text-sm font-medium w-24 text-center" style={{ color: '#1A1A2E' }}>
            {format(month, 'yyyy年MM月')}
          </span>
          <button
            onClick={() => setMonth(m => addMonths(m, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:opacity-80"
            style={{ backgroundColor: '#1A1A2E', color: '#FFF8F0' }}
          >›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className="text-xs font-medium" style={{ color: '#1A1A2EAA' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(d => (
          <div
            key={d.key}
            className="aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all"
            style={{
              backgroundColor: getCellColor(d.count),
              color: d.count >= 2 ? '#FFF' : '#1A1A2E',
              outline: d.isToday ? '2px solid #E8652E' : 'none',
              outlineOffset: '-2px',
            }}
          >
            {format(d.date, 'd')}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 justify-end">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#E5E7EB' }} />
          <span className="text-xs" style={{ color: '#1A1A2EAA' }}>0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#FDBA74' }} />
          <span className="text-xs" style={{ color: '#1A1A2EAA' }}>1</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#E63946' }} />
          <span className="text-xs" style={{ color: '#1A1A2EAA' }}>2+</span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { applications, boards, getConflicts } = useStore()

  const conflicts = getConflicts()
  const pendingCount = applications.filter(a => a.status === 'pending').length
  const approvedCount = applications.filter(a => a.status === 'approved').length

  const stats = {
    total: applications.length,
    pending: pendingCount,
    approved: approvedCount,
    conflicts: conflicts.length,
  }

  const boardData = useMemo(() => {
    const map: Record<string, number> = {}
    boards.forEach(b => { map[b.id] = 0 })
    applications.forEach(a => { map[a.boardId] = (map[a.boardId] || 0) + 1 })
    return boards.map(b => ({ name: b.name, count: map[b.id] || 0 })).sort((a, b) => b.count - a.count)
  }, [applications, boards])

  const clubData = useMemo(() => {
    const map: Record<string, number> = {}
    applications.forEach(a => { map[a.clubName] = (map[a.clubName] || 0) + 1 })
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [applications])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-20">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#1A1A2E' }}>数据看板</h1>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map(card => {
            const Icon = card.icon
            return (
              <div
                key={card.key}
                className="rounded-2xl p-4 shadow-sm"
                style={{ backgroundColor: '#FFF', border: `1px solid ${card.color}22` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${card.color}18` }}
                  >
                    <Icon size={20} style={{ color: card.color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: card.color }}>{stats[card.key]}</div>
                    <div className="text-xs" style={{ color: '#1A1A2EAA' }}>{card.label}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: '#FFF8F0', border: '1px solid #E5E7EB' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#1A1A2E' }}>展板热度排行</h3>
            <ResponsiveContainer width="100%" height={boardData.length * 45 + 20}>
              <BarChart data={boardData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#E8652E" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: '#FFF8F0', border: '1px solid #E5E7EB' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#1A1A2E' }}>社团活跃排行</h3>
            <ResponsiveContainer width="100%" height={clubData.length * 45 + 20}>
              <BarChart data={clubData.map((c, i) => ({ ...c, displayName: i < 3 ? `${MEDALS[i]} ${c.name}` : c.name }))} margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="displayName" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v: number) => [v, '申请数']} labelFormatter={(l: string) => l.replace(/^[🥇🥈🥉]\s*/, '')} />
                <Bar dataKey="count" fill="#F4A261" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <ConflictHeatmap />
      </div>
    </div>
  )
}
