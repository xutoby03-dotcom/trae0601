import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, AlertTriangle, RotateCcw, ChevronDown, ChevronRight, Camera, Package } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types'
import type { CheckCategory } from '@/types'

const DEDUCTION_REASONS = ['清洁不彻底', '遗漏项目', '损坏赔偿', '其他'] as const

const STATUS_LABELS: Record<string, string> = {
  pending: '待开始',
  cleaning: '清洁中',
  completed: '已完成',
  reviewing: '待复核',
  approved: '已通过',
  rework: '返工中',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warm-100 text-warm-600',
  cleaning: 'bg-warm-100 text-warm-600',
  completed: 'bg-sage-100 text-sage-600',
  reviewing: 'bg-blue-100 text-blue-600',
  approved: 'bg-sage-100 text-sage-600',
  rework: 'bg-coral-100 text-coral-600',
}

export default function Review() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const getInspection = useStore((s) => s.getInspection)
  const getProperty = useStore((s) => s.getProperty)
  const getStaff = useStore((s) => s.getStaff)
  const approveInspection = useStore((s) => s.approveInspection)
  const reworkInspection = useStore((s) => s.reworkInspection)
  const addReworkItem = useStore((s) => s.addReworkItem)
  const updateReworkItem = useStore((s) => s.updateReworkItem)
  const removeReworkItem = useStore((s) => s.removeReworkItem)

  const [expandedCategories, setExpandedCategories] = useState<Set<CheckCategory>>(new Set())

  const inspection = id ? getInspection(id) : undefined
  const property = inspection ? getProperty(inspection.propertyId) : undefined
  const cleaner = inspection ? getStaff(inspection.cleanerId) : undefined

  if (!inspection || !property) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-warm-400 font-serif text-lg">未找到检查记录</div>
      </div>
    )
  }

  const checkItems = inspection.checkItems
  const passedCount = checkItems.filter((i) => i.passed === true).length
  const failedCount = checkItems.filter((i) => i.passed === false).length
  const totalCount = checkItems.length

  const categories = Object.keys(CATEGORY_LABELS) as CheckCategory[]
  const reworkItems = inspection.reworkItems

  const formatTime = (iso: string | null) => {
    if (!iso) return '-'
    const d = new Date(iso)
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const duration = () => {
    if (!inspection.startedAt || !inspection.completedAt) return '-'
    const start = new Date(inspection.startedAt).getTime()
    const end = new Date(inspection.completedAt).getTime()
    const mins = Math.round((end - start) / 60000)
    if (mins < 60) return `${mins}分钟`
    return `${Math.floor(mins / 60)}小时${mins % 60}分钟`
  }

  const toggleCategory = (cat: CheckCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const handleMarkRework = (checkItemId: string) => {
    addReworkItem(inspection.id, checkItemId, '', '清洁不彻底', 0)
  }

  const handleApprove = () => {
    approveInspection(inspection.id)
    navigate('/')
  }

  const handleRework = () => {
    if (reworkItems.length === 0) return
    reworkInspection(inspection.id)
    navigate('/')
  }

  const beforePhotos = inspection.photos.filter((p) => p.type === 'before')
  const afterPhotos = inspection.photos.filter((p) => p.type === 'after')

  return (
    <div className="min-h-screen bg-warm-50 pb-28">
      <header className="sticky top-0 z-10 bg-warm-800 text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/')} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="font-serif text-lg">房东复核</h1>
            <p className="text-warm-300 text-xs mt-0.5">{property.name}</p>
          </div>
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[inspection.status])}>
            {STATUS_LABELS[inspection.status]}
          </span>
        </div>
      </header>

      <div className="px-4 py-3 bg-white border-b border-warm-100">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-xl font-serif text-warm-800">{totalCount}</div>
            <div className="text-xs text-warm-400">总项目</div>
          </div>
          <div>
            <div className="text-xl font-serif text-sage-500">{passedCount}</div>
            <div className="text-xs text-warm-400">通过</div>
          </div>
          <div>
            <div className="text-xl font-serif text-coral-500">{failedCount}</div>
            <div className="text-xs text-warm-400">未通过</div>
          </div>
          <div>
            <div className="text-lg font-serif text-warm-700">{duration()}</div>
            <div className="text-xs text-warm-400">用时</div>
          </div>
        </div>
      </div>

      {cleaner && (
        <div className="px-4 py-2 bg-white border-b border-warm-100 flex items-center gap-2 text-sm text-warm-500">
          <span>清洁人员：{cleaner.name}</span>
          <span className="text-warm-300">|</span>
          <span>完成时间：{formatTime(inspection.completedAt)}</span>
        </div>
      )}

      <div className="px-4 pt-4 pb-2">
        <h2 className="font-serif text-warm-800 text-base">检查项目</h2>
      </div>

      <div className="px-4 space-y-2">
        {categories.map((cat) => {
          const items = checkItems.filter((i) => i.category === cat)
          const catFailed = items.filter((i) => i.passed === false).length
          const catPassed = items.filter((i) => i.passed === true).length
          const isExpanded = expandedCategories.has(cat)

          return (
            <div key={cat} className="bg-white rounded-xl border border-warm-100 overflow-hidden">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                  <span className="font-serif text-warm-800">{CATEGORY_LABELS[cat]}</span>
                  <span className="text-xs text-warm-400">
                    {catPassed}/{items.length}
                  </span>
                  {catFailed > 0 && (
                    <span className="text-xs text-coral-500 font-medium flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      {catFailed}项未通过
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-warm-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-warm-400" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-warm-50">
                  {items.map((item) => {
                    const isFailed = item.passed === false
                    const isReworked = reworkItems.some((ri) => ri.checkItemId === item.id)

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'px-4 py-2.5 flex items-center justify-between border-b border-warm-50 last:border-b-0',
                          isFailed && 'bg-coral-50 border-l-4 border-l-coral-400'
                        )}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {item.passed === true && <Check className="w-4 h-4 text-sage-500 flex-shrink-0" />}
                          {item.passed === false && <X className="w-4 h-4 text-coral-500 flex-shrink-0" />}
                          {item.passed === null && <div className="w-4 h-4 rounded-full border-2 border-warm-200 flex-shrink-0" />}
                          <span
                            className={cn(
                              'text-sm truncate',
                              item.passed === true ? 'text-warm-700' : '',
                              item.passed === false ? 'text-coral-700 font-medium' : '',
                              item.passed === null ? 'text-warm-300' : ''
                            )}
                          >
                            {item.name}
                          </span>
                          {item.note && <span className="text-xs text-warm-400 truncate">({item.note})</span>}
                        </div>

                        {isFailed && !isReworked && (
                          <button
                            onClick={() => handleMarkRework(item.id)}
                            className="ml-2 flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-coral-100 text-coral-600 hover:bg-coral-200 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            标记返工
                          </button>
                        )}
                        {isReworked && (
                          <span className="ml-2 flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-coral-400 text-white">
                            <RotateCcw className="w-3 h-3" />
                            已标记返工
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {reworkItems.length > 0 && (
        <div className="px-4 pt-6 pb-2">
          <h2 className="font-serif text-coral-600 text-base flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            返工项目 ({reworkItems.length})
          </h2>
        </div>
      )}

      {reworkItems.length > 0 && (
        <div className="px-4 space-y-3">
          {reworkItems.map((ri) => {
            const checkItem = checkItems.find((ci) => ci.id === ri.checkItemId)
            if (!checkItem) return null

            return (
              <div key={ri.id} className="bg-white rounded-xl border border-coral-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_ICONS[checkItem.category]}</span>
                    <span className="font-medium text-warm-800 text-sm">{checkItem.name}</span>
                    <span className="text-xs text-warm-400">{CATEGORY_LABELS[checkItem.category]}</span>
                  </div>
                  <button
                    onClick={() => removeReworkItem(inspection.id, ri.id)}
                    className="text-warm-300 hover:text-coral-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-xs text-warm-500 mb-1 block">返工原因</label>
                  <input
                    type="text"
                    value={ri.reason}
                    onChange={(e) => updateReworkItem(inspection.id, ri.id, { reason: e.target.value })}
                    placeholder="请输入返工原因"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-warm-200 bg-warm-50 focus:outline-none focus:border-coral-400 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-warm-500 mb-1 block">扣款原因</label>
                    <select
                      value={ri.deductionReason}
                      onChange={(e) => updateReworkItem(inspection.id, ri.id, { deductionReason: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-warm-200 bg-warm-50 focus:outline-none focus:border-coral-400 transition-colors appearance-none"
                    >
                      {DEDUCTION_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-warm-500 mb-1 block">扣款金额 (元)</label>
                    <input
                      type="number"
                      min="0"
                      value={ri.deductionAmount || ''}
                      onChange={(e) => updateReworkItem(inspection.id, ri.id, { deductionAmount: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-warm-200 bg-warm-50 focus:outline-none focus:border-coral-400 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
        <>
          <div className="px-4 pt-6 pb-2">
            <h2 className="font-serif text-warm-800 text-base flex items-center gap-2">
              <Camera className="w-4 h-4" />
              现场照片
            </h2>
          </div>
          <div className="px-4 grid grid-cols-2 gap-3">
            {beforePhotos.length > 0 && (
              <div>
                <p className="text-xs text-warm-400 mb-1.5">清洁前</p>
                <div className="space-y-2">
                  {beforePhotos.map((photo) => (
                    <div key={photo.id} className="rounded-lg overflow-hidden border border-warm-100">
                      <img src={photo.url} alt="清洁前" className="w-full h-24 object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {afterPhotos.length > 0 && (
              <div>
                <p className="text-xs text-warm-400 mb-1.5">清洁后</p>
                <div className="space-y-2">
                  {afterPhotos.map((photo) => (
                    <div key={photo.id} className="rounded-lg overflow-hidden border border-warm-100">
                      <img src={photo.url} alt="清洁后" className="w-full h-24 object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {inspection.supplyRecords.length > 0 && (
        <>
          <div className="px-4 pt-6 pb-2">
            <h2 className="font-serif text-warm-800 text-base flex items-center gap-2">
              <Package className="w-4 h-4" />
              补充用品记录
            </h2>
          </div>
          <div className="px-4">
            <div className="bg-white rounded-xl border border-warm-100 overflow-hidden">
              {inspection.supplyRecords.map((record) => (
                <div
                  key={record.id}
                  className="px-4 py-2.5 flex items-center justify-between border-b border-warm-50 last:border-b-0"
                >
                  <span className="text-sm text-warm-700">{record.itemName}</span>
                  <span className="text-sm text-warm-500 font-medium">× {record.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 px-4 py-3 flex gap-3 z-20">
        <button
          onClick={handleApprove}
          className="flex-1 py-3 rounded-xl bg-sage-500 text-white font-serif text-sm hover:bg-sage-600 transition-colors active:scale-[0.98]"
        >
          通过复核
        </button>
        {reworkItems.length > 0 && (
          <button
            onClick={handleRework}
            className="flex-1 py-3 rounded-xl bg-coral-400 text-white font-serif text-sm hover:bg-coral-500 transition-colors active:scale-[0.98]"
          >
            退回返工 ({reworkItems.length}项)
          </button>
        )}
      </div>
    </div>
  )
}
