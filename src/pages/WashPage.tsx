import { useState, useMemo } from 'react'
import { useLabStore } from '@/store'
import { Plus, X, Send, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  returned: { color: '#22c55e', bg: 'bg-green-100', label: '已归还', Icon: CheckCircle2 },
  sent: { color: '#eab308', bg: 'bg-yellow-100', label: '已送洗', Icon: Send },
  overdue: { color: '#ef4444', bg: 'bg-red-100', label: '已逾期', Icon: AlertTriangle },
}

export default function WashPage() {
  const { coats, washBatches, washBatchItems, addWashBatch, checkOverdue } = useLabStore()
  const [showModal, setShowModal] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sender, setSender] = useState('')
  const [returnDate, setReturnDate] = useState('')

  useMemo(() => { checkOverdue() }, [checkOverdue])

  const availableCoats = useMemo(
    () => coats.filter((c) => c.status === 'available'),
    [coats]
  )

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    if (!sender || !returnDate || selectedIds.length === 0) return
    addWashBatch(
      { sender, count: selectedIds.length, expectedReturnDate: returnDate, status: 'sent' },
      selectedIds
    )
    setSelectedIds([])
    setSender('')
    setReturnDate('')
    setShowModal(false)
  }

  const sortedBatches = useMemo(
    () => [...washBatches].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [washBatches]
  )

  const getBatchCoats = (batchId: string) => {
    const items = washBatchItems.filter((i) => i.batchId === batchId)
    return items.map((item) => {
      const coat = coats.find((c) => c.id === item.coatId)
      return coat ? { ...coat, returnStatus: item.returnStatus } : null
    }).filter(Boolean)
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F8FA' }}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#0D7377' }}>送洗登记</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ background: '#0D7377' }}
          >
            <Plus size={16} />新建批次
          </button>
        </div>

        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-4">
            {sortedBatches.map((batch) => {
              const cfg = STATUS_CONFIG[batch.status]
              const isExpanded = expandedId === batch.id
              const batchCoats = isExpanded ? getBatchCoats(batch.id) : []
              return (
                <div key={batch.id} className="relative pl-12">
                  <div
                    className="absolute left-3.5 top-5 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ background: cfg.color }}
                  />
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : batch.id)}
                    className={cn(
                      'rounded-xl p-4 cursor-pointer transition-shadow border',
                      'hover:shadow-md',
                      batch.status === 'overdue' && 'ring-2 ring-red-400 animate-pulse'
                    )}
                    style={{ background: '#fff', borderColor: batch.status === 'overdue' ? '#fca5a5' : '#e5e7eb' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ background: '#0D7377' }}
                        >
                          {batch.sender[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#374151' }}>
                              {batch.batchNo}
                            </span>
                            <span
                              className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs text-white font-medium"
                              style={{ background: '#0D7377' }}
                            >
                              {batch.count}
                            </span>
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                            {batch.sender} · 预计归还 {batch.expectedReturnDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn('w-2 h-2 rounded-full', batch.status === 'overdue' && 'animate-pulse')}
                          style={{ background: cfg.color }}
                        />
                        <span className="text-xs font-medium" style={{ color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    {isExpanded && batchCoats.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        {batchCoats.map((coat: any) => (
                          <div
                            key={coat.id}
                            className="flex items-center justify-between py-1.5 px-3 rounded-lg"
                            style={{ background: '#F7F8FA' }}
                          >
                            <span className="text-sm" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#374151' }}>
                              {coat.code}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs" style={{ color: '#6B7280' }}>{coat.studentName}</span>
                              <span
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{
                                  background: coat.returnStatus === 'clean' ? '#dcfce7' : coat.returnStatus === 'damaged' ? '#fee2e2' : '#fef9c3',
                                  color: coat.returnStatus === 'clean' ? '#166534' : coat.returnStatus === 'damaged' ? '#991b1b' : '#854d0e',
                                }}
                              >
                                {coat.returnStatus === 'pending' ? '待归还' : coat.returnStatus === 'clean' ? '已清洁' : '有破损'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {sortedBatches.length === 0 && (
          <div className="text-center py-16" style={{ color: '#6B7280' }}>
            <Clock size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">暂无送洗记录</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl mx-4 rounded-2xl shadow-2xl" style={{ background: '#fff' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold" style={{ color: '#0D7377' }}>新建送洗批次</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} style={{ color: '#6B7280' }} />
              </button>
            </div>
            <div className="flex gap-4 p-6" style={{ minHeight: 320 }}>
              <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-3 py-2 text-xs font-medium border-b border-gray-100" style={{ color: '#6B7280' }}>
                  可选白大褂 ({availableCoats.length})
                </div>
                <div className="overflow-y-auto max-h-60 p-2 space-y-1">
                  {availableCoats.map((coat) => (
                    <label
                      key={coat.id}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors',
                        selectedIds.includes(coat.id) ? 'text-white' : 'hover:bg-gray-50'
                      )}
                      style={selectedIds.includes(coat.id) ? { background: '#0D7377' } : {}}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(coat.id)}
                        onChange={() => toggleSelect(coat.id)}
                        className="hidden"
                      />
                      <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{coat.code}</span>
                      <span className="ml-auto text-xs opacity-80">{coat.studentName}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-3 py-2 text-xs font-medium border-b border-gray-100" style={{ color: '#6B7280' }}>
                  已选择 ({selectedIds.length})
                </div>
                <div className="overflow-y-auto max-h-60 p-2 space-y-1">
                  {selectedIds.map((id) => {
                    const coat = coats.find((c) => c.id === id)
                    if (!coat) return null
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
                        style={{ background: '#F7F8FA', color: '#374151' }}
                      >
                        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{coat.code}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs" style={{ color: '#6B7280' }}>{coat.studentName}</span>
                          <button
                            onClick={() => toggleSelect(id)}
                            className="p-0.5 rounded hover:bg-gray-200"
                          >
                            <X size={14} style={{ color: '#6B7280' }} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  {selectedIds.length === 0 && (
                    <p className="text-center py-8 text-xs" style={{ color: '#9ca3af' }}>从左侧选择白大褂</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 pb-6">
              <input
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="送洗人姓名"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#0D7377' } as React.CSSProperties}
              />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#0D7377' } as React.CSSProperties}
              />
              <button
                onClick={handleSubmit}
                disabled={!sender || !returnDate || selectedIds.length === 0}
                className="px-6 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40 transition-opacity"
                style={{ background: '#0D7377' }}
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
