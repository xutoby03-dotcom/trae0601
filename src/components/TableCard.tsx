import React, { useRef, useState, useCallback } from 'react'
import { useWeddingStore } from '../store'
import { RELATIONSHIP_COLORS, RelationshipGroup } from '../types'
import { motion } from 'framer-motion'
import { Volume2, Users, Minus, Plus, Trash2, Settings } from 'lucide-react'

export default function TableCard({ tableId }: { tableId: string }) {
  const { tables, guests, moveTable, updateTable, removeTable, assignGuestToTable, unassignGuest } = useWeddingStore()
  const table = tables.find((t) => t.id === tableId)
  const tableGuests = guests.filter((g) => g.tableId === tableId)
  const totalCount = tableGuests.reduce((s, g) => s + g.partySize, 0)
  const [dragOver, setDragOver] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.table-settings') || (e.target as HTMLElement).closest('.guest-chip')) return
    if (!table) return
    e.preventDefault()
    dragOffset.current = { x: e.clientX - table.x, y: e.clientY - table.y }
    setIsDragging(true)

    const handleMouseMove = (ev: MouseEvent) => {
      const hall = containerRef.current?.parentElement
      if (!hall || !table) return
      const rect = hall.getBoundingClientRect()
      const newX = Math.max(0, Math.min(rect.width - 140, ev.clientX - dragOffset.current.x - rect.left))
      const newY = Math.max(0, Math.min(rect.height - 140, ev.clientY - dragOffset.current.y - rect.top))
      moveTable(tableId, newX, newY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [table, tableId, moveTable])

  if (!table) return null

  const isOverCapacity = totalCount > table.maxSeats
  const zoneColor = table.zone ? RELATIONSHIP_COLORS[table.zone] : undefined
  const fillPercent = Math.min(100, (totalCount / table.maxSeats) * 100)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const guestId = e.dataTransfer.getData('guestId')
    if (guestId) {
      assignGuestToTable(guestId, tableId)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }

  return (
    <div
      ref={containerRef}
      className={`table-card ${isOverCapacity ? 'over-capacity' : ''} ${dragOver ? 'drag-over' : ''} ${isDragging ? 'is-dragging' : ''}`}
      style={{ left: table.x, top: table.y }}
      onMouseDown={handleMouseDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
    >
      <div className="table-visual">
        <svg viewBox="0 0 100 100" className="table-svg">
          <circle
            cx="50" cy="50" r="42"
            fill={zoneColor || '#f8f4f0'}
            stroke={isOverCapacity ? '#e74c3c' : dragOver ? '#e8a87c' : '#d4c5b5'}
            strokeWidth="3"
          />
          <circle cx="50" cy="50" r="32" fill="white" fillOpacity="0.5" />
          {tableGuests.map((_, i) => {
            const angle = (i / Math.max(tableGuests.length, 1)) * 2 * Math.PI - Math.PI / 2
            const sx = 50 + 38 * Math.cos(angle)
            const sy = 50 + 38 * Math.sin(angle)
            return <circle key={i} cx={sx} cy={sy} r="5" fill={RELATIONSHIP_COLORS[tableGuests[i].relationship]} stroke="white" strokeWidth="1.5" />
          })}
        </svg>
        {table.isNearSpeaker && <Volume2 size={14} className="speaker-icon" />}
      </div>

      <div className="table-info">
        <div className="table-name">{table.name}</div>
        <div className={`table-count ${isOverCapacity ? 'over' : ''}`}>
          {totalCount}/{table.maxSeats}人
        </div>
        <div className="capacity-bar">
          <div className="capacity-fill" style={{ width: `${fillPercent}%`, background: isOverCapacity ? '#e74c3c' : zoneColor || '#c9a87c' }} />
        </div>
      </div>

      <div className="table-guests">
        {tableGuests.map((g) => (
          <span
            key={g.id}
            className="guest-chip"
            style={{ background: RELATIONSHIP_COLORS[g.relationship] }}
            onClick={() => unassignGuest(g.id)}
            title={`点击移除 ${g.name}`}
          >
            {g.name}{g.partySize > 1 ? `×${g.partySize}` : ''}
            {g.isChild && ' 👶'}
            {g.isElderly && ' 👴'}
            <span className="chip-remove">×</span>
          </span>
        ))}
      </div>

      <button className="table-settings-btn" onClick={() => setShowSettings(!showSettings)}>
        <Settings size={12} />
      </button>

      {showSettings && (
        <motion.div
          className="table-settings"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          <div className="setting-row">
            <label>桌名</label>
            <input value={table.name} onChange={(e) => updateTable(tableId, { name: e.target.value })} />
          </div>
          <div className="setting-row">
            <label>座位上限</label>
            <div className="stepper">
              <button onClick={() => updateTable(tableId, { maxSeats: Math.max(1, table.maxSeats - 1) })}><Minus size={14} /></button>
              <span>{table.maxSeats}</span>
              <button onClick={() => updateTable(tableId, { maxSeats: table.maxSeats + 1 })}><Plus size={14} /></button>
            </div>
          </div>
          <div className="setting-row">
            <label className="checkbox-label">
              <input type="checkbox" checked={table.isNearSpeaker} onChange={(e) => updateTable(tableId, { isNearSpeaker: e.target.checked })} />
              靠近音响
            </label>
          </div>
          <div className="setting-row">
            <label>分区</label>
            <select value={table.zone || ''} onChange={(e) => updateTable(tableId, { zone: (e.target.value || null) as RelationshipGroup | null })}>
              <option value="">无</option>
              {(['亲戚', '同学', '同事', '朋友', '其他'] as RelationshipGroup[]).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-danger-sm" onClick={() => removeTable(tableId)}>
            <Trash2 size={12} /> 删除桌子
          </button>
        </motion.div>
      )}
    </div>
  )
}
