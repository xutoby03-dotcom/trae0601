import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { StatusBadge } from '@/components/StatusBadge'
import { StatusFilter } from '@/components/StatusFilter'
import { Plus, Search, Users, Clock, X, Trash2 } from 'lucide-react'
import type { ComponentCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'

interface ComponentEntry {
  name: string
  category: ComponentCategory
  expected_count: number
}

export default function Games() {
  const { games, fetchGames, createGame, loading } = useStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formName, setFormName] = useState('')
  const [formMinPlayers, setFormMinPlayers] = useState(2)
  const [formMaxPlayers, setFormMaxPlayers] = useState(4)
  const [formPlayTime, setFormPlayTime] = useState(30)
  const [formComponents, setFormComponents] = useState<ComponentEntry[]>([
    { name: '', category: 'other', expected_count: 1 }
  ])
  const [formExpansions, setFormExpansions] = useState<string[]>([])

  useEffect(() => {
    fetchGames(statusFilter || undefined)
  }, [fetchGames, statusFilter])

  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => {
    setFormName('')
    setFormMinPlayers(2)
    setFormMaxPlayers(4)
    setFormPlayTime(30)
    setFormComponents([{ name: '', category: 'other', expected_count: 1 }])
    setFormExpansions([])
  }

  const handleSubmit = async () => {
    if (!formName.trim()) return
    await createGame({
      name: formName,
      min_players: formMinPlayers,
      max_players: formMaxPlayers,
      play_time_minutes: formPlayTime,
      expansions: formExpansions.filter((e) => e.trim()).map((name) => ({ name })),
      components: formComponents.filter((c) => c.name.trim()),
    })
    setShowModal(false)
    resetForm()
  }

  const addComponent = () => {
    setFormComponents([...formComponents, { name: '', category: 'other', expected_count: 1 }])
  }

  const removeComponent = (index: number) => {
    setFormComponents(formComponents.filter((_, i) => i !== index))
  }

  const updateComponent = (index: number, field: keyof ComponentEntry, value: string | number) => {
    const updated = [...formComponents]
    updated[index] = { ...updated[index], [field]: value }
    setFormComponents(updated)
  }

  const addExpansion = () => {
    setFormExpansions([...formExpansions, ''])
  }

  const removeExpansion = (index: number) => {
    setFormExpansions(formExpansions.filter((_, i) => i !== index))
  }

  const updateExpansion = (index: number, value: string) => {
    const updated = [...formExpansions]
    updated[index] = value
    setFormExpansions(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-title text-3xl font-bold text-[var(--color-wood-800)]">游戏库</h1>
          <p className="text-[var(--color-wood-500)] mt-1">管理你的桌游收藏</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-wood flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新增游戏
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-wood-400)]" />
          <input
            type="text"
            placeholder="搜索游戏..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        <StatusFilter current={statusFilter} onChange={setStatusFilter} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-3 border-[var(--color-wood-300)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-wood-400)]">
          <p className="text-lg">暂无游戏</p>
          <p className="text-sm mt-1">点击「新增游戏」添加你的第一款桌游</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((game, i) => (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className={`card-wood card-wood-lift rounded-xl p-5 block animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 5)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-serif-title text-lg font-semibold text-[var(--color-wood-800)]">{game.name}</h3>
                <StatusBadge status={game.status} />
              </div>
              <div className="flex gap-4 text-sm text-[var(--color-wood-500)]">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {game.min_players}-{game.max_players}人
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {game.play_time_minutes}分钟
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-wood-100)]">
              <h2 className="font-serif-title text-xl font-semibold text-[var(--color-wood-800)]">新增游戏</h2>
              <button onClick={() => { setShowModal(false); resetForm() }} className="w-8 h-8 rounded-lg hover:bg-[var(--color-wood-100)] flex items-center justify-center">
                <X className="w-4 h-4 text-[var(--color-wood-500)]" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-wood-700)] mb-1">游戏名称</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full" placeholder="如：卡坦岛" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-wood-700)] mb-1">最少人数</label>
                  <input type="number" value={formMinPlayers} onChange={(e) => setFormMinPlayers(Number(e.target.value))} min={1} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-wood-700)] mb-1">最多人数</label>
                  <input type="number" value={formMaxPlayers} onChange={(e) => setFormMaxPlayers(Number(e.target.value))} min={1} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-wood-700)] mb-1">时长(分钟)</label>
                  <input type="number" value={formPlayTime} onChange={(e) => setFormPlayTime(Number(e.target.value))} min={5} className="w-full" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--color-wood-700)]">扩展包</label>
                  <button onClick={addExpansion} className="text-xs text-[var(--color-wood-500)] hover:text-[var(--color-wood-700)] flex items-center gap-1">
                    <Plus className="w-3 h-3" /> 添加
                  </button>
                </div>
                {formExpansions.map((exp, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={exp} onChange={(e) => updateExpansion(i, e.target.value)} className="flex-1" placeholder="扩展包名称" />
                    <button onClick={() => removeExpansion(i)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--color-wood-700)]">配件明细</label>
                  <button onClick={addComponent} className="text-xs text-[var(--color-wood-500)] hover:text-[var(--color-wood-700)] flex items-center gap-1">
                    <Plus className="w-3 h-3" /> 添加
                  </button>
                </div>
                <div className="space-y-2">
                  {formComponents.map((comp, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" value={comp.name} onChange={(e) => updateComponent(i, 'name', e.target.value)} className="flex-1" placeholder="配件名称" />
                      <select value={comp.category} onChange={(e) => updateComponent(i, 'category', e.target.value)} className="w-24">
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <input type="number" value={comp.expected_count} onChange={(e) => updateComponent(i, 'expected_count', Number(e.target.value))} min={0} className="w-16" />
                      <button onClick={() => removeComponent(i)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-[var(--color-wood-100)] flex justify-end gap-3">
              <button onClick={() => { setShowModal(false); resetForm() }} className="btn-wood-outline">取消</button>
              <button onClick={handleSubmit} className="btn-wood">确认添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
