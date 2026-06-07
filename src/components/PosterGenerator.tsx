import { useRef, useCallback } from 'react'
import { Dream, ATMOSPHERE_LABELS } from '../types'
import { ATMOSPHERE_STYLES } from '../atmosphere'

interface PosterGeneratorProps {
  dream: Dream
}

export default function PosterGenerator({ dream }: PosterGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const style = ATMOSPHERE_STYLES[dream.atmosphere]
  const date = new Date(dream.createdAt)
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

  const generatePoster = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = 800
    const h = 1120
    canvas.width = w
    canvas.height = h

    const gradient = ctx.createLinearGradient(0, 0, w, h)
    gradient.addColorStop(0, '#0d0d14')
    gradient.addColorStop(0.5, '#1a1a2a')
    gradient.addColorStop(1, '#0d0d14')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    ctx.fillStyle = style.glow
    ctx.beginPath()
    ctx.arc(w / 2, 280, 200, 0, Math.PI * 2)
    ctx.fill()

    ctx.font = "80px 'DM Sans', sans-serif"
    ctx.fillStyle = style.text
    ctx.textAlign = 'center'
    ctx.fillText(style.emoji, w / 2, 300)

    ctx.font = "bold 14px 'DM Sans', sans-serif"
    ctx.fillStyle = style.border
    ctx.letterSpacing = '4px'
    ctx.fillText(ATMOSPHERE_LABELS[dream.atmosphere].toUpperCase(), w / 2, 370)

    ctx.font = "bold 32px 'DM Sans', sans-serif"
    ctx.fillStyle = '#e8e6f0'
    ctx.fillText(dream.title, w / 2, 440)

    ctx.font = "500 16px 'DM Sans', sans-serif"
    ctx.fillStyle = '#9a96a8'
    ctx.fillText(dateStr, w / 2, 480)

    ctx.strokeStyle = 'rgba(124, 111, 240, 0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(100, 520)
    ctx.lineTo(700, 520)
    ctx.stroke()

    const textX = 100
    const maxWidth = 600
    let textY = 570
    ctx.font = "400 18px 'DM Sans', sans-serif"
    ctx.fillStyle = '#c0c0d0'
    ctx.textAlign = 'left'

    dream.fragments.forEach((fragment) => {
      const words = fragment.split('')
      let line = ''
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i]
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && line.length > 0) {
          ctx.fillText(line, textX, textY)
          line = words[i]
          textY += 30
        } else {
          line = testLine
        }
      }
      if (line) {
        ctx.fillText(line, textX, textY)
        textY += 30
      }
      textY += 10
    })

    if (dream.tags.length > 0) {
      textY += 20
      ctx.strokeStyle = 'rgba(124, 111, 240, 0.2)'
      ctx.beginPath()
      ctx.moveTo(100, textY)
      ctx.lineTo(700, textY)
      ctx.stroke()
      textY += 40

      ctx.font = "600 13px 'DM Sans', sans-serif"
      const tagColors: Record<string, string> = {
        person: '#e74c3c',
        place: '#3498db',
        object: '#2ecc71',
      }
      let tagX = 100
      dream.tags.forEach((tag) => {
        const label = `#${tag.value}`
        const tagWidth = ctx.measureText(label).width + 20
        ctx.fillStyle = tagColors[tag.type] || '#7c6ff0'
        ctx.globalAlpha = 0.8
        ctx.fillText(label, tagX, textY)
        ctx.globalAlpha = 1
        tagX += tagWidth + 16
        if (tagX > 650) {
          tagX = 100
          textY += 30
        }
      })
    }

    ctx.font = "500 12px 'DM Sans', sans-serif"
    ctx.fillStyle = '#5e5a6e'
    ctx.textAlign = 'center'
    ctx.fillText('🌙 梦境博物馆 · Dream Museum', w / 2, h - 40)

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dream-${dream.id}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [dream, style, dateStr])

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '12px' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button className="btn-secondary" onClick={generatePoster}>
        🖼️ 生成梦境海报
      </button>
    </div>
  )
}
