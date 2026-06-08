import { useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageModalProps {
  images: { src: string; label: string; date: string }[]
  initialIndex: number
  onClose: () => void
}

export default function ImageModal({ images, initialIndex, onClose }: ImageModalProps) {
  const [index, setIndex] = useState(initialIndex)

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : images.length - 1))
  }, [images.length])

  const goNext = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : 0))
  }, [images.length])

  const current = images[index]

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="flex items-center justify-center flex-1 min-h-0">
          <img
            src={current.src}
            alt={current.label}
            className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div className="mt-3 text-center">
          <p className="font-serif text-white/90 text-sm">{current.label}</p>
          <p className="font-serif text-white/50 text-xs mt-0.5">{current.date}</p>
          {images.length > 1 && (
            <p className="font-mono text-white/30 text-xs mt-1">
              {index + 1} / {images.length}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
