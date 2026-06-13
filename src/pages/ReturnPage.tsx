import { useState, useEffect } from 'react'
import { useLabStore } from '@/store'
import { DAMAGE_LOCATIONS } from '@/types'
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  clean: { label: '已洗净', cls: 'bg-emerald-100 text-emerald-700' },
  damaged: { label: '破损', cls: 'bg-orange-100 text-orange-700' },
  missing: { label: '少件', cls: 'bg-red-100 text-red-700' },
}

export default function ReturnPage() {
  const { coats, washBatches, washBatchItems, returnItem, checkOverdue } = useLabStore()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [damageForm, setDamageForm] = useState<Record<string, { location: string; note: string }>>({})

  useEffect(() => {
    checkOverdue()
  }, [])

  const activeBatches = washBatches.filter((b) => b.status !== 'returned')

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openDamageForm = (itemId: string) => {
    setDamageForm((prev) => ({
      ...prev,
      [itemId]: { location: DAMAGE_LOCATIONS[0], note: '' },
    }))
  }

  const submitDamage = (itemId: string) => {
    const form = damageForm[itemId]
    if (!form) return
    returnItem(itemId, 'damaged', form.location, form.note)
    setDamageForm((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
  }

  const cancelDamage = (itemId: string) => {
    setDamageForm((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
  }

  const getCoat = (coatId: string) => coats.find((c) => c.id === coatId)

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-6">
      <h1 className="mb-6 text-2xl font-bold text-[#0D7377]">取回登记</h1>

      {activeBatches.length === 0 && (
        <p className="text-[#6B7280]">暂无待取回的洗涤批次</p>
      )}

      <div className="space-y-4">
        {activeBatches.map((batch) => {
          const items = washBatchItems.filter((i) => i.batchId === batch.id)
          const isExpanded = expandedIds.has(batch.id)
          const overdueDays =
            batch.status === 'overdue'
              ? differenceInDays(new Date(), new Date(batch.expectedReturnDate))
              : 0

          return (
            <div
              key={batch.id}
              className="rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div
                className="flex cursor-pointer items-center justify-between px-5 py-4"
                onClick={() => toggleExpand(batch.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-[#0D7377]">
                    {batch.batchNo}
                  </span>
                  <span className="text-sm text-[#6B7280]">
                    {batch.sender} · {batch.count}件
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      batch.status === 'overdue'
                        ? 'bg-orange-100 text-[#E8590C]'
                        : 'bg-teal-50 text-[#0D7377]'
                    )}
                  >
                    {batch.status === 'overdue' ? '超期' : '运送中'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <Clock className="h-3.5 w-3.5" />
                    预计 {format(new Date(batch.expectedReturnDate), 'MM-dd')}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-[#6B7280]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#6B7280]" />
                  )}
                </div>
              </div>

              {batch.status === 'overdue' && (
                <div className="mx-5 mb-3 flex items-center gap-2 rounded bg-orange-50 px-3 py-2 text-sm text-[#E8590C]">
                  <AlertTriangle className="h-4 w-4" />
                  已超期 {overdueDays} 天
                </div>
              )}

              {isExpanded && (
                <div className="border-t border-gray-100 px-5 pb-4 pt-2">
                  {items.map((item) => {
                    const coat = getCoat(item.coatId)
                    if (!coat) return null
                    const isReturned = item.returnStatus !== 'pending'
                    const form = damageForm[item.id]

                    return (
                      <div key={item.id} className="border-b border-gray-50 py-3 last:border-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-medium text-gray-800">
                              {coat.code}
                            </span>
                            <span className="text-sm text-[#6B7280]">
                              {coat.studentName}
                            </span>
                          </div>

                          {isReturned ? (
                            <span
                              className={cn(
                                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                STATUS_BADGE[item.returnStatus]?.cls
                              )}
                            >
                              {STATUS_BADGE[item.returnStatus]?.label}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => returnItem(item.id, 'clean')}
                                className="flex items-center gap-1 rounded bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                已洗净
                              </button>
                              <button
                                onClick={() => openDamageForm(item.id)}
                                className="flex items-center gap-1 rounded bg-[#E8590C] px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700"
                              >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                破损
                              </button>
                              <button
                                onClick={() => returnItem(item.id, 'missing')}
                                className="flex items-center gap-1 rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                少件
                              </button>
                            </div>
                          )}
                        </div>

                        {form && (
                          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
                            <div className="mb-2 flex items-center gap-3">
                              <label className="text-xs font-medium text-[#6B7280]">
                                破损位置
                              </label>
                              <select
                                value={form.location}
                                onChange={(e) =>
                                  setDamageForm((prev) => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], location: e.target.value },
                                  }))
                                }
                                className="rounded border border-orange-300 bg-white px-2 py-1 text-xs text-gray-700"
                              >
                                {DAMAGE_LOCATIONS.map((loc) => (
                                  <option key={loc} value={loc}>
                                    {loc}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="mb-2 flex items-center gap-3">
                              <label className="text-xs font-medium text-[#6B7280]">
                                破损备注
                              </label>
                              <input
                                type="text"
                                value={form.note}
                                onChange={(e) =>
                                  setDamageForm((prev) => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], note: e.target.value },
                                  }))
                                }
                                placeholder="请描述破损情况"
                                className="flex-1 rounded border border-orange-300 bg-white px-2 py-1 text-xs text-gray-700 placeholder:text-gray-400"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => cancelDamage(item.id)}
                                className="rounded px-3 py-1 text-xs text-[#6B7280] hover:bg-orange-100"
                              >
                                取消
                              </button>
                              <button
                                onClick={() => submitDamage(item.id)}
                                className="rounded bg-[#E8590C] px-3 py-1 text-xs font-medium text-white hover:bg-orange-700"
                              >
                                确认
                              </button>
                            </div>
                          </div>
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
    </div>
  )
}
