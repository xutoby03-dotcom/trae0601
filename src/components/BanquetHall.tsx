import React from 'react'
import { useWeddingStore } from '../store'
import { RELATIONSHIP_COLORS, RelationshipGroup } from '../types'
import TableCard from './TableCard'
import { Plus, AlertTriangle, AlertCircle } from 'lucide-react'

export default function BanquetHall() {
  const { tables, addTable, conflicts, guests } = useWeddingStore()

  const errorConflicts = conflicts.filter((c) => c.severity === 'error')
  const warningConflicts = conflicts.filter((c) => c.severity === 'warning')

  return (
    <div className="hall-container">
      <div className="hall-toolbar">
        <button className="btn btn-primary" onClick={addTable}>
          <Plus size={16} /> 添加桌子
        </button>
        <div className="conflict-summary">
          {errorConflicts.length > 0 && (
            <span className="conflict-badge error"><AlertCircle size={14} /> {errorConflicts.length} 冲突</span>
          )}
          {warningConflicts.length > 0 && (
            <span className="conflict-badge warning"><AlertTriangle size={14} /> {warningConflicts.length} 警告</span>
          )}
        </div>
      </div>

      <div className="hall-floor">
        <div className="hall-stage">主舞台</div>
        <div className="hall-speaker hall-speaker-left">🔊</div>
        <div className="hall-speaker hall-speaker-right">🔊</div>

        {tables.map((table) => (
          <TableCard key={table.id} tableId={table.id} />
        ))}

        <div className="hall-legend">
          {(['亲戚', '同学', '同事', '朋友', '其他'] as RelationshipGroup[]).map((r) => (
            <div key={r} className="legend-item">
              <span className="legend-dot" style={{ background: RELATIONSHIP_COLORS[r] }} />
              {r}
            </div>
          ))}
        </div>
      </div>

      {(errorConflicts.length > 0 || warningConflicts.length > 0) && (
        <div className="conflict-list">
          {errorConflicts.map((c, i) => (
            <div key={`e-${i}`} className="conflict-item error">
              <AlertCircle size={14} />
              <span>{c.message}</span>
            </div>
          ))}
          {warningConflicts.map((c, i) => (
            <div key={`w-${i}`} className="conflict-item warning">
              <AlertTriangle size={14} />
              <span>{c.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
