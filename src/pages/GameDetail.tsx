import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { StatusBadge } from '@/components/StatusBadge'
import { CATEGORY_LABELS } from '@/types'
import type { CheckSession } from '@/types'
import { Users, Clock, Package, ArrowRight, BookOpen, LogIn, LogOut, ArrowRightLeft, Trash2 } from 'lucide-react'

export default function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentGame, fetchGame, deleteGame, fetchCheckHistory } = useStore()
  const [checkHistory, setCheckHistory] = useState<CheckSession[]>([])
  const [showLendModal, setShowLendModal] = useState(false)
  const [borrowerName, setBorrowerName] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [deposit, setDeposit] = useState(0)

  const gameId = Number(id)

  useEffect(() => {
    if (gameId) {
      fetchGame(gameId)
      fetchCheckHistory(gameId).then(setCheckHistory)
    }
  }, [gameId, fetchGame, fetchCheckHistory])

  const handleDelete = async () => {
    if (confirm('确定要删除这款游戏吗？此操作不可撤销。')) {
      await deleteGame(gameId)
      navigate('/games')
    }
  }

  const handleLend = async () => {
    if (!borrowerName.trim() || !returnDate) return
    const { createLending } = useStore.getState()
    await createLending(gameId, { borrower_name: borrowerName, return_date: returnDate, deposit })
    setShowLendModal(false)
    setBorrowerName('')
    setReturnDate('')
    setDeposit(0)
    fetchGame(gameId)
  }

  if (!currentGame) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[var(--color-wood-300)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const game = currentGame

  const componentsByCategory = (game.components || []).reduce((acc, comp) => {
    if (!acc[comp.category]) acc[comp.category] = []
    acc[comp.category].push(comp)
    return acc
  }, {} as Record<string, typeof game.components>)

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/games')} className="text-sm text-[var(--color-wood-500)] hover:text-[var(--color-wood-700)] flex items-center gap-1">
        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
        返回游戏库
      </button>

      <div className="card-wood rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-serif-title text-3xl font-bold text-[var(--color-wood-800)]">{game.name}</h1>
            <div className="flex gap-4 mt-2 text-sm text-[var(--color-wood-500)]">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{game.min_players}-{game.max_players}人</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{game.play_time_minutes}分钟</span>
            </div>
          </div>
          <StatusBadge status={game.status} />
        </div>

        {game.expansions && game.expansions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-[var(--color-wood-600)] mb-1">扩展包</p>
            <div className="flex flex-wrap gap-2">
              {game.expansions.map((exp) => (
                <span key={exp.id} className="text-xs bg-[var(--color-wood-100)] text-[var(--color-wood-600)] px-2.5 py-1 rounded-full">{exp.name}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          <button onClick={() => navigate(`/games/${gameId}/checkin`)} className="btn-wood flex items-center gap-2">
            <LogIn className="w-4 h-4" />开盒清点
          </button>
          <button onClick={() => navigate(`/games/${gameId}/checkout`)} className="btn-danger flex items-center gap-2">
            <LogOut className="w-4 h-4" />收盒清点
          </button>
          <button onClick={() => setShowLendModal(true)} className="btn-indigo flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" />外借登记
          </button>
          <button onClick={handleDelete} className="btn-wood-outline flex items-center gap-2 text-red-500 border-red-300 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />删除
          </button>
        </div>
      </div>

      <div className="card-wood rounded-xl p-6">
        <h2 className="font-serif-title text-xl font-semibold text-[var(--color-wood-800)] mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />配件明细
        </h2>
        {Object.entries(componentsByCategory).map(([category, components]) => (
          <div key={category} className="mb-4 last:mb-0">
            <h3 className="text-sm font-semibold text-[var(--color-wood-600)] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-wood-400)]" />
              {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}
            </h3>
            <div className="bg-[var(--color-wood-50)] rounded-lg overflow-hidden">
              {components!.map((comp) => (
                <div key={comp.id} className="check-item">
                  <span className="text-sm text-[var(--color-wood-700)]">{comp.name}</span>
                  <span className="text-sm font-medium text-[var(--color-wood-500)]">x{comp.expected_count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card-wood rounded-xl p-6">
        <h2 className="font-serif-title text-xl font-semibold text-[var(--color-wood-800)] mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />清点历史
        </h2>
        {checkHistory.length === 0 ? (
          <p className="text-sm text-[var(--color-wood-400)] text-center py-4">暂无清点记录</p>
        ) : (
          <div className="space-y-3">
            {checkHistory.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-[var(--color-wood-50)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${session.type === 'open' ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                    {session.type === 'open' ? <LogIn className="w-4 h-4 text-emerald-600" /> : <LogOut className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-wood-700)]">{session.type === 'open' ? '开盒清点' : '收盒清点'}</p>
                    <p className="text-xs text-[var(--color-wood-400)]">{session.created_at}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.table_location && (
                    <span className="text-xs bg-[var(--color-wood-100)] text-[var(--color-wood-500)] px-2 py-0.5 rounded-full">{session.table_location}</span>
                  )}
                  <span className={`status-badge ${session.status === 'completed' ? 'status-complete' : 'status-missing'}`}>
                    {session.status === 'completed' ? '已完成' : '进行中'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showLendModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowLendModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-[var(--color-wood-100)]">
              <h2 className="font-serif-title text-xl font-semibold text-[var(--color-wood-800)]">外借登记</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-wood-700)] mb-1">借用人</label>
                <input type="text" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} className="w-full" placeholder="谁借走的？" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-wood-700)] mb-1">归还日期</label>
                <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-wood-700)] mb-1">押金（元）</label>
                <input type="number" value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} min={0} className="w-full" />
              </div>
            </div>
            <div className="p-5 border-t border-[var(--color-wood-100)] flex justify-end gap-3">
              <button onClick={() => setShowLendModal(false)} className="btn-wood-outline">取消</button>
              <button onClick={handleLend} className="btn-indigo">确认外借</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
