import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Clock, User, ChevronDown, X } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

const COLUMNS = [
  { key: 'checkout_today', label: '今日退房', bg: 'bg-amber-50', border: 'border-amber-200', headerBg: 'bg-amber-100', dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700' },
  { key: 'cleaning', label: '待清洁', bg: 'bg-coral-50', border: 'border-coral-200', headerBg: 'bg-coral-100', dot: 'bg-coral-400', badge: 'bg-coral-100 text-coral-700' },
  { key: 'reviewing', label: '待复核', bg: 'bg-blue-50', border: 'border-blue-200', headerBg: 'bg-blue-100', dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700' },
  { key: 'ready', label: '可入住', bg: 'bg-sage-50', border: 'border-sage-200', headerBg: 'bg-sage-100', dot: 'bg-sage-400', badge: 'bg-sage-100 text-sage-700' },
] as const

const STATUS_LABEL: Record<string, string> = {
  pending: '待开始', cleaning: '清洁中', rework: '返工',
  completed: '已完成', reviewing: '复核中', approved: '已通过',
}

export default function Home() {
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const properties = useStore(s => s.properties)
  const inspections = useStore(s => s.inspections)
  const createInspection = useStore(s => s.createInspection)
  const getStaff = useStore(s => s.getStaff)

  const getLatestInspection = (propertyId: string) => {
    const list = inspections.filter(i => i.propertyId === propertyId)
    return list[list.length - 1]
  }

  const handleCardClick = (propertyId: string, status: string) => {
    const insp = getLatestInspection(propertyId)
    if (!insp) return
    if (status === 'checkout_today' || status === 'cleaning') navigate(`/inspection/${insp.id}`)
    else if (status === 'reviewing') navigate(`/review/${insp.id}`)
  }

  const creatable = properties.filter(p => p.status === 'checkout_today' || p.status === 'vacant')

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="bg-white shadow-sm border-b border-warm-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-serif font-bold text-warm-800">首页看板</h1>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-warm-500 text-white rounded-lg hover:bg-warm-600 transition-colors text-sm"
          >
            <Plus size={16} />
            新建检查单
            <ChevronDown size={14} />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-warm-200 z-20">
              <div className="flex items-center justify-between px-4 py-2 border-b border-warm-100">
                <span className="text-sm font-medium text-warm-700">选择房源</span>
                <button onClick={() => setShowDropdown(false)}>
                  <X size={16} className="text-warm-400 hover:text-warm-600" />
                </button>
              </div>
              {creatable.length === 0 ? (
                <div className="px-4 py-6 text-center text-warm-400 text-sm">暂无可创建的房源</div>
              ) : (
                creatable.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { createInspection(p.id); setShowDropdown(false) }}
                    className="w-full text-left px-4 py-3 hover:bg-warm-50 border-b border-warm-50 last:border-0 transition-colors"
                  >
                    <div className="font-medium text-warm-800 text-sm">{p.name}</div>
                    <div className="text-xs text-warm-500 mt-0.5">{p.address}</div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </header>

      <div className="p-6 grid grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const colProps = properties.filter(p => p.status === col.key)
          return (
            <div key={col.key} className={cn('rounded-xl border', col.bg, col.border)}>
              <div className={cn('px-4 py-3 rounded-t-xl flex items-center gap-2', col.headerBg)}>
                <span className={cn('w-2.5 h-2.5 rounded-full', col.dot)} />
                <span className="font-medium text-sm">{col.label}</span>
                <span className="ml-auto text-xs opacity-60">{colProps.length}</span>
              </div>
              <div className="p-3 space-y-3 min-h-[200px]">
                {colProps.map(prop => {
                  const cleaner = getStaff(prop.cleanerId)
                  const insp = getLatestInspection(prop.id)
                  const clickable = prop.status === 'checkout_today' || prop.status === 'cleaning' || prop.status === 'reviewing'
                  return (
                    <div
                      key={prop.id}
                      onClick={() => clickable && handleCardClick(prop.id, prop.status)}
                      className={cn(
                        'bg-white rounded-lg p-4 shadow-sm border border-white/60 animate-slide-up',
                        clickable && 'cursor-pointer hover:shadow-md hover:border-warm-200 hover:-translate-y-0.5 transition-all duration-200'
                      )}
                    >
                      <div className="font-medium text-warm-800 text-sm">{prop.name}</div>
                      <div className="flex items-center gap-1.5 mt-2 text-warm-500 text-xs">
                        <User size={13} />
                        <span>{cleaner?.name || '未分配'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-warm-500 text-xs">
                        <Clock size={13} />
                        <span>入住 {prop.checkInTime}</span>
                      </div>
                      {insp && (
                        <span className={cn('inline-block mt-2.5 px-2 py-0.5 rounded-full text-xs font-medium', col.badge)}>
                          {STATUS_LABEL[insp.status] || insp.status}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
