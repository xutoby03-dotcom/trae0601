import { useState, useRef } from 'react'
import { v4 } from 'uuid'
import { db } from '../db'
import { ClothingItem, ClothingCategory, ClothingColor, Season, Thickness, Occasion, WashStatus, CATEGORY_LABELS, COLOR_LABELS, SEASON_LABELS, THICKNESS_LABELS, OCCASION_LABELS, WASH_STATUS_LABELS, COLOR_HEX } from '../types'

interface ClothingFormProps {
  item?: ClothingItem | null
  onSave: () => void
  onCancel?: () => void
}

const CATEGORIES: ClothingCategory[] = ['tops', 'pants', 'outerwear', 'shoes', 'accessories']
const COLORS: ClothingColor[] = ['black', 'white', 'gray', 'red', 'orange', 'yellow', 'green', 'blue', 'navy', 'purple', 'pink', 'brown', 'beige', 'khaki', 'denim', 'multicolor']
const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter', 'all']
const THICKNESSES: Thickness[] = ['thin', 'medium', 'thick']
const OCCASIONS: Occasion[] = ['casual', 'work', 'formal', 'sport', 'date', 'party']
const WASH_STATUSES: WashStatus[] = ['clean', 'worn_once', 'worn_twice', 'needs_wash', 'washing']

export default function ClothingForm({ item, onSave, onCancel }: ClothingFormProps) {
  const editingItem = item
  const [name, setName] = useState(editingItem?.name ?? '')
  const [photo, setPhoto] = useState(editingItem?.photo ?? '')
  const [category, setCategory] = useState<ClothingCategory>(editingItem?.category ?? 'tops')
  const [color, setColor] = useState<ClothingColor>(editingItem?.color ?? 'black')
  const [seasons, setSeasons] = useState<Season[]>(editingItem?.season ?? ['all'])
  const [thickness, setThickness] = useState<Thickness>(editingItem?.thickness ?? 'medium')
  const [occasions, setOccasions] = useState<Occasion[]>(editingItem?.occasion ?? ['casual'])
  const [price, setPrice] = useState(editingItem?.price ?? 0)
  const [washStatus, setWashStatus] = useState<WashStatus>(editingItem?.washStatus ?? 'clean')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const toggleSeason = (s: Season) => {
    setSeasons(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const toggleOccasion = (o: Occasion) => {
    setOccasions(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o])
  }

  const handleSave = () => {
    if (!name.trim()) return
    const data: ClothingItem = {
      id: editingItem?.id ?? v4(),
      name: name.trim(),
      photo,
      category,
      color,
      season: seasons,
      thickness,
      occasion: occasions,
      price,
      washStatus,
      wearCount: editingItem?.wearCount ?? 0,
      createdAt: editingItem?.createdAt ?? new Date().toISOString(),
    }
    if (editingItem) {
      db.updateClothing(data)
    } else {
      db.addClothing(data)
    }
    onSave()
  }

  const modal: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxWidth: 520,
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    padding: '28px 24px',
  }

  const header: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: 24,
    textAlign: 'center',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#555',
    marginBottom: 6,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    backgroundColor: '#f7f7f8',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const fieldGroup: React.CSSProperties = {
    marginBottom: 18,
  }

  const pillsRow: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  }

  const pill = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    cursor: 'pointer',
    border: active ? '1.5px solid #4f46e5' : '1px solid #ddd',
    backgroundColor: active ? '#eef2ff' : '#f7f7f8',
    color: active ? '#4f46e5' : '#666',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
    userSelect: 'none',
  })

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    backgroundColor: '#f7f7f8',
    fontSize: 14,
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  }

  const photoArea: React.CSSProperties = {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f0f0f2',
    border: '2px dashed #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    margin: '0 auto 8px',
    transition: 'border-color 0.2s',
  }

  const btnPrimary: React.CSSProperties = {
    flex: 1,
    padding: '12px 0',
    borderRadius: 10,
    border: 'none',
    backgroundColor: '#4f46e5',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  }

  const btnSecondary: React.CSSProperties = {
    flex: 1,
    padding: '12px 0',
    borderRadius: 10,
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    color: '#666',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  }

  const colorDot = (hex: string): React.CSSProperties => ({
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: hex,
    border: '2px solid #fff',
    boxShadow: '0 0 0 1px #ccc',
    display: 'inline-block',
    marginRight: 6,
    verticalAlign: 'middle',
    flexShrink: 0,
  })

  const colorOption: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 13,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid #ddd',
    backgroundColor: '#f7f7f8',
    transition: 'all 0.15s',
    userSelect: 'none',
  }

  const colorOptionActive: React.CSSProperties = {
    ...colorOption,
    border: '1.5px solid #4f46e5',
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    fontWeight: 600,
  }

  const selectWrapper: React.CSSProperties = {
    position: 'relative',
  }

  const chevron: React.CSSProperties = {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    fontSize: 12,
    color: '#999',
  }

  return (
    <div style={modal}>
      <div style={header}>{editingItem ? '编辑衣服' : '添加衣服'}</div>

      <div style={fieldGroup}>
        <label style={labelStyle}>名称</label>
        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="请输入衣服名称" />
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>照片</label>
        <div style={photoArea} onClick={() => fileRef.current?.click()}>
          {photo ? (
            <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#aaa', fontSize: 13 }}>点击上传</span>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>分类</label>
        <div style={pillsRow}>
          {CATEGORIES.map(c => (
            <span key={c} style={pill(category === c)} onClick={() => setCategory(c)}>
              {CATEGORY_LABELS[c]}
            </span>
          ))}
        </div>
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>颜色</label>
        <div style={{ ...pillsRow, gap: 6 }}>
          {COLORS.map(c => (
            <span key={c} style={color === c ? colorOptionActive : colorOption} onClick={() => setColor(c)}>
              <span style={colorDot(COLOR_HEX[c])} />
              {COLOR_LABELS[c]}
            </span>
          ))}
        </div>
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>季节</label>
        <div style={pillsRow}>
          {SEASONS.map(s => (
            <span key={s} style={pill(seasons.includes(s))} onClick={() => toggleSeason(s)}>
              {SEASON_LABELS[s]}
            </span>
          ))}
        </div>
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>厚度</label>
        <div style={pillsRow}>
          {THICKNESSES.map(t => (
            <span key={t} style={pill(thickness === t)} onClick={() => setThickness(t)}>
              {THICKNESS_LABELS[t]}
            </span>
          ))}
        </div>
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>场合</label>
        <div style={pillsRow}>
          {OCCASIONS.map(o => (
            <span key={o} style={pill(occasions.includes(o))} onClick={() => toggleOccasion(o)}>
              {OCCASION_LABELS[o]}
            </span>
          ))}
        </div>
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>价格（元）</label>
        <input style={inputStyle} type="number" min={0} value={price} onChange={e => setPrice(Number(e.target.value))} placeholder="0" />
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>洗涤状态</label>
        <div style={selectWrapper}>
          <select style={selectStyle} value={washStatus} onChange={e => setWashStatus(e.target.value as WashStatus)}>
            {WASH_STATUSES.map(w => (
              <option key={w} value={w}>{WASH_STATUS_LABELS[w]}</option>
            ))}
          </select>
          <span style={chevron}>▼</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        {onCancel && <button style={btnSecondary} onClick={onCancel}>取消</button>}
        <button style={btnPrimary} onClick={handleSave}>保存</button>
      </div>
    </div>
  )
}
