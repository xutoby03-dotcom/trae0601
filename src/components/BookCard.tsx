import { BookOpen, Star } from 'lucide-react'
import { Book, THEME_ICONS } from '@/types'
import { cn } from '@/lib/utils'

interface BookCardProps {
  book: Book
  onClick: () => void
  index?: number
}

export default function BookCard({ book, onClick, index = 0 }: BookCardProps) {
  const firstTheme = book.themes?.[0]
  const themeEmoji = firstTheme ? THEME_ICONS[firstTheme] : undefined

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col items-start gap-2 text-left w-full',
        'animate-fade-up opacity-0'
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl shadow-warm transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-soft">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {book.readCount > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-sunny px-2 py-0.5 text-xs font-bold text-bark shadow-warm">
            <Star className="h-3 w-3 fill-bark text-bark" />
            {book.readCount}
          </div>
        )}

        <div className="absolute bottom-2 left-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs text-bark backdrop-blur-sm">
            <BookOpen className="h-3 w-3" />
            <span>打开共读</span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-1 px-0.5">
        <h3 className="font-display line-clamp-2 text-sm leading-snug text-bark transition-colors duration-200 group-hover:text-caramel-dark">
          {book.title}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          {firstTheme && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-blush/60 px-2 py-0.5 text-xs text-caramel-dark">
              {themeEmoji && <span>{themeEmoji}</span>}
              {firstTheme}
            </span>
          )}

          {book.ageRange && (
            <span className="rounded-full bg-mint/50 px-2 py-0.5 text-xs text-caramel-dark">
              {book.ageRange}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
