import { useState, useEffect } from 'react'
import { store, uid } from '../store'
import { DogProfile, WalkPlan, WalkRecord, RecordType } from '../types'

const RECORD_TYPES: { value: RecordType; icon: string; color: string }[] = [
  { value: '打架', icon: '💥', color: 'var(--danger-light)' },
  { value: '捡到东西', icon: '🎁', color: 'var(--warning-light)' },
  { value: '遇到流浪狗', icon: '🐕', color: 'var(--info-light)' },
  { value: '友好互动', icon: '🤝', color: 'var(--success-light)' },
  { value: '其他', icon: '📋', color: 'var(--bg)' },
]

const typeIconMap: Record<RecordType, string> = {
  '打架': '💥',
  '捡到东西': '🎁',
  '遇到流浪狗': '🐕',
  '友好互动': '🤝',
  '其他': '📋',
}

const typeColorMap: Record<RecordType, string> = {
  '打架': 'var(--danger-light)',
  '捡到东西': 'var(--warning-light)',
  '遇到流浪狗': 'var(--info-light)',
  '友好互动': 'var(--success-light)',
  '其他': 'var(--bg)',
}

const typeBadgeMap: Record<RecordType, string> = {
  '打架': 'badge-danger',
  '捡到东西': 'badge-warning',
  '遇到流浪狗': 'badge-info',
  '友好互动': 'badge-success',
  '其他': 'badge-primary',
}

export default function Records() {
  const [records, setRecords] = useState<WalkRecord[]>([])
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [plans, setPlans] = useState<WalkPlan[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    dogId: '',
    planId: '',
    recordType: '友好互动' as RecordType,
    description: '',
  })

  useEffect(() => {
    setRecords(store.records.getAll())
    setDogs(store.dogs.getAll())
    setPlans(store.plans.getAll())
  }, [])

  function refresh() {
    setRecords(store.records.getAll())
    setDogs(store.dogs.getAll())
    setPlans(store.plans.getAll())
  }

  function openAdd() {
    setForm({
      dogId: dogs.length > 0 ? dogs[0].id : '',
      planId: '',
      recordType: '友好互动',
      description: '',
    })
    setShowForm(true)
  }

  function handleSave() {
    const dog = dogs.find((d) => d.id === form.dogId)
    if (!dog) return

    const plan = form.planId ? plans.find((p) => p.id === form.planId) : null

    const record: WalkRecord = {
      id: uid(),
      planId: form.planId || '',
      dogId: dog.id,
      dogName: dog.name,
      ownerId: dog.ownerId,
      ownerName: dog.ownerName,
      recordType: form.recordType,
      description: form.description.trim(),
      route: plan?.route || '',
      date: plan?.date || new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    }

    store.records.add(record)
    setShowForm(false)
    refresh()
  }

  function handleDelete(id: string) {
    if (confirm('确定删除这条记录吗？')) {
      store.records.remove(id)
      refresh()
    }
  }

  const availablePlans = plans.filter((p) => p.dogId === form.dogId)

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div>
      <div className="page-title">
        📝 遛狗记录
        <button className="btn btn-primary" onClick={openAdd} style={{ marginLeft: 'auto' }}>
          + 添加记录
        </button>
      </div>

      {dogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🐶</div>
          <div className="empty-state-text">请先添加狗狗档案</div>
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-text">还没有遛狗记录</div>
          <button className="btn btn-primary" onClick={openAdd}>
            记录第一次遛狗
          </button>
        </div>
      ) : (
        sortedRecords.map((record) => (
          <div key={record.id} className="record-card">
            <div
              className="record-icon"
              style={{ background: typeColorMap[record.recordType] }}
            >
              {typeIconMap[record.recordType]}
            </div>
            <div className="record-info">
              <div className="record-title">
                {record.dogName}
                <span className={`badge ${typeBadgeMap[record.recordType]}`}>
                  {record.recordType}
                </span>
              </div>
              <div className="record-desc">
                {record.description || '无详细描述'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                👤 {record.ownerName}
                {record.route && ` · 📍 ${record.route}`}
                {record.date && ` · 📅 ${record.date}`}
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline"
              style={{ color: 'var(--danger)', flexShrink: 0 }}
              onClick={() => handleDelete(record.id)}
            >
              删除
            </button>
          </div>
        ))
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">添加遛狗记录</div>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">选择狗狗 *</label>
                <select
                  className="form-select"
                  value={form.dogId}
                  onChange={(e) =>
                    setForm({ ...form, dogId: e.target.value, planId: '' })
                  }
                >
                  <option value="">请选择</option>
                  {dogs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">关联计划（可选）</label>
                <select
                  className="form-select"
                  value={form.planId}
                  onChange={(e) => setForm({ ...form, planId: e.target.value })}
                >
                  <option value="">不关联</option>
                  {availablePlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.date} {p.timeSlot} - {p.route}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">记录类型 *</label>
                <div className="tag-list">
                  {RECORD_TYPES.map((rt) => (
                    <span
                      key={rt.value}
                      className={`tag tag-clickable ${form.recordType === rt.value ? 'selected' : ''}`}
                      onClick={() =>
                        setForm({ ...form, recordType: rt.value })
                      }
                    >
                      {rt.icon} {rt.value}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">详细描述</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="描述一下发生了什么..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowForm(false)}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!form.dogId}
              >
                保存记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
