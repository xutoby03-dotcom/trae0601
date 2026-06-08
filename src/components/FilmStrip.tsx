import { Movie, Quote, EMOTION_COLORS } from '@/types'
import { useImageUrl } from '@/hooks/useImage'
import { ChevronRight, Film } from 'lucide-react'

interface FilmStripProps {
  movie: Movie
  quotes: Quote[]
  onQuoteClick: (quoteId: string) => void
  onMovieClick: (movieId: string) => void
  index: number
}

function QuoteCard({ quote, onQuoteClick }: { quote: Quote; onQuoteClick: (id: string) => void }) {
  const imageUrl = useImageUrl(quote.imageId)
  const visibleEmotions = quote.emotions.slice(0, 2)
  const extraCount = quote.emotions.length - 2

  return (
    <div
      className="flex-shrink-0 w-[120px] md:w-[160px] cursor-pointer transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-amber-primary/50"
      onClick={() => onQuoteClick(quote.id)}
    >
      {quote.imageId ? (
        <div className="w-[120px] h-[80px] md:w-[160px] md:h-[100px] rounded overflow-hidden bg-cinema-700">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-cinema-500">
              <Film size={20} />
            </div>
          )}
        </div>
      ) : quote.isExcerpt ? (
        <div className="w-[120px] h-[80px] md:w-[160px] md:h-[100px] rounded bg-cinema-700 p-2 flex flex-col justify-between">
          <p className="text-xs text-cinema-300 line-clamp-2 leading-tight">{quote.text}</p>
          <span className="text-[10px] text-amber-primary/70 italic">{quote.excerptStyle}</span>
        </div>
      ) : (
        <div className="w-[120px] h-[80px] md:w-[160px] md:h-[100px] rounded bg-cinema-700 flex items-center justify-center">
          <Film size={20} className="text-cinema-500" />
        </div>
      )}

      {quote.emotions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {visibleEmotions.map((emotion) => (
            <span
              key={emotion}
              className={`text-[10px] px-1 py-0.5 rounded border ${EMOTION_COLORS[emotion] || 'bg-cinema-600/20 text-cinema-300 border-cinema-500/30'}`}
            >
              {emotion}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-cinema-600/20 text-cinema-400 border border-cinema-500/30">
              +{extraCount}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default function FilmStrip({ movie, quotes, onQuoteClick, onMovieClick, index }: FilmStripProps) {
  return (
    <div
      className="bg-cinema-800/50 rounded-xl overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
    >
      <div className="relative h-3 bg-cinema-800 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(to right, transparent 0px, transparent 8px, rgba(226,183,20,0.2) 8px, rgba(226,183,20,0.2) 16px, transparent 16px, transparent 28px)`,
            backgroundSize: '28px 12px',
            borderRadius: '4px',
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-3"
          style={{
            backgroundImage: `repeating-linear-gradient(to right, transparent 0px, transparent 12px, #1a1a2e 12px, #1a1a2e 16px, transparent 16px, transparent 28px)`,
          }}
        />
      </div>

      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film size={18} className="text-amber-primary flex-shrink-0" />
          <span className="font-display text-xl text-white">{movie.name}</span>
          <span className="text-sm text-cinema-500">{movie.year}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-primary/20 text-amber-primary">
            {movie.quoteCount}
          </span>
        </div>
        <button
          onClick={() => onMovieClick(movie.id)}
          className="flex items-center gap-1 text-sm text-cinema-500 hover:text-amber-primary transition-colors"
        >
          查看全部
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="px-4 pb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3">
          {quotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} onQuoteClick={onQuoteClick} />
          ))}
        </div>
      </div>
    </div>
  )
}
