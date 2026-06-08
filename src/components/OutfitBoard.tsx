import { useState, useCallback } from 'react'
import { v4 } from 'uuid'
import { db } from '../db'
import { ClothingItem, ClothingCategory, Outfit, CATEGORY_LABELS, COLOR_HEX } from '../types'

const SLOT_CATEGORIES: ClothingCategory[] = ['tops', 'pants', 'outerwear', 'shoes', 'accessories']

interface SlotState {
  category: ClothingCategory
  item: ClothingItem | null
}

export default function OutfitBoard() {
  const [allClothes] = useState<ClothingItem[]>(() => db.getAllClothes())
  const [slots, setSlots] = useState<SlotState[]>(
    SLOT_CATEGORIES.map(cat => ({ category: cat, item: null }))
  )
  const [outfitName, setOutfitName] = useState('')
  const [outfitDate, setOutfitDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [dragOverSlot, setDragOverSlot] = useState<ClothingCategory | null>(null)

  const clothesByCategory = SLOT_CATEGORIES.reduce<Record<ClothingCategory, ClothingItem[]>>((acc, cat) => {
    acc[cat] = allClothes.filter(c => c.category === cat)
    return acc
  }, {} as Record<ClothingCategory, ClothingItem[]>)

  const handleDragStart = useCallback((e: React.DragEvent, item: ClothingItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, category: ClothingCategory) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverSlot(category)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverSlot(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, category: ClothingCategory) => {
    e.preventDefault()
    setDragOverSlot(null)
    try {
      const raw = e.dataTransfer.getData('application/json')
      const item: ClothingItem = JSON.parse(raw)
      if (item.category !== category) return
      setSlots(prev =>
        prev.map(s => (s.category === category ? { ...s, item } : s))
      )
    } catch { /* ignore invalid drop data */ }
  }, [])

  const removeSlotItem = useCallback((category: ClothingCategory) => {
    setSlots(prev =>
      prev.map(s => (s.category === category ? { ...s, item: null } : s))
    )
  }, [])

  const handleSave = useCallback(() => {
    const selectedItems = slots.filter(s => s.item).map(s => s.item!.id)
    if (selectedItems.length === 0) return
    const outfit: Outfit = {
      id: v4(),
      name: outfitName.trim() || '未命名穿搭',
      items: selectedItems,
      date: outfitDate,
      createdAt: new Date().toISOString(),
    }
    db.addOutfit(outfit)
    db.incrementWearCount(selectedItems)
    setSlots(SLOT_CATEGORIES.map(cat => ({ category: cat, item: null })))
    setOutfitName('')
  }, [slots, outfitName, outfitDate])

  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      height: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f0f2f5',
    },
    leftPanel: {
      width: 280,
      minWidth: 280,
      backgroundColor: '#fff',
      borderRight: '1px solid #e8e8e8',
      overflowY: 'auto',
      padding: 16,
    },
    categoryTitle: {
      fontSize: 13,
      fontWeight: 600,
      color: '#666',
      margin: '16px 0 8px',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    clothesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 8,
      marginBottom: 8,
    },
    clothesCard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 6,
      borderRadius: 8,
      backgroundColor: '#fafafa',
      border: '1px solid #eee',
      cursor: 'grab',
      transition: 'box-shadow 0.2s, transform 0.2s',
    },
    clothesThumb: {
      width: 64,
      height: 64,
      objectFit: 'cover' as const,
      borderRadius: 6,
      marginBottom: 4,
    },
    clothesName: {
      fontSize: 11,
      color: '#555',
      textAlign: 'center' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      width: '100%',
    },
    rightPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: 24,
      overflowY: 'auto',
    },
    boardTitle: {
      fontSize: 20,
      fontWeight: 700,
      color: '#1a1a2e',
      marginBottom: 20,
    },
    slotsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginBottom: 24,
    },
    slotLabel: {
      width: 56,
      fontSize: 13,
      fontWeight: 600,
      color: '#999',
      flexShrink: 0,
    },
    slotContent: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    slotPhoto: {
      width: 48,
      height: 48,
      objectFit: 'cover' as const,
      borderRadius: 8,
    },
    slotItemName: {
      fontSize: 14,
      color: '#333',
      fontWeight: 500,
    },
    slotEmpty: {
      fontSize: 13,
      color: '#bbb',
    },
    removeBtn: {
      position: 'absolute' as const,
      right: 8,
      top: 8,
      width: 22,
      height: 22,
      borderRadius: '50%',
      border: 'none',
      backgroundColor: '#ff4d4f',
      color: '#fff',
      fontSize: 12,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1,
    },
    bottomBar: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      backgroundColor: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    dateInput: {
      padding: '8px 12px',
      borderRadius: 8,
      border: '1px solid #d9d9d9',
      fontSize: 14,
      outline: 'none',
    },
    nameInput: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: 8,
      border: '1px solid #d9d9d9',
      fontSize: 14,
      outline: 'none',
    },
    saveBtn: {
      padding: '8px 24px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: '#1677ff',
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    colorDot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: 4,
      verticalAlign: 'middle',
    },
  }

  const slotStyle = (hasItem: boolean, isDragOver: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    minHeight: 72,
    borderRadius: 12,
    border: isDragOver
      ? '2px dashed #52c41a'
      : hasItem
        ? '2px solid #52c41a'
        : '2px dashed #d9d9d9',
    backgroundColor: isDragOver
      ? '#f6ffed'
      : hasItem
        ? '#f6ffed'
        : '#fafafa',
    padding: 12,
    transition: 'border-color 0.2s, background-color 0.2s',
    position: 'relative' as const,
    boxShadow: hasItem ? '0 2px 8px rgba(82,196,26,0.12)' : 'none',
  })

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        {SLOT_CATEGORIES.map(cat => (
          <div key={cat}>
            <div style={styles.categoryTitle}>{CATEGORY_LABELS[cat]}</div>
            <div style={styles.clothesGrid}>
              {clothesByCategory[cat].map(item => (
                <div
                  key={item.id}
                  style={styles.clothesCard}
                  draggable
                  onDragStart={e => handleDragStart(e, item)}
                >
                  <img src={item.photo} alt={item.name} style={styles.clothesThumb} />
                  <span style={styles.clothesName}>{item.name}</span>
                </div>
              ))}
              {clothesByCategory[cat].length === 0 && (
                <span style={{ fontSize: 12, color: '#ccc', gridColumn: '1 / -1' }}>暂无</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.boardTitle}>穿搭搭配板</div>
        <div style={styles.slotsContainer}>
          {slots.map(slot => (
            <div
              key={slot.category}
              style={slotStyle(!!slot.item, dragOverSlot === slot.category)}
              onDragOver={e => handleDragOver(e, slot.category)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, slot.category)}
            >
              <span style={styles.slotLabel}>{CATEGORY_LABELS[slot.category]}</span>
              <div style={styles.slotContent}>
                {slot.item ? (
                  <>
                    <img src={slot.item.photo} alt={slot.item.name} style={styles.slotPhoto} />
                    <span style={styles.slotItemName}>
                      <span
                        style={{
                          ...styles.colorDot,
                          backgroundColor:
                            slot.item.color === 'multicolor'
                              ? undefined
                              : COLOR_HEX[slot.item.color],
                          background:
                            slot.item.color === 'multicolor'
                              ? COLOR_HEX.multicolor
                              : undefined,
                        }}
                      />
                      {slot.item.name}
                    </span>
                  </>
                ) : (
                  <span style={styles.slotEmpty}>拖拽{CATEGORY_LABELS[slot.category]}到此处</span>
                )}
              </div>
              {slot.item && (
                <button style={styles.removeBtn} onClick={() => removeSlotItem(slot.category)}>
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={styles.bottomBar}>
          <input
            type="date"
            value={outfitDate}
            onChange={e => setOutfitDate(e.target.value)}
            style={styles.dateInput}
          />
          <input
            type="text"
            placeholder="穿搭名称"
            value={outfitName}
            onChange={e => setOutfitName(e.target.value)}
            style={styles.nameInput}
          />
          <button
            style={styles.saveBtn}
            onClick={handleSave}
            disabled={slots.every(s => !s.item)}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
