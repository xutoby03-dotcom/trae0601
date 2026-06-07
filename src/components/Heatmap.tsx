import { useMemo } from 'react'
import { Dream } from '../types'

interface HeatmapProps {
  dreams: Dream[]
  year: number
  month: number
}

export default function Heatmap({ dreams, year, month }: HeatmapProps) {
  const cells = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate()
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
    const dreamCounts = new Map<number, number>()

    dreams.forEach((d) => {
      const date = new Date(d.createdAt)
      if (date.getFullYear() === year && date.getMonth() + 1 === month) {
        const day = date.getDate()
        dreamCounts.set(day, (dreamCounts.get(day) || 0) + 1)
      }
    })

    const maxCount = Math.max(...dreamCounts.values(), 1)
    const result: { day: number; count: number; intensity: number; dow: number }[] = []

    for (let d = 1; d <= daysInMonth; d++) {
      const dow = (firstDayOfWeek + d - 1) % 7
      const count = dreamCounts.get(d) || 0
      const intensity = count / maxCount
      result.push({ day: d, count, intensity, dow })
    }

    return result
  }, [dreams, year, month])

  const weekRows = useMemo(() => {
    const weeks: typeof cells[] = []
    let currentWeek: typeof cells = []
    cells.forEach((cell) => {
      if (currentWeek.length === 0 && cell.dow > 0) {
        for (let i = 0; i < cell.dow; i++) {
          currentWeek.push({ day: 0, count: 0, intensity: 0, dow: i })
        }
      }
      currentWeek.push(cell)
      if (cell.dow === 6) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ day: 0, count: 0, intensity: 0, dow: currentWeek.length })
      }
      weeks.push(currentWeek)
    }
    return weeks
  }, [cells])

  function getColor(intensity: number): string {
    if (intensity === 0) return 'var(--bg-secondary)'
    if (intensity < 0.25) return 'rgba(124, 111, 240, 0.2)'
    if (intensity < 0.5) return 'rgba(124, 111, 240, 0.4)'
    if (intensity < 0.75) return 'rgba(124, 111, 240, 0.6)'
    return 'rgba(124, 111, 240, 0.85)'
  }

  const dayLabels = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        padding: '24px',
      }}
    >
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🗓️ 月度梦境热力图
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>0</span>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(124,111,240,0.2)' }} />
          <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(124,111,240,0.4)' }} />
          <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(124,111,240,0.6)' }} />
          <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(124,111,240,0.85)' }} />
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>多</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '20px' }}>
          {dayLabels.map((label, i) => (
            <div
              key={i}
              style={{
                width: '16px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.55rem',
                color: 'var(--text-muted)',
              }}
            >
              {i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
          {weekRows.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {week[0] && week[0].day > 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '0.55rem',
                    color: 'var(--text-muted)',
                    height: '16px',
                    lineHeight: '16px',
                  }}
                >
                  {week[0].day}
                </div>
              )}
              {week[0] && week[0].day === 0 && <div style={{ height: '16px' }} />}
              {week.map((cell, di) => (
                <div
                  key={di}
                  title={cell.day > 0 ? `${month}月${cell.day}日: ${cell.count}条梦` : ''}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    background: cell.day > 0 ? getColor(cell.intensity) : 'transparent',
                    border: cell.day > 0 ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.55rem',
                    color: cell.intensity > 0.4 ? '#fff' : 'var(--text-muted)',
                    fontWeight: cell.count > 0 ? 600 : 400,
                    cursor: 'default',
                  }}
                >
                  {cell.day > 0 ? cell.day : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
