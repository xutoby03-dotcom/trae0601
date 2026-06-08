import { useStore } from '../store/useStore'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export function OverdueBanner() {
  const [expanded, setExpanded] = useState(false)
  const borrowRecords = useStore((s) => s.borrowRecords)
  const equipment = useStore((s) => s.equipment)
  const returnEquipment = useStore((s) => s.returnEquipment)

  const overdueRecords = borrowRecords.filter((r) => r.status === 'overdue')

  if (overdueRecords.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-sunset-500 to-sunset-400 text-white rounded-xl overflow-hidden shadow-lg mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <span className="font-medium text-sm">
            {overdueRecords.length} 件装备逾期未还
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {overdueRecords.map((r) => {
            const eq = equipment.find((e) => e.id === r.equipmentId)
            return (
              <div
                key={r.id}
                className="bg-white/15 rounded-lg px-3 py-2 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-medium">{eq?.name ?? '未知'}</span>
                  <span className="ml-2 opacity-80">
                    借给 {r.borrowerName} · 应还 {r.plannedReturnDate}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
