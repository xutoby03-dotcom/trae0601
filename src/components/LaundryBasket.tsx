import { useState, useEffect, useCallback } from 'react'
import { db } from '../db'
import { ClothingItem, WashStatus, CATEGORY_LABELS, COLOR_LABELS, WASH_STATUS_LABELS, COLOR_HEX } from '../types'

type Props = {
  onRefresh?: () => void
}

export default function LaundryBasket({ onRefresh }: Props) {
  const [items, setItems] = useState<ClothingItem[]>([])

  const loadItems = useCallback(() => {
    setItems(db.getLaundryItems())
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleMarkClean = async (id: string) => {
    db.markAsClean(id)
    loadItems()
    onRefresh?.()
  }

  const handleMarkWashing = async (item: ClothingItem) => {
    db.updateClothing({ ...item, washStatus: 'washing' as WashStatus })
    loadItems()
    onRefresh?.()
  }

  const needsWashItems = items.filter(i => i.washStatus === 'needs_wash')
  const washingItems = items.filter(i => i.washStatus === 'washing')

  if (items.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIcon}>🧺</div>
        <div style={styles.emptyText}>洗衣篮是空的 🎉</div>
        <div style={styles.emptySubtext}>所有衣物都很干净</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <span style={styles.statNumber}>{items.length}</span>
          <span style={styles.statLabel}>待处理</span>
        </div>
        <div style={{ ...styles.statDivider, borderLeftColor: '#ef4444' }} />
        <div style={styles.statItem}>
          <span style={{ ...styles.statNumber, color: '#ef4444' }}>{needsWashItems.length}</span>
          <span style={styles.statLabel}>待洗</span>
        </div>
        <div style={{ ...styles.statDivider, borderLeftColor: '#3b82f6' }} />
        <div style={styles.statItem}>
          <span style={{ ...styles.statNumber, color: '#3b82f6' }}>{washingItems.length}</span>
          <span style={styles.statLabel}>洗涤中</span>
        </div>
      </div>

      {needsWashItems.length > 0 && (
        <div style={styles.section}>
          <div style={{ ...styles.sectionHeader, backgroundColor: '#fef2f2', borderBottomColor: '#ef4444' }}>
            <span style={{ ...styles.sectionDot, backgroundColor: '#ef4444' }} />
            <span style={{ ...styles.sectionTitle, color: '#dc2626' }}>待洗</span>
            <span style={{ ...styles.sectionCount, color: '#dc2626' }}>{needsWashItems.length}</span>
          </div>
          <div style={styles.grid}>
            {needsWashItems.map(item => (
              <ClothingCard
                key={item.id}
                item={item}
                onMarkClean={handleMarkClean}
                onMarkWashing={handleMarkWashing}
                showMarkWashing
              />
            ))}
          </div>
        </div>
      )}

      {washingItems.length > 0 && (
        <div style={styles.section}>
          <div style={{ ...styles.sectionHeader, backgroundColor: '#eff6ff', borderBottomColor: '#3b82f6' }}>
            <span style={{ ...styles.sectionDot, backgroundColor: '#3b82f6' }} />
            <span style={{ ...styles.sectionTitle, color: '#2563eb' }}>洗涤中</span>
            <span style={{ ...styles.sectionCount, color: '#2563eb' }}>{washingItems.length}</span>
          </div>
          <div style={styles.grid}>
            {washingItems.map(item => (
              <ClothingCard
                key={item.id}
                item={item}
                onMarkClean={handleMarkClean}
                onMarkWashing={handleMarkWashing}
                showMarkWashing={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface CardProps {
  item: ClothingItem
  onMarkClean: (id: string) => void
  onMarkWashing: (item: ClothingItem) => void
  showMarkWashing: boolean
}

function ClothingCard({ item, onMarkClean, onMarkWashing, showMarkWashing }: CardProps) {
  const colorHex = COLOR_HEX[item.color]
  const isGradient = item.color === 'multicolor'

  return (
    <div style={styles.card}>
      <div style={styles.cardThumbnail}>
        {item.photo ? (
          <img src={item.photo} alt={item.name} style={styles.cardImage} />
        ) : (
          <div
            style={{
              ...styles.cardPlaceholder,
              background: isGradient ? colorHex : colorHex,
            }}
          />
        )}
        <div style={styles.wearBadge}>本轮穿过 {item.currentWearCount} 次</div>
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardName}>{item.name}</div>
        <div style={styles.cardMeta}>
          <span style={styles.categoryTag}>{CATEGORY_LABELS[item.category]}</span>
          <span
            style={{
              ...styles.colorDot,
              background: isGradient ? colorHex : colorHex,
            }}
          />
          <span style={styles.colorLabel}>{COLOR_LABELS[item.color]}</span>
        </div>
      </div>
      <div style={styles.cardActions}>
        <button
          style={styles.cleanBtn}
          onClick={() => onMarkClean(item.id)}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#dcfce7')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f0fdf4')}
        >
          标记已洗
        </button>
        {showMarkWashing && (
          <button
            style={styles.washingBtn}
            onClick={() => onMarkWashing(item)}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#dbeafe')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#eff6ff')}
          >
            标记洗涤中
          </button>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: '16px 24px',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 500,
  },
  statDivider: {
    width: 0,
    height: 32,
    borderLeft: '1px solid #e5e7eb',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    borderRadius: '10px 10px 0 0',
    borderBottom: '2px solid',
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: 500,
    marginLeft: 4,
    opacity: 0.7,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: '0 0 10px 10px',
    border: '1px solid #f3f4f6',
    borderTop: 'none',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    transition: 'box-shadow 0.2s',
  },
  cardThumbnail: {
    position: 'relative',
    width: '100%',
    height: 140,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wearBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 6,
  },
  cardBody: {
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  cardName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1f2937',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: 500,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '2px 6px',
    borderRadius: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '1px solid #e5e7eb',
    flexShrink: 0,
  },
  colorLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  cardActions: {
    display: 'flex',
    gap: 6,
    padding: '8px 12px 12px',
  },
  cleanBtn: {
    flex: 1,
    padding: '6px 0',
    fontSize: 12,
    fontWeight: 600,
    color: '#16a34a',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  washingBtn: {
    flex: 1,
    padding: '6px 0',
    fontSize: 12,
    fontWeight: 600,
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
}
