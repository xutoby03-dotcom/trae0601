import { useRef, useEffect, useCallback } from 'react'
import { useWalkStore } from '@/store/useWalkStore'

export default function RouteMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const places = useWalkStore((s) => s.places)
  const routePlaces = useWalkStore((s) => s.routePlaces)
  const selectedPlaceId = useWalkStore((s) => s.selectedPlaceId)
  const setSelectedPlace = useWalkStore((s) => s.setSelectedPlace)
  const animFrameRef = useRef<number>(0)
  const pulseRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height

    ctx.fillStyle = '#FFF8F0'
    ctx.fillRect(0, 0, w, h)

    ctx.strokeStyle = '#F5E6D8'
    ctx.lineWidth = 0.5
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    const routeIdSet = new Set(routePlaces.map((p) => p.id))
    const pad = 40
    const mx = (px: number) => pad + px * (w - pad * 2)
    const my = (py: number) => pad + py * (h - pad * 2)

    ctx.save()
    ctx.strokeStyle = '#E8D5C4'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    for (const place of places) {
      const ex = mx(place.mapX)
      const ey = my(place.mapY)
      const neighbors = places.filter(
        (p) =>
          p.id !== place.id &&
          Math.hypot(p.mapX - place.mapX, p.mapY - place.mapY) < 0.35
      )
      for (const n of neighbors) {
        if (n.id > place.id) {
          ctx.beginPath()
          ctx.moveTo(ex, ey)
          ctx.lineTo(mx(n.mapX), my(n.mapY))
          ctx.stroke()
        }
      }
    }
    ctx.restore()

    if (routePlaces.length > 1) {
      ctx.save()
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      const gradient = ctx.createLinearGradient(0, 0, w, h)
      gradient.addColorStop(0, '#F97316')
      gradient.addColorStop(0.5, '#FB923C')
      gradient.addColorStop(1, '#F97316')
      ctx.strokeStyle = gradient

      ctx.beginPath()
      ctx.moveTo(mx(routePlaces[0].mapX), my(routePlaces[0].mapY))
      for (let i = 1; i < routePlaces.length; i++) {
        const prev = routePlaces[i - 1]
        const curr = routePlaces[i]
        const cpx = (mx(prev.mapX) + mx(curr.mapX)) / 2
        const cpy = (my(prev.mapY) + my(curr.mapY)) / 2 - 15
        ctx.quadraticCurveTo(cpx, cpy, mx(curr.mapX), my(curr.mapY))
      }
      ctx.stroke()
      ctx.restore()

      ctx.save()
      ctx.font = 'bold 11px sans-serif'
      ctx.fillStyle = '#F97316'
      ctx.textAlign = 'center'
      for (let i = 0; i < routePlaces.length; i++) {
        const p = routePlaces[i]
        const x = mx(p.mapX)
        const y = my(p.mapY)
        const labelY = y - 22
        ctx.fillText(`${i + 1}`, x, labelY)
      }
      ctx.restore()
    }

    pulseRef.current += 0.05
    const pulse = Math.sin(pulseRef.current) * 0.5 + 0.5

    for (const place of places) {
      const x = mx(place.mapX)
      const y = my(place.mapY)
      const isSelected = selectedPlaceId === place.id
      const inRoute = routeIdSet.has(place.id)

      if (isSelected) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, 18 + pulse * 6, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(249, 115, 22, ${0.15 + pulse * 0.1})`
        ctx.fill()
        ctx.restore()
      }

      ctx.save()
      ctx.beginPath()
      ctx.arc(x, y, inRoute ? 16 : 13, 0, Math.PI * 2)
      if (inRoute) {
        ctx.fillStyle = '#FFF7ED'
        ctx.fill()
        ctx.strokeStyle = '#F97316'
        ctx.lineWidth = 2.5
        ctx.stroke()
      } else {
        ctx.fillStyle = '#FFFFFF'
        ctx.fill()
        ctx.strokeStyle = '#D4C5B9'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      ctx.restore()

      ctx.save()
      ctx.font = inRoute ? '16px sans-serif' : '13px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(place.emoji, x, y)
      ctx.restore()

      ctx.save()
      ctx.font = `${inRoute ? 'bold ' : ''}10px sans-serif`
      ctx.fillStyle = inRoute ? '#3D2C2E' : '#8B7073'
      ctx.textAlign = 'center'
      ctx.fillText(place.name, x, y + (inRoute ? 24 : 20))
      ctx.restore()
    }

    animFrameRef.current = requestAnimationFrame(draw)
  }, [places, routePlaces, selectedPlaceId])

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [draw])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    const pad = 40
    const w = rect.width
    const h = rect.height

    for (const place of places) {
      const px = pad + place.mapX * (w - pad * 2)
      const py = pad + place.mapY * (h - pad * 2)
      if (Math.hypot(clickX - px, clickY - py) < 20) {
        setSelectedPlace(selectedPlaceId === place.id ? null : place.id)
        return
      }
    }
    setSelectedPlace(null)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-[#3D2C2E]">🗺️ 路线地图</h2>
      </div>
      <div className="flex-1 px-4 pb-4">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="w-full h-full rounded-2xl border border-gray-100 shadow-inner cursor-pointer"
          style={{ minHeight: '300px' }}
        />
      </div>
    </div>
  )
}
