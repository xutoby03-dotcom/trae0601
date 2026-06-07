import { useEffect, useRef, useCallback } from 'react'
import { Dream } from '../types'

interface TagNetworkProps {
  dreams: Dream[]
  currentDream?: Dream
}

interface Node {
  id: string
  label: string
  type: 'person' | 'place' | 'object' | 'dream'
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  count: number
}

interface Edge {
  source: string
  target: string
}

export default function TagNetwork({ dreams, currentDream }: TagNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const edgesRef = useRef<Edge[]>([])
  const animRef = useRef<number>(0)

  const buildGraph = useCallback(() => {
    const tagMap = new Map<string, { type: 'person' | 'place' | 'object'; count: number }>()
    const dreamNodes: Node[] = []
    const tagNodes: Node[] = []
    const edges: Edge[] = []

    const relevantDreams = currentDream
      ? dreams.filter(
          (d) =>
            d.id === currentDream.id ||
            d.tags.some((t) => currentDream.tags.some((ct) => ct.value === t.value))
        )
      : dreams.slice(0, 20)

    relevantDreams.forEach((dream) => {
      const angle = Math.random() * Math.PI * 2
      const dist = 100 + Math.random() * 60
      dreamNodes.push({
        id: `dream-${dream.id}`,
        label: dream.title,
        type: 'dream',
        x: 200 + Math.cos(angle) * dist,
        y: 180 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: 8,
        count: 1,
      })
    })

    relevantDreams.forEach((dream) => {
      dream.tags.forEach((tag) => {
        const key = `${tag.type}:${tag.value}`
        if (!tagMap.has(key)) {
          tagMap.set(key, { type: tag.type, count: 0 })
        }
        tagMap.get(key)!.count++
      })
    })

    const centerX = 200
    const centerY = 180
    let idx = 0
    tagMap.forEach((info, key) => {
      const [type, ...rest] = key.split(':')
      const value = rest.join(':')
      const angle = (idx / tagMap.size) * Math.PI * 2
      const dist = 60 + info.count * 15
      tagNodes.push({
        id: key,
        label: value,
        type: type as 'person' | 'place' | 'object',
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: 6 + info.count * 3,
        count: info.count,
      })
      idx++
    })

    relevantDreams.forEach((dream) => {
      dream.tags.forEach((tag) => {
        const key = `${tag.type}:${tag.value}`
        edges.push({
          source: `dream-${dream.id}`,
          target: key,
        })
      })
    })

    nodesRef.current = [...dreamNodes, ...tagNodes]
    edgesRef.current = edges
  }, [dreams, currentDream])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = 400
    const height = 360
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    buildGraph()

    const nodes = nodesRef.current
    const edges = edgesRef.current
    const centerX = width / 2
    const centerY = height / 2

    const typeColors: Record<string, string> = {
      person: '#e74c3c',
      place: '#3498db',
      object: '#2ecc71',
      dream: '#7c6ff0',
    }

    function simulate() {
      nodes.forEach((n) => {
        const dx = centerX - n.x
        const dy = centerY - n.y
        n.vx += dx * 0.001
        n.vy += dy * 0.001
        n.vx *= 0.92
        n.vy *= 0.92
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const minDist = nodes[i].radius + nodes[j].radius + 20
          if (dist < minDist) {
            const force = (minDist - dist) * 0.02
            const fx = (dx / dist) * force
            const fy = (dy / dist) * force
            nodes[i].vx -= fx
            nodes[i].vy -= fy
            nodes[j].vx += fx
            nodes[j].vy += fy
          }
        }
      }

      nodes.forEach((n) => {
        n.x += n.vx
        n.y += n.vy
        n.x = Math.max(n.radius + 10, Math.min(width - n.radius - 10, n.x))
        n.y = Math.max(n.radius + 10, Math.min(height - n.radius - 10, n.y))
      })
    }

    const context = ctx!

    function draw() {
      context.clearRect(0, 0, width, height)

      edges.forEach((edge) => {
        const src = nodes.find((n) => n.id === edge.source)
        const tgt = nodes.find((n) => n.id === edge.target)
        if (!src || !tgt) return
        context.beginPath()
        context.moveTo(src.x, src.y)
        context.lineTo(tgt.x, tgt.y)
        context.strokeStyle = 'rgba(124, 111, 240, 0.15)'
        context.lineWidth = 1
        context.stroke()
      })

      nodes.forEach((n) => {
        context.beginPath()
        context.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        context.fillStyle = typeColors[n.type] || '#7c6ff0'
        context.globalAlpha = n.type === 'dream' ? 0.7 : 0.9
        context.fill()
        context.globalAlpha = 1

        context.beginPath()
        context.arc(n.x, n.y, n.radius + 3, 0, Math.PI * 2)
        context.strokeStyle = typeColors[n.type] || '#7c6ff0'
        context.globalAlpha = 0.2
        context.lineWidth = 2
        context.stroke()
        context.globalAlpha = 1

        context.font = `${n.type === 'dream' ? '500 9px' : '600 10px'} 'DM Sans', sans-serif`
        context.fillStyle = '#e8e6f0'
        context.globalAlpha = n.type === 'dream' ? 0.5 : 0.8
        context.textAlign = 'center'
        context.fillText(n.label, n.x, n.y + n.radius + 14)
        context.globalAlpha = 1

        if (n.count > 1 && n.type !== 'dream') {
          context.font = "bold 8px 'DM Sans', sans-serif"
          context.fillStyle = '#fff'
          context.fillText(`×${n.count}`, n.x, n.y + 3)
        }
      })

      simulate()
      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
    }
  }, [buildGraph])

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        padding: '16px',
        position: 'relative',
      }}
    >
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🔗 梦境关联网络
        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.65rem', color: '#e74c3c' }}>● 人物</span>
          <span style={{ fontSize: '0.65rem', color: '#3498db' }}>● 地点</span>
          <span style={{ fontSize: '0.65rem', color: '#2ecc71' }}>● 物件</span>
          <span style={{ fontSize: '0.65rem', color: '#7c6ff0' }}>● 梦境</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', margin: '0 auto' }}
      />
    </div>
  )
}
