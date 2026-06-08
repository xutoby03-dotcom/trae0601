import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { loadPlants, updatePlant, fileToBase64 } from '../utils/storage'
import { LightPreference, LIGHT_LABELS, Plant } from '../types'

const LOCATIONS = ['客厅', '卧室', '书房', '南阳台', '东阳台', '西阳台', '北阳台', '卫生间', '厨房', '玄关']

export default function EditPlant() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [plant, setPlant] = useState<Plant | null>(null)
  const [photo, setPhoto] = useState('')
  const [form, setForm] = useState({
    name: '',
    variety: '',
    location: '客厅',
    waterCycleDays: 7,
    fertilizeCycleDays: 30,
    lightPreference: 'medium_indirect' as LightPreference,
    repotDate: '',
  })

  useEffect(() => {
    const plants = loadPlants()
    const found = plants.find(p => p.id === id)
    if (!found) { navigate('/'); return }
    setPlant(found)
    setPhoto(found.photo)
    setForm({
      name: found.name,
      variety: found.variety,
      location: found.location,
      waterCycleDays: found.waterCycleDays,
      fertilizeCycleDays: found.fertilizeCycleDays,
      lightPreference: found.lightPreference,
      repotDate: found.repotDate,
    })
  }, [id, navigate])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const base64 = await fileToBase64(file)
      setPhoto(base64)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !form.name.trim()) return
    updatePlant(id, {
      name: form.name.trim(),
      variety: form.variety.trim(),
      location: form.location,
      waterCycleDays: form.waterCycleDays,
      fertilizeCycleDays: form.fertilizeCycleDays,
      lightPreference: form.lightPreference,
      repotDate: form.repotDate,
      photo,
    })
    navigate(`/plant/${id}`)
  }

  if (!plant) return null

  return (
    <div>
      <h2 className="page-title">✏️ 编辑植物</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 8 }}>
            植物照片
          </label>
          <div className="photo-upload" onClick={() => fileRef.current?.click()}>
            {photo ? (
              <img src={photo} alt="植物照片" />
            ) : (
              <>
                <span className="icon">📷</span>
                <span className="text">点击上传</span>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label>植物名称 *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label>品种</label>
          <input
            type="text"
            value={form.variety}
            onChange={e => setForm(f => ({ ...f, variety: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label>摆放位置</label>
          <select
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
          >
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>浇水周期（天）</label>
            <input
              type="number"
              min={1}
              value={form.waterCycleDays}
              onChange={e => setForm(f => ({ ...f, waterCycleDays: Number(e.target.value) || 1 }))}
            />
          </div>
          <div className="form-group">
            <label>施肥周期（天）</label>
            <input
              type="number"
              min={1}
              value={form.fertilizeCycleDays}
              onChange={e => setForm(f => ({ ...f, fertilizeCycleDays: Number(e.target.value) || 1 }))}
            />
          </div>
        </div>

        <div className="form-group">
          <label>光照偏好</label>
          <select
            value={form.lightPreference}
            onChange={e => setForm(f => ({ ...f, lightPreference: e.target.value as LightPreference }))}
          >
            {Object.entries(LIGHT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>下次换盆日期</label>
          <input
            type="date"
            value={form.repotDate}
            onChange={e => setForm(f => ({ ...f, repotDate: e.target.value }))}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            ✓ 保存修改
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/plant/${id}`)}>
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
