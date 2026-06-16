import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { CATEGORY_LABELS } from '@/types'
import { ArrowRight, Check, CheckCheck, AlertTriangle, Loader2 } from 'lucide-react'

interface CheckItemState {
  component_id: number
  name: string
  category: string
  expected_count: number
  actual_count: number
  checked: boolean
  is_missing: boolean
  missing_count: number
  possible_holder: string
}

export default function CheckOut() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentGame, fetchGame, createCheckSession, updateCheckItems, completeCheckSession } = useStore()
  const [tableLocation, setTableLocation] = useState('')
  const [items, setItems] = useState<CheckItemState[]>([])
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const gameId = Number(id)

  useEffect(() => {
    fetchGame(gameId)
  }, [gameId, fetchGame])

  useEffect(() => {
    if (currentGame?.components && items.length === 0) {
      const checkItems = currentGame.components.map((comp) => ({
        component_id: comp.id,
        name: comp.name,
        category: comp.category,
        expected_count: comp.expected_count,
        actual_count: comp.expected_count,
        checked: false,
        is_missing: false,
        missing_count: 0,
        possible_holder: '',
      }))
      setItems(checkItems)
    }
  }, [currentGame, items.length])

  const ensureSession = async () => {
    if (sessionId) return sessionId
    await createCheckSession(gameId, 'close', tableLocation.trim() || undefined)
    const session = useStore.getState().currentCheckSession
    if (session) {
      setSessionId(session.id)
      return session.id
    }
    throw new Error('Failed to create check session')
  }

  const toggleCheck = (componentId: number) => {
    setItems(items.map((item) => {
      if (item.component_id !== componentId) return item
      const newChecked = !item.checked
      const newActual = newChecked ? item.expected_count : 0
      const newMissing = Math.max(0, item.expected_count - newActual)
      return {
        ...item,
        checked: newChecked,
        actual_count: newActual,
        is_missing: newMissing > 0,
        missing_count: newMissing,
        possible_holder: '',
      }
    }))
  }

  const setActualCount = (componentId: number, count: number) => {
    setItems(items.map((item) => {
      if (item.component_id !== componentId) return item
      const missing = Math.max(0, item.expected_count - count)
      return {
        ...item,
        actual_count: count,
        checked: count > 0,
        is_missing: missing > 0,
        missing_count: missing,
      }
    }))
  }

  const setPossibleHolder = (componentId: number, value: string) => {
    setItems(items.map((item) =>
      item.component_id === componentId ? { ...item, possible_holder: value } : item
    ))
  }

  const checkAll = () => {
    setItems(items.map((item) => ({
      ...item,
      checked: true,
      actual_count: item.expected_count,
      is_missing: false,
      missing_count: 0,
      possible_holder: '',
    })))
  }

  const checkCategory = (category: string) => {
    setItems(items.map((item) =>
      item.category === category ? { ...item, checked: true, actual_count: item.expected_count, is_missing: false, missing_count: 0, possible_holder: '' } : item
    ))
  }

  const hasMissing = items.some((item) => item.is_missing)
  const allChecked = items.every((item) => item.checked)

  const handleComplete = async () => {
    setSubmitting(true)
    try {
      const sid = await ensureSession()
      await updateCheckItems(sid, items.map((item) => ({
        component_id: item.component_id,
        actual_count: item.actual_count,
        is_missing: item.is_missing,
        missing_count: item.missing_count,
        possible_holder: item.possible_holder || undefined,
      })))
      await completeCheckSession(sid)
      navigate(`/games/${gameId}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!currentGame) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[var(--color-wood-300)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const componentsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, CheckItemState[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate(`/games/${gameId}`)} className="text-sm text-[var(--color-wood-500)] hover:text-[var(--color-wood-700)] flex items-center gap-1 mb-2">
            <ArrowRight className="w-3.5 h-3.5 rotate-180" /> 返回详情
          </button>
          <h1 className="font-serif-title text-3xl font-bold text-[var(--color-wood-800)]">收盒清点</h1>
          <p className="text-[var(--color-wood-500)] mt-1">{currentGame.name}</p>
        </div>
        <button onClick={checkAll} className="btn-wood-outline flex items-center gap-2">
          <CheckCheck className="w-4 h-4" />全部确认
        </button>
      </div>

      <div className="card-wood rounded-xl p-4">
        <label className="block text-sm font-medium text-[var(--color-wood-700)] mb-1">最后在哪张桌玩</label>
        <input type="text" value={tableLocation} onChange={(e) => setTableLocation(e.target.value)} className="max-w-xs" placeholder="如：1号桌" />
      </div>

      {hasMissing && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-orange-700">发现缺件！</p>
            <p className="text-xs text-orange-600 mt-0.5">请填写缺少数量和可能持有人，完成后游戏状态将标记为「缺件」</p>
          </div>
        </div>
      )}

      {Object.entries(componentsByCategory).map(([category, comps]) => (
        <div key={category} className="card-wood rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-[var(--color-wood-100)]">
            <h3 className="font-serif-title text-sm font-semibold text-[var(--color-wood-700)]">
              {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}
            </h3>
            <button onClick={() => checkCategory(category)} className="text-xs text-[var(--color-wood-500)] hover:text-[var(--color-wood-700)] flex items-center gap-1">
              <Check className="w-3 h-3" />全选
            </button>
          </div>
          <div>
            {comps.map((item) => (
              <div key={item.component_id}>
                <div className="check-item">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCheck(item.component_id)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        item.checked && !item.is_missing
                          ? 'bg-emerald-500 border-emerald-500'
                          : item.is_missing
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-[var(--color-wood-300)] hover:border-[var(--color-wood-400)]'
                      }`}
                    >
                      {item.checked && !item.is_missing && <Check className="w-4 h-4 text-white" />}
                      {item.is_missing && <AlertTriangle className="w-4 h-4 text-white" />}
                    </button>
                    <span className="text-sm text-[var(--color-wood-700)]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-wood-400)]">应有 {item.expected_count}</span>
                    <span className="text-xs text-[var(--color-wood-400)]">实际</span>
                    <input
                      type="number"
                      value={item.actual_count}
                      onChange={(e) => setActualCount(item.component_id, Number(e.target.value))}
                      min={0}
                      max={item.expected_count}
                      className="w-16 text-center text-sm"
                    />
                  </div>
                </div>
                {item.is_missing && (
                  <div className="px-4 pb-3 pt-1 ml-9 bg-orange-50/50 flex items-center gap-3">
                    <span className="text-xs text-orange-600">缺少 {item.missing_count} 件</span>
                    <input
                      type="text"
                      value={item.possible_holder}
                      onChange={(e) => setPossibleHolder(item.component_id, e.target.value)}
                      className="flex-1 text-sm"
                      placeholder="可能在谁手里？"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-3">
        <button onClick={() => navigate(`/games/${gameId}`)} className="btn-wood-outline">取消</button>
        <button onClick={handleComplete} disabled={submitting} className="btn-wood flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
          完成收盒清点
        </button>
      </div>
    </div>
  )
}
