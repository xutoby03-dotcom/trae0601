import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { ArrowRightLeft, Check, Clock, AlertTriangle, User, DollarSign, CalendarDays } from 'lucide-react'

export default function Lending() {
  const { lendings, fetchLendings, returnLending } = useStore()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [returningId, setReturningId] = useState<number | null>(null)

  useEffect(() => {
    fetchLendings(statusFilter || undefined)
  }, [fetchLendings, statusFilter])

  const handleReturn = async (lendingId: number) => {
    setReturningId(lendingId)
    try {
      await returnLending(lendingId)
    } finally {
      setReturningId(null)
    }
  }

  const filterButtons = [
    { value: '', label: '全部' },
    { value: 'active', label: '外借中' },
    { value: 'returned', label: '已归还' },
    { value: 'overdue', label: '逾期' },
  ]

  const activeLendings = lendings.filter((l) => l.status === 'active')
  const overdueLendings = lendings.filter((l) => l.status === 'active' && new Date(l.return_date) < new Date())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-title text-3xl font-bold text-[var(--color-wood-800)]">外借管理</h1>
        <p className="text-[var(--color-wood-500)] mt-1">追踪外借游戏与归还状态</p>
      </div>

      {overdueLendings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">有 {overdueLendings.length} 条外借已逾期！</p>
            <p className="text-xs text-red-600 mt-0.5">请尽快联系借用人归还</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {filterButtons.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === f.value
                ? 'bg-[var(--color-wood-500)] text-white shadow-sm'
                : 'bg-[var(--color-wood-100)] text-[var(--color-wood-600)] hover:bg-[var(--color-wood-200)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {lendings.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-wood-400)]">
          <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">暂无外借记录</p>
          <p className="text-sm mt-1">在游戏详情页可以登记外借</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lendings.map((lending, i) => {
            const isOverdue = lending.status === 'active' && new Date(lending.return_date) < new Date()
            return (
              <div
                key={lending.id}
                className={`card-wood card-wood-lift rounded-xl p-5 animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 5)} ${
                  isOverdue ? 'border-l-4 border-l-red-500' : lending.status === 'active' ? 'border-l-4 border-l-indigo-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/games/${lending.game_id}`}
                        className="font-serif-title text-lg font-semibold text-[var(--color-wood-800)] hover:text-[var(--color-wood-600)] transition-colors"
                      >
                        {lending.game_name || `游戏 #${lending.game_id}`}
                      </Link>
                      {lending.status === 'returned' ? (
                        <span className="status-badge status-complete">
                          <Check className="w-3 h-3" />已归还
                        </span>
                      ) : isOverdue ? (
                        <span className="status-badge status-missing">
                          <AlertTriangle className="w-3 h-3" />逾期
                        </span>
                      ) : (
                        <span className="status-badge status-lent">
                          <ArrowRightLeft className="w-3 h-3" />外借中
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-[var(--color-wood-500)]">
                        <User className="w-3.5 h-3.5" />
                        <span>{lending.borrower_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--color-wood-500)]">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                          {lending.return_date}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--color-wood-500)]">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>押金 ¥{lending.deposit}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--color-wood-500)]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>借出 {lending.lent_at?.slice(0, 10)}</span>
                      </div>
                    </div>

                    {lending.returned_at && (
                      <p className="text-xs text-emerald-600 mt-2">归还于 {lending.returned_at}</p>
                    )}
                  </div>

                  {lending.status === 'active' && (
                    <button
                      onClick={() => handleReturn(lending.id)}
                      disabled={returningId === lending.id}
                      className="btn-wood-outline flex items-center gap-2 ml-4 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {returningId === lending.id ? '处理中...' : '确认归还'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
