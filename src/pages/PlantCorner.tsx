import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { loadPlants, getPlantStatus, checkLightMismatch } from '../utils/storage'
import { Plant, PlantStatus } from '../types'
import { differenceInDays, parseISO, format } from 'date-fns'

const STATUS_CONFIG: Record<PlantStatus, { label: string; icon: string; className: string }> = {
  healthy: { label: '状态良好', icon: '✨', className: 'badge-healthy' },
  needs_water: { label: '需要浇水', icon: '💧', className: 'badge-water' },
  needs_fertilizer: { label: '需要施肥', icon: '🧪', className: 'badge-fertilize' },
  low_light: { label: '光照不足', icon: '☀️', className: 'badge-warning' },
  needs_repot: { label: '即将换盆', icon: '🏺', className: 'badge-repot' },
}

function PlantCard({ plant }: { plant: Plant }) {
  const statuses = useMemo(() => getPlantStatus(plant), [plant])
  const lightMismatch = useMemo(() => checkLightMismatch(plant), [plant])
  const allStatuses = useMemo(() => {
    const s = [...statuses]
    if (lightMismatch) {
      const idx = s.indexOf('healthy')
      if (idx !== -1) s.splice(idx, 1)
      if (!s.includes('low_light')) s.push('low_light')
    }
    return s
  }, [statuses, lightMismatch])

  const daysSinceWater = differenceInDays(new Date(), parseISO(plant.lastWateredDate))
  const daysSinceFertilize = differenceInDays(new Date(), parseISO(plant.lastFertilizedDate))

  return (
    <Link to={`/plant/${plant.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{ cursor: 'pointer' }}>
        <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
          {plant.photo ? (
            <img
              src={plant.photo}
              alt={plant.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--green-100), var(--green-200))',
              fontSize: 48,
            }}>
              🌱
            </div>
          )}
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            {allStatuses.map(s => {
              const cfg = STATUS_CONFIG[s]
              return (
                <span key={s} className={`badge ${cfg.className}`}>
                  {cfg.icon} {cfg.label}
                </span>
              )
            })}
          </div>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--gray-800)', marginBottom: 2 }}>
            {plant.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8 }}>
            {plant.variety} · {plant.location}
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--gray-500)' }}>
            <span>💧 {daysSinceWater}天前浇水</span>
            <span>🧪 {daysSinceFertilize}天前施肥</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function PlantCorner() {
  const plants = useMemo(() => loadPlants(), [])

  const summary = useMemo(() => {
    let needWater = 0
    let needFertilize = 0
    let needLight = 0
    let needRepot = 0
    plants.forEach(p => {
      const s = getPlantStatus(p)
      const lm = checkLightMismatch(p)
      if (s.includes('needs_water')) needWater++
      if (s.includes('needs_fertilizer')) needFertilize++
      if (lm) needLight++
      if (s.includes('needs_repot')) needRepot++
    })
    return { needWater, needFertilize, needLight, needRepot }
  }, [plants])

  if (plants.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">🌿</div>
        <h3>你的植物角还是空的</h3>
        <p>添加第一盆绿植，开始你的养护之旅吧</p>
        <Link to="/add" className="btn btn-primary">+ 添加植物</Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="page-title">🏠 我的植物角</h2>

      {(summary.needWater + summary.needFertilize + summary.needLight + summary.needRepot > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}>
          {summary.needWater > 0 && (
            <div style={{ background: 'var(--blue-50)', borderRadius: 'var(--radius)', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 28 }}>💧</div>
              <div style={{ fontWeight: 700, color: 'var(--blue-500)', fontSize: 24 }}>{summary.needWater}</div>
              <div style={{ fontSize: 12, color: 'var(--blue-400)' }}>待浇水</div>
            </div>
          )}
          {summary.needFertilize > 0 && (
            <div style={{ background: 'var(--purple-50)', borderRadius: 'var(--radius)', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 28 }}>🧪</div>
              <div style={{ fontWeight: 700, color: 'var(--purple-500)', fontSize: 24 }}>{summary.needFertilize}</div>
              <div style={{ fontSize: 12, color: 'var(--purple-400)' }}>待施肥</div>
            </div>
          )}
          {summary.needLight > 0 && (
            <div style={{ background: 'var(--amber-50)', borderRadius: 'var(--radius)', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 28 }}>☀️</div>
              <div style={{ fontWeight: 700, color: 'var(--amber-600)', fontSize: 24 }}>{summary.needLight}</div>
              <div style={{ fontSize: 12, color: 'var(--amber-500)' }}>光照不足</div>
            </div>
          )}
          {summary.needRepot > 0 && (
            <div style={{ background: 'var(--amber-50)', borderRadius: 'var(--radius)', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 28 }}>🏺</div>
              <div style={{ fontWeight: 700, color: 'var(--amber-600)', fontSize: 24 }}>{summary.needRepot}</div>
              <div style={{ fontSize: 12, color: 'var(--amber-500)' }}>即将换盆</div>
            </div>
          )}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
      }}>
        {plants.map(plant => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>
    </div>
  )
}
