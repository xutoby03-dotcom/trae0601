import { useEffect, useState } from 'react'
import { Dream, ATMOSPHERE_LABELS, Atmosphere } from '../types'
import { getAllDreams } from '../db'
import DreamCard from '../components/DreamCard'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const [dreams, setDreams] = useState<Dream[]>([])
  const [filterAtmo, setFilterAtmo] = useState<Atmosphere | 'all'>('all')
  const navigate = useNavigate()

  useEffect(() => {
    getAllDreams().then(setDreams)
  }, [])

  const filtered = filterAtmo === 'all' ? dreams : dreams.filter((d) => d.atmosphere === filterAtmo)

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
        <div>
          <h1 className="page-title">🏛️ 展厅走廊</h1>
          <p className="page-subtitle">每一段梦，都是一件独一无二的展品</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/new')}>
          ✨ 记录新梦
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setFilterAtmo('all')}
          style={{
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 600,
            background: filterAtmo === 'all' ? 'var(--accent)' : 'var(--bg-secondary)',
            color: filterAtmo === 'all' ? '#fff' : 'var(--text-secondary)',
            border: filterAtmo === 'all' ? 'none' : '1px solid var(--border)',
          }}
        >
          全部 ({dreams.length})
        </button>
        {(Object.entries(ATMOSPHERE_LABELS) as [Atmosphere, string][]).map(([key, label]) => {
          const count = dreams.filter((d) => d.atmosphere === key).length
          return (
            <button
              key={key}
              onClick={() => setFilterAtmo(key)}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: filterAtmo === key ? 'var(--accent)' : 'var(--bg-secondary)',
                color: filterAtmo === key ? '#fff' : 'var(--text-secondary)',
                border: filterAtmo === key ? 'none' : '1px solid var(--border)',
              }}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌙</div>
          <p>展厅空空如也，去记录你的第一个梦吧</p>
          <button className="btn-primary" onClick={() => navigate('/new')}>
            ✨ 开始记录
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {filtered.map((dream) => (
            <DreamCard key={dream.id} dream={dream} />
          ))}
        </div>
      )}
    </div>
  )
}
