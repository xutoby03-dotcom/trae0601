import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLabStore } from '@/store'
import { AlertTriangle, Clock, ChevronRight, Users } from 'lucide-react'
import { differenceInDays } from 'date-fns'

interface OverdueAlertProps {
  onExpand?: (batchId: string) => void
}

export default function OverdueAlert({ onExpand }: OverdueAlertProps) {
  const { coats, washBatches, washBatchItems } = useLabStore()
  const navigate = useNavigate()
  const location = useLocation()

  const overdueBatches = useMemo(() => {
    return washBatches
      .filter(b => b.status === 'overdue')
      .map(batch => {
        const items = washBatchItems.filter(i => i.batchId === batch.id)
        const pendingItems = items.filter(i => i.returnStatus === 'pending')
        const students = pendingItems
          .map(item => coats.find(c => c.id === item.coatId))
          .filter(Boolean)
        const overdueDays = differenceInDays(new Date(), new Date(batch.expectedReturnDate))
        return {
          ...batch,
          overdueDays,
          missingCount: pendingItems.length,
          students,
        }
      })
      .sort((a, b) => b.overdueDays - a.overdueDays)
  }, [washBatches, washBatchItems, coats])

  if (overdueBatches.length === 0) return null

  const handleBatchClick = (batchId: string) => {
    if (onExpand) {
      onExpand(batchId)
      setTimeout(() => {
        const el = document.getElementById(`batch-${batchId}`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    } else {
      navigate('/return', { state: { expandBatch: batchId } })
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8590C]/15">
          <AlertTriangle className="h-5 w-5 text-[#E8590C]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">超期预警</h2>
          <p className="text-xs text-[#6B7280]">以下批次已超过预计取回时间，请尽快处理</p>
        </div>
        <span className="ml-auto rounded-full bg-[#E8590C] px-3 py-0.5 text-xs font-semibold text-white">
          {overdueBatches.length} 个批次
        </span>
      </div>

      <div className="space-y-3">
        {overdueBatches.map(batch => (
          <button
            key={batch.id}
            onClick={() => handleBatchClick(batch.id)}
            className="w-full rounded-lg border border-orange-200 bg-white p-4 text-left transition-all hover:border-orange-300 hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8590C]/10 flex-shrink-0">
                  <Clock className="h-5 w-5 text-[#E8590C]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {batch.batchNo}
                    </span>
                    <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                      超期 {batch.overdueDays} 天
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-[#6B7280]">
                    <span>送洗人：{batch.sender}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      缺 {batch.missingCount} 件未归还
                    </span>
                  </div>
                  {batch.students.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {batch.students.slice(0, 5).map((student, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-orange-100/60 px-1.5 py-0.5 text-[10px] font-medium text-orange-800"
                        >
                          {student?.studentName}
                        </span>
                      ))}
                      {batch.students.length > 5 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-[#6B7280]">
                          +{batch.students.length - 5} 人
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#E8590C]" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
