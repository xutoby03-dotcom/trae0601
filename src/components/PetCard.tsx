import { MapPin, Clock } from 'lucide-react'
import type { PetPost } from '@/types'
import { STATUS_LABELS, TYPE_LABELS, GENDER_LABELS, STATUS_COLORS, TYPE_COLORS } from '@/types'

interface PetCardProps {
  post: PetPost
  onClick: () => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function PetCard({ post, onClick }: PetCardProps) {
  return (
    <div
      className="rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition cursor-pointer border border-stone-200"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3]">
        {post.photos.length > 0 ? (
          <img
            src={post.photos[0]}
            alt={post.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#FFF7ED' }}>
            <span className="text-4xl">🐾</span>
          </div>
        )}
        <span
          className="absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: TYPE_COLORS[post.type] }}
        >
          {TYPE_LABELS[post.type]}
        </span>
        <span
          className="absolute top-2 right-2 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: STATUS_COLORS[post.status] }}
        >
          {STATUS_LABELS[post.status]}
        </span>
      </div>
      <div className="p-3">
        <div className="text-base font-bold text-stone-800">{post.name}</div>
        <div className="text-sm text-stone-500">{post.breed} · {GENDER_LABELS[post.gender]}</div>
        <div className="flex items-center gap-1 text-xs text-stone-400 mt-1">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{post.locationDesc}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-400 mt-1">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{formatDate(post.lostTime)}</span>
        </div>
      </div>
    </div>
  )
}
