import React, { useState, useRef } from 'react'
import { useWeddingStore } from '../store'
import { RelationshipGroup, RELATIONSHIP_COLORS } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Upload, Trash2, Edit3, Check, X, ChevronDown, ChevronRight } from 'lucide-react'

const RELATIONSHIPS: RelationshipGroup[] = ['亲戚', '同学', '同事', '朋友', '其他']

const emptyForm = {
  name: '',
  relationship: '朋友' as RelationshipGroup,
  partySize: 1,
  isChild: false,
  isElderly: false,
  dietaryRestrictions: '',
  cannotSitWith: '',
  preferSitWith: '',
}

export default function GuestListPanel() {
  const { guests, addGuest, updateGuest, removeGuest, importGuests, assignGuestToTable, tables } = useWeddingStore()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<typeof emptyForm>>({})
  const [showForm, setShowForm] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<RelationshipGroup>>(new Set(RELATIONSHIPS))
  const [dragGuestId, setDragGuestId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (!form.name.trim()) return
    addGuest({
      name: form.name.trim(),
      relationship: form.relationship,
      partySize: form.partySize,
      isChild: form.isChild,
      isElderly: form.isElderly,
      dietaryRestrictions: form.dietaryRestrictions.trim(),
      cannotSitWith: form.cannotSitWith.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      preferSitWith: form.preferSitWith.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
    })
    setForm(emptyForm)
    setShowForm(false)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const lines = text.split('\n').filter((l) => l.trim())
        const imported = lines.slice(1).map((line) => {
          const cols = line.split(',').map((c) => c.trim())
          return {
            name: cols[0] || '',
            relationship: (RELATIONSHIPS.includes(cols[1] as RelationshipGroup) ? cols[1] : '其他') as RelationshipGroup,
            partySize: parseInt(cols[2]) || 1,
            isChild: cols[3] === '是',
            isElderly: cols[4] === '是',
            dietaryRestrictions: cols[5] || '',
            cannotSitWith: (cols[6] || '').split(/[/]/).map((s) => s.trim()).filter(Boolean),
            preferSitWith: (cols[7] || '').split(/[/]/).map((s) => s.trim()).filter(Boolean),
          }
        }).filter((g) => g.name)
        importGuests(imported)
      } catch {
        alert('导入失败，请检查CSV格式')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const startEdit = (guestId: string) => {
    const g = guests.find((x) => x.id === guestId)
    if (!g) return
    setEditingId(guestId)
    setEditForm({
      name: g.name,
      relationship: g.relationship,
      partySize: g.partySize,
      isChild: g.isChild,
      isElderly: g.isElderly,
      dietaryRestrictions: g.dietaryRestrictions,
      cannotSitWith: g.cannotSitWith.join('，'),
      preferSitWith: g.preferSitWith.join('，'),
    })
  }

  const saveEdit = (guestId: string) => {
    const ef = editForm
    updateGuest(guestId, {
      name: ef.name,
      relationship: ef.relationship,
      partySize: ef.partySize,
      isChild: ef.isChild,
      isElderly: ef.isElderly,
      dietaryRestrictions: ef.dietaryRestrictions,
      cannotSitWith: (ef.cannotSitWith || '').split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      preferSitWith: (ef.preferSitWith || '').split(/[,，]/).map((s) => s.trim()).filter(Boolean),
    })
    setEditingId(null)
    setEditForm({})
  }

  const handleDragStart = (e: React.DragEvent, guestId: string) => {
    e.dataTransfer.setData('guestId', guestId)
    e.dataTransfer.effectAllowed = 'move'
    setDragGuestId(guestId)
  }

  const handleDragEnd = () => {
    setDragGuestId(null)
  }

  const toggleGroup = (group: RelationshipGroup) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  const grouped = RELATIONSHIPS.reduce((acc, r) => {
    acc[r] = guests.filter((g) => g.relationship === r)
    return acc
  }, {} as Record<RelationshipGroup, typeof guests>)

  const unassignedCount = guests.filter((g) => !g.tableId).length

  return (
    <div className="guest-panel">
      <div className="panel-header">
        <h2>宾客列表</h2>
        <span className="badge">{guests.length}人 / 未安排{unassignedCount}人</span>
      </div>

      <div className="panel-actions">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <UserPlus size={16} /> 添加宾客
        </button>
        <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
          <Upload size={16} /> 导入CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} hidden />
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="guest-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="form-row">
              <input placeholder="姓名 *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <select value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value as RelationshipGroup })}>
                {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>人数<input type="number" min={1} max={20} value={form.partySize} onChange={(e) => setForm({ ...form, partySize: parseInt(e.target.value) || 1 })} /></label>
              <label className="checkbox-label"><input type="checkbox" checked={form.isChild} onChange={(e) => setForm({ ...form, isChild: e.target.checked })} /> 儿童</label>
              <label className="checkbox-label"><input type="checkbox" checked={form.isElderly} onChange={(e) => setForm({ ...form, isElderly: e.target.checked })} /> 长辈</label>
            </div>
            <input placeholder="饮食忌口（如：海鲜过敏）" value={form.dietaryRestrictions} onChange={(e) => setForm({ ...form, dietaryRestrictions: e.target.value })} />
            <input placeholder="不能同桌的人（逗号分隔）" value={form.cannotSitWith} onChange={(e) => setForm({ ...form, cannotSitWith: e.target.value })} />
            <input placeholder="希望同桌的人（逗号分隔）" value={form.preferSitWith} onChange={(e) => setForm({ ...form, preferSitWith: e.target.value })} />
            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleSubmit}>确认添加</button>
              <button className="btn btn-ghost" onClick={() => { setShowForm(false); setForm(emptyForm) }}>取消</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="guest-groups">
        {RELATIONSHIPS.map((group) => {
          const groupGuests = grouped[group]
          if (groupGuests.length === 0) return null
          const isExpanded = expandedGroups.has(group)
          return (
            <div key={group} className="guest-group">
              <div className="group-header" onClick={() => toggleGroup(group)}>
                <span className="group-dot" style={{ background: RELATIONSHIP_COLORS[group] }} />
                <span className="group-name">{group}</span>
                <span className="group-count">{groupGuests.length}</span>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.15 }}>
                    {groupGuests.map((guest) => (
                      <div
                        key={guest.id}
                        className={`guest-item ${dragGuestId === guest.id ? 'dragging' : ''} ${guest.tableId ? 'assigned' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, guest.id)}
                        onDragEnd={handleDragEnd}
                      >
                        {editingId === guest.id ? (
                          <div className="guest-edit-inline">
                            <input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                            <div className="form-row compact">
                              <select value={editForm.relationship} onChange={(e) => setEditForm({ ...editForm, relationship: e.target.value as RelationshipGroup })}>
                                {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <label className="checkbox-label"><input type="checkbox" checked={editForm.isChild} onChange={(e) => setEditForm({ ...editForm, isChild: e.target.checked })} /> 儿童</label>
                              <label className="checkbox-label"><input type="checkbox" checked={editForm.isElderly} onChange={(e) => setEditForm({ ...editForm, isElderly: e.target.checked })} /> 长辈</label>
                            </div>
                            <div className="form-actions compact">
                              <button className="btn-icon" onClick={() => saveEdit(guest.id)}><Check size={14} /></button>
                              <button className="btn-icon" onClick={() => setEditingId(null)}><X size={14} /></button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="guest-info">
                              <span className="guest-name">
                                {guest.name}
                                {guest.partySize > 1 && <span className="party-size">×{guest.partySize}</span>}
                              </span>
                              <div className="guest-tags">
                                {guest.isChild && <span className="tag tag-child">儿童</span>}
                                {guest.isElderly && <span className="tag tag-elderly">长辈</span>}
                                {guest.dietaryRestrictions && <span className="tag tag-diet">忌口</span>}
                                {guest.tableId && <span className="tag tag-assigned">已安排</span>}
                              </div>
                            </div>
                            <div className="guest-actions">
                              <button className="btn-icon" onClick={() => startEdit(guest.id)}><Edit3 size={13} /></button>
                              <button className="btn-icon danger" onClick={() => removeGuest(guest.id)}><Trash2 size={13} /></button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
