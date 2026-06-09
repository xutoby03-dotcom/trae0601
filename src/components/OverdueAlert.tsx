import { AlertTriangle } from 'lucide-react'
import type { BorrowRecord } from '@/types'
import { formatDateTime } from '@/utils/helpers'

interface Props {
  records: BorrowRecord[]
}

export default function OverdueAlert({ records }: Props) {
  if (records.length === 0) return null

  return (
    <div className="rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-red-800 mb-1">
            {records.length}把雨伞逾期未还
          </h3>
          <div className="space-y-1">
            {records.map((r) => (
              <p key={r.id} className="text-xs text-red-600/80">
                {r.borrowerName} 借用 · 应还 {formatDateTime(r.expectedReturnTime)}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
