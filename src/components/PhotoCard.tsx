import type { Photo } from '@/types'
import TagBadge from './TagBadge'

interface PhotoCardProps {
  photo: Photo
  onClick: () => void
}

export default function PhotoCard({ photo, onClick }: PhotoCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-warm-peach/50 overflow-hidden hover:shadow-md transition cursor-pointer"
    >
      <img
        src={photo.url}
        alt={photo.location}
        className="w-full aspect-[4/3] object-cover rounded-t-2xl"
      />
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-gray-800">{photo.location}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{photo.story}</p>
        <div className="flex items-center justify-between">
          {photo.cost > 0 && (
            <span className="text-sm font-medium text-orange-500">¥{photo.cost}</span>
          )}
          <div className="flex gap-1 flex-wrap">
            {photo.tags.map((tag) => (
              <TagBadge key={tag} name={tag} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
