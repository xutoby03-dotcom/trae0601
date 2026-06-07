import { useEffect, useState, useMemo } from 'react'
import { Dream, ATMOSPHERE_LABELS, Atmosphere, TAG_TYPE_LABELS, DreamTag } from '../types'
import { getAllDreams } from '../db'
import Heatmap from '../components/Heatmap'

export default function Stats() {
  const [dreams, setDreams] = useState<Dream[]>([])
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    getAllDreams().then(setDreams)
  }, [])

  const atmosphereStats = useMemo(() => {
    const counts: Record<string, number> = {}
    dreams.forEach((d) => {
      counts[d.atmosphere] = (counts[d.atmosphere] || 0) + 1
    })
    return (Object.entries(ATMOSPHERE_LABELS) as [Atmosphere, string][]).map(
      ([key, label]) => ({
        key,
        label,
        count: counts[key] || 0,
      })
    )
  }, [dreams])

  const maxAtmoCount = Math.max(...atmosphereStats.map((s) => s.count), 1)

  const tagRanking = useMemo(() => {
    const tagCounts = new Map<string, { type: DreamTag['type']; value: string; count: number }>()
    dreams.forEach((d) => {
      d.tags.forEach((t) => {
        const key = `${t.type}:${t.value}`
        const existing = tagCounts.get(key)
        if (existing) {
          existing.count++
        } else {
          tagCounts.set(key, { type: t.type, value: t.value, count: 1 })
        }
      })
    })
    return Array.from(tagCounts.values()).sort((a, b) => b.count - a.count).slice(0, 15)
  }, [dreams])

  const maxTagCount = Math.max(...tagRanking.map((t) => t.count), 1)

  const monthRange = useMemo(() => {
    if (dreams.length === 0) return { minYear: viewYear, maxYear: viewYear }
    const dates = dreams.map((d) => new Date(d.createdAt))
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))
    return { minYear: minDate.getFullYear(), maxYear: maxDate.getFullYear() }
  }, [dreams, viewYear])

  return (
    <div className="fade-in">
      <h1 className="page-title">📊 梦境统计</h1>
      <p className="page-subtitle">窥探潜意识中的规律</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: '24px',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '20px' }}>
            🎭 梦境氛围分布
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {atmosphereStats.map((stat) => {
              const pct = (stat.count / maxAtmoCount) * 100
              const colors: Record<string, string> = {
                absurd: '#9b59b6',
                warm: '#d4a574',
                fear: '#4a4a6a',
                flying: '#87ceeb',
                lost: '#8fbc8f',
              }
              return (
                <div key={stat.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      {ATMOSPHERE_LABELS[stat.key as Atmosphere]}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {stat.count} 次
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '4px',
                      background: 'var(--bg-primary)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        borderRadius: '4px',
                        background: colors[stat.key] || 'var(--accent)',
                        transition: 'width 0.6s ease',
                        minWidth: stat.count > 0 ? '8px' : '0',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: '24px',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '20px' }}>
            🏆 高频梦境元素
          </div>
          {tagRanking.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px' }}>
              还没有标签数据
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tagRanking.map((tag, i) => {
                const pct = (tag.count / maxTagCount) * 100
                const typeColors: Record<string, string> = {
                  person: '#e74c3c',
                  place: '#3498db',
                  object: '#2ecc71',
                }
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: i < 3 ? 'var(--accent)' : 'var(--bg-primary)',
                        color: i < 3 ? '#fff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-primary)',
                        minWidth: '60px',
                      }}
                    >
                      {tag.value}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: '6px',
                        borderRadius: '3px',
                        background: 'var(--bg-primary)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          borderRadius: '3px',
                          background: typeColors[tag.type] || 'var(--accent)',
                          transition: 'width 0.6s ease',
                          minWidth: tag.count > 0 ? '6px' : '0',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        minWidth: '30px',
                        textAlign: 'right',
                      }}
                    >
                      {tag.count}次
                    </span>
                    <span
                      className={`tag tag-${tag.type}`}
                      style={{ fontSize: '0.6rem', padding: '2px 6px' }}
                    >
                      {TAG_TYPE_LABELS[tag.type]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn-secondary"
          onClick={() => {
            if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1) }
            else setViewMonth(viewMonth - 1)
          }}
          style={{ padding: '6px 12px' }}
        >
          ←
        </button>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {viewYear}年{viewMonth}月
        </span>
        <button
          className="btn-secondary"
          onClick={() => {
            if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1) }
            else setViewMonth(viewMonth + 1)
          }}
          style={{ padding: '6px 12px' }}
        >
          →
        </button>
      </div>

      <Heatmap dreams={dreams} year={viewYear} month={viewMonth} />

      <div
        style={{
          marginTop: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', fontFamily: "'Playfair Display', serif" }}>
            {dreams.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            总梦境数
          </div>
        </div>
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e74c3c', fontFamily: "'Playfair Display', serif" }}>
            {new Set(dreams.flatMap((d) => d.tags.filter((t) => t.type === 'person').map((t) => t.value))).size}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            梦中出现的人物
          </div>
        </div>
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3498db', fontFamily: "'Playfair Display', serif" }}>
            {new Set(dreams.flatMap((d) => d.tags.filter((t) => t.type === 'place').map((t) => t.value))).size}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            梦中的地点
          </div>
        </div>
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2ecc71', fontFamily: "'Playfair Display', serif" }}>
            {new Set(dreams.flatMap((d) => d.tags.filter((t) => t.type === 'object').map((t) => t.value))).size}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            梦中的物件
          </div>
        </div>
      </div>
    </div>
  )
}
