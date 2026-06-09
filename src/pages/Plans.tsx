import { useState, useEffect } from 'react'
import { store, checkAndCreateConflicts, uid } from '../store'
import { DogProfile, WalkPlan, TimeSlot } from '../types'
import { ConflictAlert } from '../types'

interface Props {
  onNavigate: (tab: 'home' | 'records') => void
}

const TIME_SLOTS: { value: TimeSlot; label: string; icon: string }[] = [
  { value: '傍晚', label: '傍晚 (17:00-19:00)', icon: '🌅' },
  { value: '夜间', label: '夜间 (19:00-22:00)', icon: '🌙' },
  { value: '周末上午', label: '周末上午 (8:00-11:00)', icon: '☀️' },
  { value: '周末下午', label: '周末下午 (14:00-17:00)', icon: '🌤️' },
]

const ROUTES = [
  '小区花园',
  '河边步道',
  '中央公园',
  '南区草坪',
  '北门广场',
  '商业街',
  '林荫小道',
  '湖边栈道',
]

function getDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

interface PlanForm {
  dogId: string
  date: string
  timeSlot: TimeSlot
  specificTime: string
  route: string
  customRoute: string
  duration: number
  willingToJoin: boolean
  notes: string
}

export default function Plans({ onNavigate }: Props) {
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [plans, setPlans] = useState<WalkPlan[]>([])
  const [conflicts, setConflicts] = useState<ConflictAlert[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newConflicts, setNewConflicts] = useState<ConflictAlert[]>([])
  const [form, setForm] = useState<PlanForm>({
    dogId: '',
    date: getDateStr(new Date()),
    timeSlot: '傍晚',
    specificTime: '18:00',
    route: '',
    customRoute: '',
    duration: 30,
    willingToJoin: true,
    notes: '',
  })

  useEffect(() => {
    setDogs(store.dogs.getAll())
    setPlans(store.plans.getAll())
    setConflicts(store.conflicts.getAll())
  }, [])

  function refresh() {
    setDogs(store.dogs.getAll())
    setPlans(store.plans.getAll())
    setConflicts(store.conflicts.getAll())
  }

  function openAdd() {
    setForm({
      dogId: dogs.length > 0 ? dogs[0].id : '',
      date: getDateStr(new Date()),
      timeSlot: '傍晚',
      specificTime: '18:00',
      route: '',
      customRoute: '',
      duration: 30,
      willingToJoin: true,
      notes: '',
    })
    setNewConflicts([])
    setShowForm(true)
  }

  function handleSave() {
    const dog = dogs.find((d) => d.id === form.dogId)
    if (!dog) return

    const route = form.route === '__custom__' ? form.customRoute.trim() : form.route
    if (!route) return

    const plan: WalkPlan = {
      id: uid(),
      dogId: dog.id,
      dogName: dog.name,
      ownerId: dog.ownerId,
      ownerName: dog.ownerName,
      date: form.date,
      timeSlot: form.timeSlot,
      specificTime: form.specificTime,
      route,
      duration: form.duration,
      willingToJoin: form.willingToJoin,
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    }

    store.plans.add(plan)

    const createdConflicts = checkAndCreateConflicts(plan)
    setNewConflicts(createdConflicts)

    refresh()
  }

  function handleDelete(id: string) {
    if (confirm('确定删除这个遛狗计划吗？')) {
      store.plans.remove(id)
      refresh()
    }
  }

  const sizeEmoji: Record<string, string> = {
    '小型': '🐶',
    '中型': '🐕',
    '大型': '🐕‍🦺',
  }

  const timeSlotIcon: Record<string, string> = {
    '傍晚': '🌅',
    '夜间': '🌙',
    '周末上午': '☀️',
    '周末下午': '🌤️',
  }

  const sortedPlans = [...plans].sort(
    (a, b) => `${a.date}${a.specificTime}`.localeCompare(`${b.date}${b.specificTime}`)
  )

  return (
    <div>
      <div className="page-title">
        📅 遛狗计划
        <button className="btn btn-primary" onClick={openAdd} style={{ marginLeft: 'auto' }}>
          + 发布计划
        </button>
      </div>

      {newConflicts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="section-label" style={{ borderColor: 'var(--danger)' }}>
            ⚠️ 冲突提醒
          </div>
          {newConflicts.map((c) => (
            <div key={c.id} className="conflict-banner">
              <span className="conflict-banner-icon">⚠️</span>
              <div className="conflict-banner-content">
                <div className="conflict-banner-title">{c.reason}</div>
                <div className="conflict-banner-desc">
                  {c.owner1Name} 的 {c.dog1Name} 和 {c.owner2Name} 的 {c.dog2Name}
                  都选了 {c.date} {c.timeSlot} 的 {c.route}
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => {
                  store.conflicts.resolve(c.id)
                  setNewConflicts((prev) => prev.filter((x) => x.id !== c.id))
                  refresh()
                }}
              >
                已知悉
              </button>
            </div>
          ))}
        </div>
      )}

      {dogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🐶</div>
          <div className="empty-state-text">请先添加狗狗档案</div>
          <button className="btn btn-primary" onClick={() => onNavigate('home')}>
            去添加狗狗
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-text">还没有遛狗计划</div>
          <button className="btn btn-primary" onClick={openAdd}>
            发布第一个计划
          </button>
        </div>
      ) : (
        sortedPlans.map((plan) => {
          const dog = dogs.find((d) => d.id === plan.dogId)
          const planConflicts = conflicts.filter(
            (c) =>
              !c.resolved &&
              (c.plan1Id === plan.id || c.plan2Id === plan.id)
          )
          return (
            <div
              key={plan.id}
              className={`card ${planConflicts.length > 0 ? '' : ''}`}
              style={
                planConflicts.length > 0
                  ? { borderColor: 'rgba(224, 72, 72, 0.3)' }
                  : {}
              }
            >
              <div className="card-header">
                <div className="card-title">
                  {timeSlotIcon[plan.timeSlot]} {plan.dogName}
                  <span className="badge badge-primary">{plan.timeSlot}</span>
                  {plan.willingToJoin && (
                    <span className="badge badge-success">可结伴</span>
                  )}
                </div>
                <button
                  className="btn btn-sm btn-outline"
                  style={{ color: 'var(--danger)' }}
                  onClick={() => handleDelete(plan.id)}
                >
                  删除
                </button>
              </div>

              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                <div>
                  📅 {plan.date} · ⏰ {plan.specificTime} · ⏱️ {plan.duration}分钟
                </div>
                <div>
                  📍 {plan.route} · 👤 {plan.ownerName}
                  {dog && ` · ${sizeEmoji[dog.size]} ${dog.size}`}
                </div>
                {plan.notes && <div style={{ marginTop: 4 }}>💬 {plan.notes}</div>}
              </div>

              {planConflicts.map((c) => (
                <div key={c.id} className="conflict-banner" style={{ marginTop: 12 }}>
                  <span className="conflict-banner-icon">⚠️</span>
                  <div className="conflict-banner-content">
                    <div className="conflict-banner-title">{c.reason}</div>
                    <div className="conflict-banner-desc">
                      {c.owner1Name} 的 {c.dog1Name} vs {c.owner2Name} 的 {c.dog2Name}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      store.conflicts.resolve(c.id)
                      refresh()
                    }}
                  >
                    已知悉
                  </button>
                </div>
              ))}
            </div>
          )
        })
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">发布遛狗计划</div>
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
                  onChange={(e) => setForm({ ...form, dogId: e.target.value })}
                >
                  <option value="">请选择</option>
                  {dogs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {sizeEmoji[d.size]} {d.name} ({d.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">日期 *</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">具体时间</label>
                  <input
                    className="form-input"
                    type="time"
                    value={form.specificTime}
                    onChange={(e) =>
                      setForm({ ...form, specificTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">时间段</label>
                <div className="tag-list">
                  {TIME_SLOTS.map((ts) => (
                    <span
                      key={ts.value}
                      className={`tag tag-clickable ${form.timeSlot === ts.value ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, timeSlot: ts.value })}
                    >
                      {ts.icon} {ts.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">路线 *</label>
                <div className="tag-list" style={{ marginBottom: 8 }}>
                  {ROUTES.map((r) => (
                    <span
                      key={r}
                      className={`tag tag-clickable ${form.route === r ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, route: r })}
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <input
                  className="form-input"
                  placeholder="或输入自定义路线..."
                  value={form.route !== '' && !ROUTES.includes(form.route) ? form.route : form.customRoute}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val) {
                      setForm({ ...form, route: '__custom__', customRoute: val })
                    } else {
                      setForm({ ...form, route: '', customRoute: '' })
                    }
                  }}
                  onFocus={() => {
                    if (!ROUTES.includes(form.route) && form.route !== '') {
                      setForm({ ...form, customRoute: form.route, route: '__custom__' })
                    }
                  }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">预计时长（分钟）</label>
                  <input
                    className="form-input"
                    type="number"
                    min={10}
                    max={180}
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">结伴意愿</label>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      checked={form.willingToJoin}
                      onChange={(e) =>
                        setForm({ ...form, willingToJoin: e.target.checked })
                      }
                    />
                    <label>愿意和其他主人结伴遛狗</label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">备注</label>
                <textarea
                  className="form-textarea"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="补充说明，比如绕路原因、特殊需求等"
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
                disabled={!form.dogId || (!form.route && !form.customRoute)}
              >
                发布计划
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
