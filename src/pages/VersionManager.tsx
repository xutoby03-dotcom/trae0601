import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useBakingStore, generateId } from '@/store/bakingStore'
import type { RecipeAdjustment, AdjustmentItem, BakingRecord } from '@/types'
import {
  PROBLEM_TAG_LABELS,
  PRODUCT_TYPE_LABELS,
  RESULT_LABELS,
  ADJUSTMENT_ITEM_LABELS,
} from '@/types'
import {
  ArrowLeft,
  Plus,
  GitBranch,
  ChevronRight,
  Star,
  ChefHat,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Thermometer,
  Save,
} from 'lucide-react'

const ADJUSTMENT_UNITS: Record<AdjustmentItem, string> = {
  sugar: 'g',
  oil: 'g',
  water: 'ml',
  fermentTime: 'min',
  ovenTemp: '℃',
  other: '',
}

export default function VersionManager() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { getRecordsByProduct, createNewVersion } = useBakingStore()

  const versions = productId ? getRecordsByProduct(productId) : []

  const [showNewVersion, setShowNewVersion] = useState(false)
  const [newOvenTemp, setNewOvenTemp] = useState(0)
  const [newBakeTime, setNewBakeTime] = useState(0)
  const [newNotes, setNewNotes] = useState('')
  const [adjustments, setAdjustments] = useState<
    { item: AdjustmentItem; before: number; after: number }[]
  >([])

  if (versions.length === 0) {
    return (
      <div className="min-h-screen bg-bake-cream flex items-center justify-center font-body">
        <div className="text-center">
          <GitBranch className="w-12 h-12 text-bake-caramel mx-auto mb-3" />
          <p className="text-bake-dark">未找到版本记录</p>
          <Link to="/" className="inline-block mt-4 text-bake-brown hover:text-bake-dark underline">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  const latestVersion = versions[versions.length - 1]
  const productName = latestVersion.productName

  const addAdjustment = (item: AdjustmentItem) => {
    const before =
      item === 'ovenTemp'
        ? latestVersion.ovenTemp
        : item === 'fermentTime'
        ? latestVersion.bakeTime
        : 0
    setAdjustments((prev) => [...prev, { item, before, after: before }])
  }

  const updateAdjustment = (index: number, field: 'before' | 'after', value: number) => {
    setAdjustments((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    )
  }

  const removeAdjustment = (index: number) => {
    setAdjustments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateVersion = () => {
    if (!productId) return

    const recipeAdjustments: RecipeAdjustment[] = adjustments.map((adj, idx) => ({
      id: generateId(),
      recordId: '',
      item: adj.item,
      before: adj.before,
      after: adj.after,
      unit: ADJUSTMENT_UNITS[adj.item],
    }))

    const updates: Partial<BakingRecord> = {
      ovenTemp: newOvenTemp || latestVersion.ovenTemp,
      bakeTime: newBakeTime || latestVersion.bakeTime,
      notes: newNotes,
    }

    const newRecord = createNewVersion(latestVersion.id, recipeAdjustments, updates)
    if (newRecord) {
      navigate(`/record/${newRecord.id}/edit`)
    }
  }

  const usedItems = new Set(adjustments.map((a) => a.item))
  const availableItems = (
    Object.entries(ADJUSTMENT_ITEM_LABELS) as [AdjustmentItem, string][]
  ).filter(([key]) => !usedItems.has(key))

  return (
    <div className="min-h-screen bg-bake-cream font-body">
      <header className="sticky top-0 z-10 bg-bake-card/95 backdrop-blur-sm border-b border-bake-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-bake-warm transition-colors text-bake-brown">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-display font-bold text-bake-dark truncate">
              版本管理
            </h1>
            <p className="text-xs text-bake-brown/60 truncate">{productName}</p>
          </div>
          {versions.length > 1 && (
            <Link
              to={`/compare/${productId}`}
              className="text-xs px-3 py-1.5 rounded-full bg-bake-caramel/15 text-bake-caramel hover:bg-bake-caramel/25 transition-colors font-medium"
            >
              对比版本
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <section className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-bake-caramel via-bake-amber to-bake-green" />
          <div className="space-y-4">
            {versions.map((version, idx) => {
              const isLast = idx === versions.length - 1
              const statusColor =
                version.status === 'improved'
                  ? 'bg-bake-green'
                  : version.status === 'pending_review'
                  ? 'bg-bake-amber'
                  : 'bg-bake-red'

              return (
                <Link
                  key={version.id}
                  to={`/record/${version.id}`}
                  className="relative flex gap-4 group"
                >
                  <div
                    className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full ${statusColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                  >
                    {version.versionNumber}
                  </div>
                  <div className="flex-1 rounded-bake bg-bake-card p-4 shadow-sm border border-bake-border group-hover:border-bake-caramel/40 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-bake-dark">
                        {version.versionLabel}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            version.result === 'success'
                              ? 'bg-bake-green/15 text-bake-green'
                              : version.result === 'failure'
                              ? 'bg-bake-red/15 text-bake-red'
                              : 'bg-bake-amber/15 text-bake-amber'
                          }`}
                        >
                          {RESULT_LABELS[version.result]}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-bake-brown/30" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-bake-brown/60 mb-2">
                      <span className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3" />
                        {version.ovenTemp}℃
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {version.bakeTime}分钟
                      </span>
                      <span>{version.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= version.tasteScore
                              ? 'fill-bake-caramel text-bake-caramel'
                              : 'text-bake-border'
                          }`}
                        />
                      ))}
                    </div>
                    {version.adjustments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {version.adjustments.map((adj) => (
                          <span
                            key={adj.id}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-bake-caramel/10 text-bake-caramel"
                          >
                            {ADJUSTMENT_ITEM_LABELS[adj.item]} {adj.before}→{adj.after}
                            {adj.unit}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {!showNewVersion ? (
          <button
            onClick={() => setShowNewVersion(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-bake border-2 border-dashed border-bake-caramel/40 text-bake-caramel hover:bg-bake-caramel/5 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            基于最新版本创建新版本
          </button>
        ) : (
          <section className="rounded-bake bg-bake-card p-5 shadow-sm border-2 border-bake-caramel/30 space-y-4">
            <h3 className="text-sm font-semibold text-bake-dark flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-bake-caramel" />
              新建版本 v{versions.length + 1}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-bake-dark">烤箱温度 (℃)</label>
                <input
                  type="number"
                  value={newOvenTemp || ''}
                  onChange={(e) => setNewOvenTemp(Number(e.target.value))}
                  placeholder={String(latestVersion.ovenTemp)}
                  className="w-full rounded-bake border border-bake-border bg-bake-light px-3 py-2 text-sm text-bake-dark outline-none focus:border-bake-caramel"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-bake-dark">烘烤时间 (分钟)</label>
                <input
                  type="number"
                  value={newBakeTime || ''}
                  onChange={(e) => setNewBakeTime(Number(e.target.value))}
                  placeholder={String(latestVersion.bakeTime)}
                  className="w-full rounded-bake border border-bake-border bg-bake-light px-3 py-2 text-sm text-bake-dark outline-none focus:border-bake-caramel"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-bake-dark">配方调整项</label>
              {adjustments.length > 0 && (
                <div className="space-y-2 mb-2">
                  {adjustments.map((adj, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-bake-light">
                      <span className="text-xs font-medium text-bake-dark w-16">
                        {ADJUSTMENT_ITEM_LABELS[adj.item]}
                      </span>
                      <input
                        type="number"
                        value={adj.before || ''}
                        onChange={(e) => updateAdjustment(idx, 'before', Number(e.target.value))}
                        placeholder="调整前"
                        className="w-20 rounded border border-bake-border bg-white px-2 py-1 text-xs text-bake-dark outline-none"
                      />
                      <span className="text-bake-brown/40">→</span>
                      <input
                        type="number"
                        value={adj.after || ''}
                        onChange={(e) => updateAdjustment(idx, 'after', Number(e.target.value))}
                        placeholder="调整后"
                        className="w-20 rounded border border-bake-border bg-white px-2 py-1 text-xs text-bake-dark outline-none"
                      />
                      <span className="text-xs text-bake-brown/50">{ADJUSTMENT_UNITS[adj.item]}</span>
                      <button
                        onClick={() => removeAdjustment(idx)}
                        className="text-bake-red/50 hover:text-bake-red text-xs ml-auto"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {availableItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {availableItems.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => addAdjustment(key)}
                      className="text-xs px-2.5 py-1 rounded-full border border-dashed border-bake-caramel/40 text-bake-caramel hover:bg-bake-caramel/10 transition-colors"
                    >
                      + {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-bake-dark">备注</label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="记录本次调整的心得..."
                rows={3}
                className="w-full resize-none rounded-bake border border-bake-border bg-bake-light px-3 py-2 text-sm text-bake-dark outline-none focus:border-bake-caramel"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewVersion(false)}
                className="flex-1 py-2.5 rounded-bake bg-bake-light text-bake-brown text-sm font-medium hover:bg-bake-warm transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateVersion}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-bake bg-bake-brown text-white text-sm font-medium hover:bg-bake-dark transition-colors"
              >
                <Save className="w-4 h-4" />
                创建版本
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
