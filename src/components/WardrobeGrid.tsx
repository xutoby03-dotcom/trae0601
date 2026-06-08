import { useState, useMemo } from 'react'
import { db } from '../db'
import { ClothingItem, ClothingCategory, ClothingColor, Season, Occasion, CATEGORY_LABELS, COLOR_LABELS, SEASON_LABELS, OCCASION_LABELS, WASH_STATUS_LABELS, COLOR_HEX } from '../types'
import ClothingForm from './ClothingForm'

const CATEGORIES: ClothingCategory[] = ['tops', 'pants', 'outerwear', 'shoes', 'accessories']

const WASH_DOT_COLOR: Record<string, string> = {
  clean: '#4caf50',
  worn_once: '#ff9800',
  worn_twice: '#ff9800',
  needs_wash: '#f44336',
  washing: '#2196f3',
}

interface FilterState {
  category: ClothingCategory | ''
  color: ClothingColor | ''
  season: Season | ''
  occasion: Occasion | ''
}

export default function WardrobeGrid() {
  const [items, setItems] = useState<ClothingItem[]>(() => db.getAllClothes())
  const [filter, setFilter] = useState<FilterState>({ category: '', color: '', season: '', occasion: '' })
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filter.category && item.category !== filter.category) return false
      if (filter.color && item.color !== filter.color) return false
      if (filter.season && !item.season.includes(filter.season as Season)) return false
      if (filter.occasion && !item.occasion.includes(filter.occasion as Occasion)) return false
      return true
    })
  }, [items, filter])

  const grouped = useMemo(() => {
    const map: Record<string, ClothingItem[]> = {}
    CATEGORIES.forEach(cat => { map[cat] = [] })
    filteredItems.forEach(item => {
      if (map[item.category]) {
        map[item.category].push(item)
      }
    })
    return map
  }, [filteredItems])

  const refresh = () => setItems(db.getAllClothes())

  const handleSave = () => {
    setEditingItem(null)
    setShowAddForm(false)
    refresh()
  }

  const toggleCollapse = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilter(prev => ({ ...prev, [key]: prev[key] === value ? '' : value as any }))
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const renderPill = (label: string, active: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 20,
        border: `1.5px solid ${active ? '#6366f1' : '#e0e0e0'}`,
        background: active ? '#6366f1' : '#fff',
        color: active ? '#fff' : '#555',
        fontSize: 13,
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )

  const renderCard = (item: ClothingItem) => (
    <div
      key={item.id}
      draggable
      onDragStart={(e) => handleDragStart(e, item.id)}
      onClick={() => setEditingItem(item)}
      style={{
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{
        width: '100%',
        aspectRatio: '3/4',
        background: item.photo ? `url(${item.photo}) center/cover` : (COLOR_HEX[item.color] || '#ccc'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {!item.photo && (
          <span style={{ color: '#fff', fontSize: 28, fontWeight: 600, opacity: 0.7 }}>
            {item.name.charAt(0)}
          </span>
        )}
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <span title={WASH_STATUS_LABELS[item.washStatus]} style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: WASH_DOT_COLOR[item.washStatus] || '#999',
            border: '2px solid #fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: COLOR_HEX[item.color],
          flexShrink: 0,
          border: '1px solid #eee',
        }} />
        <span style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#333',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {item.name}
        </span>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '20px 24px', position: 'relative', minHeight: '100vh', background: '#f8f9fb' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, color: '#888', marginRight: 4 }}>分类:</span>
        {CATEGORIES.map(cat => renderPill(
          CATEGORY_LABELS[cat],
          filter.category === cat,
          () => updateFilter('category', cat),
        ))}
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, color: '#888', marginRight: 4 }}>颜色:</span>
        {(Object.keys(COLOR_LABELS) as ClothingColor[]).map(c => renderPill(
          COLOR_LABELS[c],
          filter.color === c,
          () => updateFilter('color', c),
        ))}
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, color: '#888', marginRight: 4 }}>季节:</span>
        {(Object.keys(SEASON_LABELS) as Season[]).map(s => renderPill(
          SEASON_LABELS[s],
          filter.season === s,
          () => updateFilter('season', s),
        ))}
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, color: '#888', marginRight: 4 }}>场合:</span>
        {(Object.keys(OCCASION_LABELS) as Occasion[]).map(o => renderPill(
          OCCASION_LABELS[o],
          filter.occasion === o,
          () => updateFilter('occasion', o),
        ))}
      </div>

      {CATEGORIES.map(cat => {
        const catItems = grouped[cat]
        if (filter.category && filter.category !== cat) return null
        const isCollapsed = collapsed[cat]
        return (
          <div key={cat} style={{ marginBottom: 28 }}>
            <div
              onClick={() => toggleCollapse(cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                padding: '10px 0',
                borderBottom: '2px solid #e8e8e8',
                marginBottom: isCollapsed ? 0 : 16,
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#333',
                }}>
                  {CATEGORY_LABELS[cat]}
                </span>
                <span style={{
                  fontSize: 13,
                  color: '#999',
                  background: '#f0f0f0',
                  borderRadius: 12,
                  padding: '2px 10px',
                }}>
                  {catItems.length}
                </span>
              </div>
              <span style={{
                fontSize: 14,
                color: '#aaa',
                transition: 'transform 0.2s',
                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                display: 'inline-block',
              }}>
                ▼
              </span>
            </div>
            {!isCollapsed && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 16,
              }}>
                {catItems.map(renderCard)}
                {catItems.length === 0 && (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '32px 0',
                    color: '#bbb',
                    fontSize: 14,
                  }}>
                    暂无衣物
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      <button
        onClick={() => setShowAddForm(true)}
        style={{
          position: 'fixed',
          right: 32,
          bottom: 32,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#6366f1',
          color: '#fff',
          fontSize: 28,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
          zIndex: 100,
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.transform = 'scale(1.1)'
          el.style.boxShadow = '0 6px 24px rgba(99,102,241,0.5)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.transform = 'scale(1)'
          el.style.boxShadow = '0 4px 16px rgba(99,102,241,0.4)'
        }}
      >
        +
      </button>

      {(showAddForm || editingItem) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddForm(false)
              setEditingItem(null)
            }
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 28,
            maxWidth: 520,
            width: '90%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <ClothingForm
              item={editingItem}
              onSave={handleSave}
              onCancel={() => { setShowAddForm(false); setEditingItem(null) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
