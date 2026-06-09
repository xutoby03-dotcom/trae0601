import { useEffect, useRef, useState } from 'react'
import { Circle, Waves, MapPin, TreePine } from 'lucide-react'
import type { Route } from '@/types'

interface RouteMapProps {
  routes: Route[]
  onRouteClick?: (routeId: string) => void
  highlightedRouteId?: string
}

const ROUTE_ICONS: Record<Route['type'], typeof Circle> = {
  track: Circle,
  riverside: Waves,
  street: MapPin,
  park: TreePine,
}

function catmullRomToBezier(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }

  const tension = 0.3
  let d = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  return d
}

function getMidpoint(points: { x: number; y: number }[]): { x: number; y: number } {
  const mid = Math.floor(points.length / 2)
  return points[mid]
}

function getPathLength(points: { x: number; y: number }[]): number {
  let len = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    len += Math.sqrt(dx * dx + dy * dy)
  }
  return len
}

function RouteTypeIcon({ type, color, size = 14 }: { type: Route['type']; color: string; size?: number }) {
  const Icon = ROUTE_ICONS[type]
  return <Icon size={size} color={color} strokeWidth={2} />
}

function RouteLayer({
  route,
  isHighlighted,
  isDimmed,
  onRouteClick,
  animating,
}: {
  route: Route
  isHighlighted: boolean
  isDimmed: boolean
  onRouteClick?: (routeId: string) => void
  animating: boolean
}) {
  const pathRef = useRef<SVGPathElement>(null)
  const [measuredLength, setMeasuredLength] = useState(0)

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength()
      setMeasuredLength(len)
    }
  }, [route.pathPoints])

  const pathD = catmullRomToBezier(route.pathPoints)
  const mid = getMidpoint(route.pathPoints)
  const startPoint = route.pathPoints[0]
  const endPoint = route.pathPoints[route.pathPoints.length - 1]
  const estimatedLength = getPathLength(route.pathPoints)
  const dashLength = measuredLength || estimatedLength * 1.5

  const glowIntensity = isHighlighted ? 8 : 4
  const strokeWidth = isHighlighted ? 4 : 2.5
  const opacity = isDimmed ? 0.25 : 1

  return (
    <g
      opacity={opacity}
      className="cursor-pointer"
      onClick={() => onRouteClick?.(route.id)}
    >
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke={route.color}
        strokeWidth={strokeWidth + 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        opacity={0.5}
      />
      <path
        d={pathD}
        fill="none"
        stroke={route.color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashLength}
        strokeDashoffset={animating ? dashLength : 0}
        style={{
          transition: animating ? 'none' : 'stroke-dashoffset 1.5s ease-out, stroke-width 0.3s ease, opacity 0.3s ease',
          filter: `drop-shadow(0 0 ${glowIntensity}px ${route.color})`,
        }}
      />

      <circle
        cx={startPoint.x}
        cy={startPoint.y}
        r={isHighlighted ? 7 : 5}
        fill={route.color}
        filter="url(#dotGlow)"
        style={{ filter: `drop-shadow(0 0 6px ${route.color})` }}
      />
      <circle
        cx={startPoint.x}
        cy={startPoint.y}
        r={3}
        fill="#fff"
      />

      <circle
        cx={endPoint.x}
        cy={endPoint.y}
        r={isHighlighted ? 7 : 5}
        fill={route.color}
        style={{ filter: `drop-shadow(0 0 6px ${route.color})` }}
      />
      <circle
        cx={endPoint.x}
        cy={endPoint.y}
        r={3}
        fill="#fff"
      />

      <g transform={`translate(${mid.x}, ${mid.y - 16})`}>
        <rect
          x={-8}
          y={-12}
          width={route.name.length * 9 + 28}
          height={22}
          rx={4}
          fill="#0B1120"
          fillOpacity={0.85}
          stroke={route.color}
          strokeWidth={0.5}
          strokeOpacity={0.4}
        />
        <foreignObject
          x={-4}
          y={-10}
          width={route.name.length * 9 + 20}
          height={18}
        >
          <div className="flex items-center gap-1" style={{ color: route.color }}>
            <RouteTypeIcon type={route.type} color={route.color} size={12} />
            <span className="text-[11px] font-semibold whitespace-nowrap">{route.name}</span>
          </div>
        </foreignObject>
      </g>
    </g>
  )
}

export default function RouteMap({ routes, onRouteClick, highlightedRouteId }: RouteMapProps) {
  const [animating, setAnimating] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setAnimating(false), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full h-full relative">
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full"
        style={{ background: '#0B1120' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="dotGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#1a2744"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        <rect width="800" height="600" fill="#0B1120" />
        <rect width="800" height="600" fill="url(#grid)" opacity={0.6} />

        {routes.map((route) => (
          <RouteLayer
            key={route.id}
            route={route}
            isHighlighted={highlightedRouteId === route.id}
            isDimmed={!!highlightedRouteId && highlightedRouteId !== route.id}
            onRouteClick={onRouteClick}
            animating={animating}
          />
        ))}
      </svg>
    </div>
  )
}
