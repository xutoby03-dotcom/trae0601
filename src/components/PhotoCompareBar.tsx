import { useState } from 'react'
import type { Observation } from '@/types'
import { OBSERVATION_TYPE_CONFIG } from '@/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import ImageModal from '@/components/ImageModal'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface PhotoCompareBarProps {
  observations: Observation[]
}

interface PhotoEntry {
  src: string
  obsId: string
  date: Date
  dateStr: string
  typeLabel: string
  typeEmoji: string
  heightCm: number | null
  description: string
}

export default function PhotoCompareBar({ observations }: PhotoCompareBarProps) {
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null)
  const [modalImages, setModalImages] = useState<{ src: string; label: string; date: string }[]>([])
  const [modalIndex, setModalIndex] = useState(0)

  const photoEntries: PhotoEntry[] = observations
    .filter((o) => o.photos.length > 0)
    .sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime())
    .flatMap((obs) => {
      const config = OBSERVATION_TYPE_CONFIG[obs.type]
      return obs.photos.map((src) => ({
        src,
        obsId: obs.id,
        date: new Date(obs.observedAt),
        dateStr: format(new Date(obs.observedAt), 'M月d日', { locale: zhCN }),
        typeLabel: config.label,
        typeEmoji: config.emoji,
        heightCm: obs.heightCm,
        description: obs.description,
      }))
    })

  if (photoEntries.length === 0) return null

  const handlePhotoClick = (entryIndex: number) => {
    const images = photoEntries.map((e) => ({
      src: e.src,
      label: `${e.typeEmoji} ${e.typeLabel}${e.heightCm ? ` · ${e.heightCm}cm` : ''}${e.description ? ` · ${e.description}` : ''}`,
      date: e.dateStr,
    }))
    setModalImages(images)
    setModalIndex(entryIndex)
  }

  const scroll = (direction: number) => {
    if (!scrollRef) return
    scrollRef.scrollBy({ left: direction * 220, behavior: 'smooth' })
  }

  return (
    <>
      <div className="card-paper p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-handwriting text-lg text-earth-700 flex items-center gap-2">
            📸 成长对比
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll(-1)}
              className="w-7 h-7 rounded-full bg-earth-100 hover:bg-earth-200 flex items-center justify-center text-earth-500 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-7 h-7 rounded-full bg-earth-100 hover:bg-earth-200 flex items-center justify-center text-earth-500 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div
          ref={setScrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin"
        >
          {photoEntries.map((entry, i) => (
            <button
              key={`${entry.obsId}-${i}`}
              onClick={() => handlePhotoClick(i)}
              className="flex-shrink-0 w-[160px] group"
            >
              <div className="relative h-[120px] rounded-xl overflow-hidden border-2 border-earth-200 group-hover:border-leaf-400 transition-colors shadow-sm group-hover:shadow-md">
                <img
                  src={entry.src}
                  alt={entry.description || entry.typeLabel}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent pt-6 pb-1.5 px-2">
                  <p className="text-[10px] font-serif text-white/90 truncate">
                    {entry.typeEmoji} {entry.typeLabel}
                    {entry.heightCm !== null && entry.heightCm > 0 && (
                      <span className="ml-1 font-mono">{entry.heightCm}cm</span>
                    )}
                  </p>
                </div>
              </div>
              <p className="text-[10px] font-serif text-earth-500 mt-1.5 text-center">
                {entry.dateStr}
              </p>
            </button>
          ))}
        </div>

        {photoEntries.length > 1 && (
          <div className="mt-2 flex items-center gap-1 justify-center">
            {photoEntries.length > 1 && (
              <div className="flex items-center gap-0.5 text-[10px] font-serif text-earth-400">
                {photoEntries[0].typeEmoji} {photoEntries[0].dateStr}
                <span className="mx-1">→</span>
                {photoEntries[photoEntries.length - 1].typeEmoji} {photoEntries[photoEntries.length - 1].dateStr}
              </div>
            )}
          </div>
        )}
      </div>

      {modalImages.length > 0 && (
        <ImageModal
          images={modalImages}
          initialIndex={modalIndex}
          onClose={() => setModalImages([])}
        />
      )}
    </>
  )
}
