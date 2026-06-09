import { useState } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Drawer({ open, onClose, title, children }: DrawerProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchDelta, setTouchDelta] = useState(0)

  if (!open) return null

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart !== null) {
      const delta = e.touches[0].clientY - touchStart
      if (delta > 0) setTouchDelta(delta)
    }
  }

  const handleTouchEnd = () => {
    if (touchDelta > 80) onClose()
    setTouchStart(null)
    setTouchDelta(0)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-[480px] bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto transition-transform"
        style={{ transform: touchDelta > 0 ? `translateY(${touchDelta}px)` : undefined }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-lg font-bold text-stone-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100 transition-colors">
            <X size={20} className="text-stone-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
