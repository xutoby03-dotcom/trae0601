import { useState, useEffect } from 'react'
import { store, uid } from '../store'
import { DogProfile, DogSize, DogPersonality } from '../types'

const SIZES: DogSize[] = ['小型', '中型', '大型']
const PERSONALITIES: DogPersonality[] = ['温顺', '活泼', '胆小', '好斗', '独立']
const AREAS = ['小区花园', '河边步道', '中央公园', '南区草坪', '北门广场', '商业街', '林荫小道', '湖边栈道']

const sizeEmoji: Record<DogSize, string> = {
  '小型': '🐶',
  '中型': '🐕',
  '大型': '🐕‍🦺',
}

interface DogForm {
  name: string
  size: DogSize
  personality: DogPersonality[]
  afraidOfBigDogs: boolean
  goodWithKids: boolean
  frequentAreas: string[]
  ownerName: string
  incompatibleDogIds: string[]
}

const emptyForm: DogForm = {
  name: '',
  size: '中型',
  personality: [],
  afraidOfBigDogs: false,
  goodWithKids: true,
  frequentAreas: [],
  ownerName: '',
  incompatibleDogIds: [],
}

export default function Dogs() {
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingDog, setEditingDog] = useState<DogProfile | null>(null)
  const [form, setForm] = useState<DogForm>(emptyForm)

  useEffect(() => {
    setDogs(store.dogs.getAll())
  }, [])

  function refreshDogs() {
    setDogs(store.dogs.getAll())
  }

  function openAdd() {
    setEditingDog(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(dog: DogProfile) {
    setEditingDog(dog)
    setForm({
      name: dog.name,
      size: dog.size,
      personality: [...dog.personality],
      afraidOfBigDogs: dog.afraidOfBigDogs,
      goodWithKids: dog.goodWithKids,
      frequentAreas: [...dog.frequentAreas],
      ownerName: dog.ownerName,
      incompatibleDogIds: [...dog.incompatibleDogIds],
    })
    setShowModal(true)
  }

  function togglePersonality(p: DogPersonality) {
    setForm((f) => ({
      ...f,
      personality: f.personality.includes(p)
        ? f.personality.filter((x) => x !== p)
        : [...f.personality, p],
    }))
  }

  function toggleArea(area: string) {
    setForm((f) => ({
      ...f,
      frequentAreas: f.frequentAreas.includes(area)
        ? f.frequentAreas.filter((x) => x !== area)
        : [...f.frequentAreas, area],
    }))
  }

  function toggleIncompatible(dogId: string) {
    setForm((f) => ({
      ...f,
      incompatibleDogIds: f.incompatibleDogIds.includes(dogId)
        ? f.incompatibleDogIds.filter((x) => x !== dogId)
        : [...f.incompatibleDogIds, dogId],
    }))
  }

  function handleSave() {
    if (!form.name.trim() || !form.ownerName.trim()) return

    if (editingDog) {
      const updated: DogProfile = {
        ...editingDog,
        name: form.name.trim(),
        size: form.size,
        personality: form.personality,
        afraidOfBigDogs: form.afraidOfBigDogs,
        goodWithKids: form.goodWithKids,
        frequentAreas: form.frequentAreas,
        ownerName: form.ownerName.trim(),
        incompatibleDogIds: form.incompatibleDogIds,
      }
      store.dogs.update(updated)
    } else {
      const newDog: DogProfile = {
        id: uid(),
        name: form.name.trim(),
        size: form.size,
        personality: form.personality,
        afraidOfBigDogs: form.afraidOfBigDogs,
        goodWithKids: form.goodWithKids,
        frequentAreas: form.frequentAreas,
        ownerId: uid(),
        ownerName: form.ownerName.trim(),
        incompatibleDogIds: form.incompatibleDogIds,
        createdAt: new Date().toISOString(),
      }
      store.dogs.add(newDog)
    }

    setShowModal(false)
    refreshDogs()
  }

  function handleDelete(id: string) {
    if (confirm('确定删除这只狗狗的档案吗？')) {
      store.dogs.remove(id)
      refreshDogs()
    }
  }

  const otherDogs = dogs.filter((d) => d.id !== editingDog?.id)

  return (
    <div>
      <div className="page-title">
        🐕 狗狗档案
        <button className="btn btn-primary" onClick={openAdd} style={{ marginLeft: 'auto' }}>
          + 添加狗狗
        </button>
      </div>

      {dogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🐶</div>
          <div className="empty-state-text">还没有添加任何狗狗</div>
          <button className="btn btn-primary" onClick={openAdd}>
            添加第一只狗狗
          </button>
        </div>
      ) : (
        <div className="dog-card-grid">
          {dogs.map((dog) => (
            <div key={dog.id} className="dog-card">
              <div className="dog-card-top">
                <div className="dog-avatar">{sizeEmoji[dog.size]}</div>
                <div>
                  <div className="dog-card-name">{dog.name}</div>
                  <div className="dog-card-owner">{dog.ownerName}</div>
                </div>
              </div>

              <div className="dog-card-info">
                <span className="badge badge-primary">{dog.size}</span>
                {dog.personality.map((p) => (
                  <span key={p} className="badge badge-info">
                    {p}
                  </span>
                ))}
                {dog.afraidOfBigDogs && (
                  <span className="badge badge-warning">怕大狗</span>
                )}
                {dog.goodWithKids && (
                  <span className="badge badge-success">亲和小朋友</span>
                )}
              </div>

              {dog.frequentAreas.length > 0 && (
                <div className="dog-card-areas">
                  📍 常去：{dog.frequentAreas.join('、')}
                </div>
              )}

              {dog.incompatibleDogIds.length > 0 && (
                <div className="dog-card-areas" style={{ color: 'var(--danger)' }}>
                  ⚠️ 不合：{dog.incompatibleDogIds
                    .map((id) => dogs.find((d) => d.id === id)?.name)
                    .filter(Boolean)
                    .join('、')}
                </div>
              )}

              <div className="dog-card-actions">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => openEdit(dog)}
                >
                  ✏️ 编辑
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  style={{ color: 'var(--danger)' }}
                  onClick={() => handleDelete(dog.id)}
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {editingDog ? '编辑狗狗' : '添加狗狗'}
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">狗狗名字 *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="给狗狗取个名字"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">体型</label>
                  <select
                    className="form-select"
                    value={form.size}
                    onChange={(e) =>
                      setForm({ ...form, size: e.target.value as DogSize })
                    }
                  >
                    {SIZES.map((s) => (
                      <option key={s} value={s}>
                        {sizeEmoji[s]} {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">主人名字 *</label>
                  <input
                    className="form-input"
                    value={form.ownerName}
                    onChange={(e) =>
                      setForm({ ...form, ownerName: e.target.value })
                    }
                    placeholder="你的名字"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">性格（可多选）</label>
                <div className="tag-list">
                  {PERSONALITIES.map((p) => (
                    <span
                      key={p}
                      className={`tag tag-clickable ${form.personality.includes(p) ? 'selected' : ''}`}
                      onClick={() => togglePersonality(p)}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <div className="form-check">
                  <input
                    type="checkbox"
                    checked={form.afraidOfBigDogs}
                    onChange={(e) =>
                      setForm({ ...form, afraidOfBigDogs: e.target.checked })
                    }
                  />
                  <label>怕大狗</label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    checked={form.goodWithKids}
                    onChange={(e) =>
                      setForm({ ...form, goodWithKids: e.target.checked })
                    }
                  />
                  <label>能和小朋友接触</label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">常去区域</label>
                <div className="tag-list">
                  {AREAS.map((area) => (
                    <span
                      key={area}
                      className={`tag tag-clickable ${form.frequentAreas.includes(area) ? 'selected' : ''}`}
                      onClick={() => toggleArea(area)}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {otherDogs.length > 0 && (
                <div className="form-group">
                  <label className="form-label">不合的狗狗</label>
                  <div className="tag-list">
                    {otherDogs.map((d) => (
                      <span
                        key={d.id}
                        className={`tag tag-clickable ${form.incompatibleDogIds.includes(d.id) ? 'selected' : ''}`}
                        onClick={() => toggleIncompatible(d.id)}
                        style={
                          form.incompatibleDogIds.includes(d.id)
                            ? { background: 'var(--danger)', color: 'white' }
                            : { background: 'var(--danger-light)', color: 'var(--danger)' }
                        }
                      >
                        {d.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!form.name.trim() || !form.ownerName.trim()}
              >
                {editingDog ? '保存修改' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
