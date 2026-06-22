import { useGrindingStore } from '@/store/grindingStore'
import { useEffect, useRef } from 'react'

interface GranularityType {
  key: string
  label: string
  meshRange: string
  sizeRange: string
  features: string[]
  textureGradient: string
  particleSize: number
  particleCount: number
  particleColor: string
  glowColor: string
  borderAccent: string
}

const GRANULARITY_TYPES: GranularityType[] = [
  {
    key: 'coarse',
    label: '粗粉',
    meshRange: '20-40 目',
    sizeRange: '840-420μm',
    features: ['颗粒分明', '香气释放缓慢', '适合慢炖', '不易结块'],
    textureGradient: 'radial-gradient(ellipse at 30% 40%, rgba(184,134,11,0.3) 0%, rgba(139,69,19,0.15) 50%, transparent 70%)',
    particleSize: 8,
    particleCount: 12,
    particleColor: 'rgba(196,160,53,0.7)',
    glowColor: 'rgba(184,134,11,0.15)',
    borderAccent: 'border-amber-700/40',
  },
  {
    key: 'fine',
    label: '细粉',
    meshRange: '80-120 目',
    sizeRange: '180-125μm',
    features: ['粉质细腻', '香气释放迅速', '适合快炒', '易吸潮'],
    textureGradient: 'radial-gradient(ellipse at 50% 50%, rgba(232,145,45,0.2) 0%, rgba(184,134,11,0.1) 60%, transparent 80%)',
    particleSize: 3,
    particleCount: 50,
    particleColor: 'rgba(232,145,45,0.5)',
    glowColor: 'rgba(232,145,45,0.12)',
    borderAccent: 'border-orange-700/40',
  },
  {
    key: 'clump',
    label: '结块',
    meshRange: '40-80 目',
    sizeRange: '420-180μm',
    features: ['受潮团聚', '释放不均匀', '需重新过筛', '油脂粘结'],
    textureGradient: 'radial-gradient(ellipse at 60% 40%, rgba(139,69,19,0.35) 0%, rgba(62,39,35,0.2) 50%, transparent 70%)',
    particleSize: 14,
    particleCount: 8,
    particleColor: 'rgba(139,69,19,0.6)',
    glowColor: 'rgba(139,69,19,0.15)',
    borderAccent: 'border-yellow-900/40',
  },
  {
    key: 'oil',
    label: '油脂析出',
    meshRange: '60-100 目',
    sizeRange: '250-150μm',
    features: ['表面油光', '香气浓郁', '易氧化变质', '需低温研磨'],
    textureGradient: 'radial-gradient(ellipse at 40% 60%, rgba(232,145,45,0.35) 0%, rgba(184,134,11,0.15) 40%, transparent 70%)',
    particleSize: 5,
    particleCount: 30,
    particleColor: 'rgba(232,145,45,0.4)',
    glowColor: 'rgba(232,145,45,0.2)',
    borderAccent: 'border-amber-600/40',
  },
]

function ParticleCanvas({ type }: { type: GranularityType }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, rect.width, rect.height)

    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 49297
      return x - Math.floor(x)
    }

    for (let i = 0; i < type.particleCount; i++) {
      const x = seededRandom(i * 3 + 1) * rect.width
      const y = seededRandom(i * 3 + 2) * rect.height
      const size = type.particleSize * (0.6 + seededRandom(i * 3 + 3) * 0.8)

      ctx.beginPath()
      if (type.key === 'clump') {
        ctx.ellipse(x, y, size * 1.3, size * 0.8, seededRandom(i) * Math.PI, 0, Math.PI * 2)
      } else {
        ctx.arc(x, y, size, 0, Math.PI * 2)
      }

      const alpha = 0.3 + seededRandom(i + 100) * 0.5
      ctx.fillStyle = type.particleColor.replace(/[\d.]+\)$/, `${alpha})`)
      ctx.fill()

      if (type.key === 'oil') {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
        gradient.addColorStop(0, 'rgba(232,145,45,0.15)')
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, size * 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }, [type])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-t-xl"
      style={{ background: type.textureGradient }}
    />
  )
}

export default function GranularityPanel() {
  const { currentRecord } = useGrindingStore()

  const getActiveIndex = () => {
    const mesh = currentRecord.meshSize
    if (mesh <= 40) return 0
    if (mesh <= 80) return 2
    if (mesh <= 120) return 1
    return 1
  }

  const getOilRisk = () => {
    return currentRecord.shutdownTemp > 70
  }

  const activeIndex = getActiveIndex()
  const oilRisk = getOilRisk()

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-amber-200 mb-2 tracking-wide" style={{ fontFamily: '"Noto Serif SC", serif' }}>
        粒度对照面板
      </h2>
      <p className="text-amber-600/50 text-sm mb-6">
        当前参数指向：<span className="text-amber-400 font-medium">{GRANULARITY_TYPES[activeIndex].label}</span>
        {oilRisk && <span className="ml-3 text-orange-400/80">⚠ 高温可能致油脂析出</span>}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {GRANULARITY_TYPES.map((type, idx) => {
          const isActive = idx === activeIndex || (type.key === 'oil' && oilRisk)
          return (
            <div
              key={type.key}
              className={`group relative rounded-xl border transition-all duration-300 overflow-hidden ${
                isActive
                  ? `${type.borderAccent} shadow-[0_0_24px_${type.glowColor}] scale-[1.02]`
                  : 'border-amber-900/20 hover:border-amber-800/30'
              } bg-[#1E1810]`}
            >
              <ParticleCanvas type={type} />

              {isActive && (
                <div className="absolute top-2 right-2 bg-amber-600/80 text-amber-100 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  当前
                </div>
              )}

              <div className="p-4">
                <h3 className="text-lg font-bold text-amber-200 mb-1" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                  {type.label}
                </h3>
                <p className="text-amber-500/60 text-xs mb-2">{type.meshRange} · {type.sizeRange}</p>
                <div className="flex flex-wrap gap-1">
                  {type.features.map((f) => (
                    <span
                      key={f}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400/70 border border-amber-800/20"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
