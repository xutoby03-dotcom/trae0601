import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { CATEGORY_LABELS } from '@/types'
import type { CheckItem, Component } from '@/types'
import { ArrowRight, Check, CheckCheck, Loader2 } from 'lucide-react'

export default function CheckIn() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentGame, fetchGame, createCheckSession, updateCheckItems, completeCheckSession } = useStore()
  const [tableLocation, setTableLocation] = useState('')
  const [items, setItems] = useState<Array<{
    component_id: number
    name: string
    category: string
    expected_count: number
    actual_count: number
    checked: boolean
  }>>([])
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const gameId = Number(id)

  useEffect(() => {
    fetchGame(gameId)
  }, [gameId, fetchGame])

  useEffect(() => {
    if (currentGame?.components && !sessionId) {
      const checkItems = currentGame.components.map((comp) => ({
        component_id: comp.id,
        name: comp.name,
        category: comp.category,
        expected_count: comp.expected_count,
        actual_count: comp.expected_count,
        checked: false,
      }))
      setItems(checkItems)

      createCheckSession(gameId, 'open').then(() => {
        const session = useStore.getState().currentCheckSession
        if (session) setSessionId(session.id)
      })
    }
  }, [currentGame, sessionId, gameId, createCheckSession])

  const toggleCheck = (componentId: number) => {
    setItems(items.map((item) =>
      item.component_id === componentId
        ? { ...item, checked: !item.checked, actual_count: item.checked ? 0 : item.expected_count }
        : item
    ))
  }

  const setActualCount = (componentId: number, count: number) => {
    setItems(items.map((item) =>
      item.component_id === componentId
        ? { ...item, actual_count: count, checked: count > 0 }
        : item
    ))
  }

  const checkAll = () => {
    setItems(items.map((item) => ({ ...item, checked: true, actual_count: item.expected_count })))
  }

  const checkCategory = (category: string) => {
    setItems(items.map((item) =>
      item.category === category ? { ...item, checked: true, actual_count: item.expected_count } : item
    ))
  }

  const allChecked = items.every((item) => item.checked)

  const handleComplete = async () => {
    if (!sessionId) return
    setSubmitting(true)
    try {
      await updateCheckItems(sessionId, items.map((item) => ({
        component_id: item.component_id,
        actual_count: item.actual_count,
        is_missing: item.actual_count < item.expected_count,
        missing_count: Math.max(0, item.expected_count - item.actual_count),
      })))
      await completeCheckSession(sessionId)
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
  }, {} as Record<string, typeof items>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate(`/games/${gameId}`)} className="text-sm text-[var(--color-wood-500)] hover:text-[var(--color-wood-700)] flex items-center gap-1 mb-2">
            <ArrowRight className="w-3.5 h-3.5 rotate-180" /> 返回详情
          </button>
          <h1 className="font-serif-title text-3xl font-bold text-[var(--color-wood-800)]">开盒清点</h1>
          <p className="text-[var(--color-wood-500)] mt-1">{currentGame.name}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={checkAll} className="btn-wood-outline flex items-center gap-2">
            <CheckCheck className="w-4 h-4" />全部确认
          </button>
        </div>
      </div>

      <div className="card-wood rounded-xl p-4">
        <label className="block text-sm font-medium text-[var(--color-wood-700)] mb-1">桌位（可选）</label>
        <input type="text" value={tableLocation} onChange={(e) => setTableLocation(e.target.value)} className="max-w-xs" placeholder="如：1号桌" />
      </div>

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
            {comps!.map((item) => (
              <div key={item.component_id} className="check-item">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCheck(item.component_id)}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      item.checked
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-[var(--color-wood-300)] hover:border-[var(--color-wood-400)]'
                    }`}
                  >
                    {item.checked && <Check className="w-4 h-4 text-white" />}
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
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-3">
        <button onClick={() => navigate(`/games/${gameId}`)} className="btn-wood-outline">取消</button>
        <button onClick={handleComplete} disabled={!allChecked || submitting} className="btn-wood flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
          完成开盒清点
        </button>
      </div>
    </div>
  )
}
