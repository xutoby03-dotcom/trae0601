import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Dream, ATMOSPHERE_LABELS, TAG_TYPE_LABELS } from '../types'
import { getDreamById, deleteDream, getAllDreams } from '../db'
import { ATMOSPHERE_STYLES } from '../atmosphere'
import TagNetwork from '../components/TagNetwork'
import PosterGenerator from '../components/PosterGenerator'

export default function DreamDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dream, setDream] = useState<Dream | null>(null)
  const [allDreams, setAllDreams] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([getDreamById(id), getAllDreams()]).then(([d, all]) => {
      setDream(d || null)
      setAllDreams(all)
      setLoading(false)
    })
  }, [id])

  async function handleDelete() {
    if (!dream) return
    if (!window.confirm('确定要将这段梦从博物馆中移除吗？')) return
    await deleteDream(dream.id)
    navigate('/')
  }

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⏳</div>
        <p>正在调取梦境...</p>
      </div>
    )
  }

  if (!dream) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🌫️</div>
        <p>这段梦似乎已经消散了...</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          返回展厅
        </button>
      </div>
    )
  }

  const style = ATMOSPHERE_STYLES[dream.atmosphere]
  const date = new Date(dream.createdAt)
  const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

  return (
    <div className="fade-in">
      <button
        className="btn-secondary"
        onClick={() => navigate('/')}
        style={{ marginBottom: '24px' }}
      >
        ← 返回展厅
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        <div>
          <div
            style={{
              background: style.card,
              borderRadius: 'var(--radius)',
              padding: '36px',
              marginBottom: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                fontSize: '6rem',
                opacity: 0.08,
              }}
            >
              {style.emoji}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.4rem' }}>{style.emoji}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: style.text,
                  opacity: 0.7,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                }}
              >
                {ATMOSPHERE_LABELS[dream.atmosphere]}
              </span>
            </div>

            <h1
              style={{
                fontSize: '1.8rem',
                fontFamily: "'Playfair Display', serif",
                color: style.text,
                marginBottom: '8px',
                lineHeight: 1.3,
              }}
            >
              {dream.title}
            </h1>

            <p
              style={{
                fontSize: '0.8rem',
                color: style.text,
                opacity: 0.5,
                marginBottom: '28px',
              }}
            >
              {dateStr}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dream.fragments.map((frag, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: style.text,
                      opacity: 0.35,
                      marginBottom: '6px',
                      fontWeight: 600,
                      letterSpacing: '1px',
                    }}
                  >
                    碎片 #{i + 1}
                  </div>
                  <p
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: 1.8,
                      color: style.text,
                      opacity: 0.85,
                    }}
                  >
                    {frag}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {dream.tags.length > 0 && (
            <div
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                🏷️ 梦境标签
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {dream.tags.map((tag, i) => (
                  <span key={i} className={`tag tag-${tag.type}`}>
                    {TAG_TYPE_LABELS[tag.type]}: {tag.value}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <PosterGenerator dream={dream} />
            <button className="btn-danger" onClick={handleDelete}>
              🗑️ 删除梦境
            </button>
          </div>
        </div>

        <div>
          <TagNetwork dreams={allDreams} currentDream={dream} />
        </div>
      </div>
    </div>
  )
}
