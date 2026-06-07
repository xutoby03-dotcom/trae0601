import { Dream, Atmosphere, ATMOSPHERE_LABELS } from '../types'
import { ATMOSPHERE_STYLES, getClipPath } from '../atmosphere'
import { useNavigate } from 'react-router-dom'

interface DreamCardProps {
  dream: Dream
}

export default function DreamCard({ dream }: DreamCardProps) {
  const navigate = useNavigate()
  const style = ATMOSPHERE_STYLES[dream.atmosphere]
  const date = new Date(dream.createdAt)
  const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`
  const clipPath = getClipPath(style.shape)

  return (
    <div
      className="dream-card fade-in"
      onClick={() => navigate(`/dream/${dream.id}`)}
      style={{
        background: style.card,
        clipPath,
        cursor: 'pointer',
        position: 'relative',
        padding: '28px 24px',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-6px) scale(1.02)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${style.glow}`
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          fontSize: '4rem',
          opacity: 0.15,
          filter: 'blur(2px)',
        }}
      >
        {style.emoji}
      </div>
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              fontSize: '1.2rem',
            }}
          >
            {style.emoji}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: style.text,
              opacity: 0.7,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {ATMOSPHERE_LABELS[dream.atmosphere]}
          </span>
        </div>
        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 600,
            color: style.text,
            marginBottom: '10px',
            lineHeight: 1.3,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {dream.title}
        </h3>
        {dream.fragments[0] && (
          <p
            style={{
              fontSize: '0.8rem',
              color: style.text,
              opacity: 0.6,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {dream.fragments[0]}
          </p>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {dream.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.12)',
                color: style.text,
                fontWeight: 500,
              }}
            >
              {tag.value}
            </span>
          ))}
          {dream.tags.length > 3 && (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)',
                color: style.text,
                opacity: 0.5,
              }}
            >
              +{dream.tags.length - 3}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            color: style.text,
            opacity: 0.4,
          }}
        >
          {dateStr}
        </span>
      </div>
    </div>
  )
}
