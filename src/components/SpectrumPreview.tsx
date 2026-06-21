import { useMemo } from 'react'

interface SpectrumPreviewProps {
  blueRatio: number
  whiteRatio: number
  purpleRatio: number
  brightness: number
}

export default function SpectrumPreview({ blueRatio, whiteRatio, purpleRatio, brightness }: SpectrumPreviewProps) {
  const total = blueRatio + whiteRatio + purpleRatio || 1

  const gradientStops = useMemo(() => {
    const bStop = (blueRatio / total) * 100
    const wStop = bStop + (whiteRatio / total) * 100
    return [
      `rgba(30,64,175,${blueRatio / 100}) 0%`,
      `rgba(30,64,175,${blueRatio / 100}) ${bStop}%`,
      `rgba(254,249,239,${whiteRatio / 100}) ${bStop}%`,
      `rgba(254,249,239,${whiteRatio / 100}) ${wStop}%`,
      `rgba(167,139,250,${purpleRatio / 100}) ${wStop}%`,
      `rgba(167,139,250,${purpleRatio / 100}) 100%`,
    ].join(', ')
  }, [blueRatio, whiteRatio, purpleRatio, total])

  const glowColor = useMemo(() => {
    const r = Math.round((30 * blueRatio + 254 * whiteRatio + 167 * purpleRatio) / total)
    const g = Math.round((64 * blueRatio + 249 * whiteRatio + 139 * purpleRatio) / total)
    const b = Math.round((175 * blueRatio + 239 * whiteRatio + 250 * purpleRatio) / total)
    return `rgba(${r},${g},${b},${brightness / 100})`
  }, [blueRatio, whiteRatio, purpleRatio, brightness, total])

  const dots = [
    { color: '#1e40af', label: '蓝光', value: blueRatio },
    { color: '#fef9ef', label: '白光', value: whiteRatio },
    { color: '#a78bfa', label: '紫光', value: purpleRatio },
  ]

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <style>{`
        @keyframes jellyfish-breathe {
          0%, 100% { transform: scale(1); opacity: var(--glow-opacity); }
          50% { transform: scale(1.06); opacity: calc(var(--glow-opacity) * 1.2); }
        }
        .spectrum-circle {
          animation: jellyfish-breathe 3s ease-in-out infinite;
        }
      `}</style>

      <div
        className="relative w-[200px] h-[200px] rounded-full spectrum-circle"
        style={
          {
            '--glow-opacity': brightness / 100,
            background: `radial-gradient(circle, ${gradientStops})`,
            opacity: brightness / 100,
            boxShadow: `0 0 40px 10px ${glowColor}, 0 0 80px 30px ${glowColor}, inset 0 0 30px ${glowColor}`,
          } as React.CSSProperties
        }
      />

      <div className="flex items-center gap-5">
        {dots.map(d => (
          <div key={d.label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: d.color, boxShadow: `0 0 6px ${d.color}` }}
            />
            <span className="text-xs text-gray-400">{d.label}</span>
            <span className="text-xs font-mono text-gray-300">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
