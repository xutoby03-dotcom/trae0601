import type { Observation } from '@/types'
import { OBSERVATION_TYPE_CONFIG } from '@/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface TimelineProps {
  observations: Observation[]
}

const COLOR_MAP: Record<string, string> = {
  leaf: 'bg-leaf-400 border-leaf-500',
  mint: 'bg-mint-400 border-mint-500',
  chili: 'bg-chili-400 border-chili-500',
  earth: 'bg-earth-400 border-earth-500',
  tomato: 'bg-tomato-400 border-tomato-500',
  dew: 'bg-dew-400 border-dew-500',
  wood: 'bg-wood-400 border-wood-500',
}

export default function Timeline({ observations }: TimelineProps) {
  if (observations.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl">📝</span>
        <p className="font-serif text-earth-500 mt-3">还没有观察记录</p>
        <p className="font-serif text-earth-400 text-sm mt-1">开始记录植物的成长吧</p>
      </div>
    )
  }

  const sortedObs = [...observations].sort(
    (a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime()
  )

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-earth-200" />

      <div className="space-y-4">
        {sortedObs.map((obs, index) => {
          const config = OBSERVATION_TYPE_CONFIG[obs.type]
          const dotColors = COLOR_MAP[config.color] || 'bg-earth-400 border-earth-500'

          return (
            <div
              key={obs.id}
              className="relative pl-12 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`absolute left-3 top-1.5 w-5 h-5 rounded-full border-2 ${dotColors} z-10 flex items-center justify-center`}>
                <span className="text-[8px]">{config.emoji}</span>
              </div>

              <div className="card-paper p-3">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`tag bg-${config.color}-50 text-${config.color}-700 border border-${config.color}-200`}>
                      {config.emoji} {config.label}
                    </span>
                    {obs.heightCm !== null && obs.heightCm > 0 && (
                      <span className="text-xs font-mono text-earth-500">
                        📏 {obs.heightCm}cm
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-serif text-earth-400">
                    {format(new Date(obs.observedAt), 'M月d日 EEEE', { locale: zhCN })}
                  </span>
                </div>

                {obs.description && (
                  <p className="text-sm font-serif text-earth-700 leading-relaxed">
                    {obs.description}
                  </p>
                )}

                {obs.pestDescription && (
                  <p className="text-sm font-serif text-tomato-600 mt-1">
                    🐛 {obs.pestDescription}
                  </p>
                )}

                {obs.fertilizerType && (
                  <p className="text-sm font-serif text-dew-600 mt-1">
                    💧 {obs.fertilizerType} {obs.fertilizerAmount && `· ${obs.fertilizerAmount}`}
                  </p>
                )}

                {obs.newPotSize && (
                  <p className="text-sm font-serif text-wood-600 mt-1">
                    🪴 换至{obs.newPotSize}
                  </p>
                )}

                {obs.photos.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {obs.photos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`观察照片 ${i + 1}`}
                        className="w-20 h-20 rounded-lg object-cover border border-earth-200 flex-shrink-0"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
