import { useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCineQuoteStore } from '@/store'
import { useImageUrl } from '@/hooks/useImage'
import { ArrowLeft, Film, Quote, Trash2 } from 'lucide-react'
import { EmotionTag } from '@/components/EmotionTag'

function QuoteCard({
  quote,
  onDelete,
}: {
  quote: ReturnType<typeof useCineQuoteStore.getState>['quotes'][number]
  onDelete: (id: string) => void
}) {
  const navigate = useNavigate()
  const imageUrl = useImageUrl(quote.imageId)

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (confirm('确定删除这句台词吗？')) {
        onDelete(quote.id)
      }
    },
    [onDelete, quote.id]
  )

  return (
    <div
      onClick={() => navigate(`/quote/${quote.id}`)}
      className="group relative bg-cinema-800 rounded-xl overflow-hidden hover:ring-1 hover:ring-amber-primary/30 transition cursor-pointer"
    >
      {imageUrl && (
        <img src={imageUrl} alt="" className="w-full h-48 object-cover" />
      )}
      <div className="p-4 space-y-2">
        <p className="font-display italic line-clamp-3">{quote.text}</p>
        <p className="text-amber-primary/70">{quote.character}</p>
        {quote.emotions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {quote.emotions.slice(0, 3).map((emotion) => (
              <EmotionTag key={emotion} emotion={emotion} size="sm" />
            ))}
          </div>
        )}
        {quote.timestamp && (
          <p className="text-cinema-500 text-xs">{quote.timestamp}</p>
        )}
        {quote.note && (
          <p className="text-cinema-500 text-sm line-clamp-2 italic">
            {quote.note}
          </p>
        )}
      </div>
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-cinema-900/60 opacity-0 group-hover:opacity-100 transition hover:bg-red-600 text-white"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function MovieDetail() {
  const { movieId } = useParams<{ movieId: string }>()
  const navigate = useNavigate()
  const { movies, initialized, init, getQuotesByMovie, deleteQuote } =
    useCineQuoteStore()

  useEffect(() => {
    if (!initialized) init()
  }, [initialized, init])

  const movie = movies.find((m) => m.id === movieId)

  const quotes = movieId
    ? getQuotesByMovie(movieId).sort((a, b) => b.createdAt - a.createdAt)
    : []

  const handleDeleteQuote = useCallback(
    async (id: string) => {
      await deleteQuote(id)
    },
    [deleteQuote]
  )

  if (!movie) {
    return (
      <div className="min-h-screen bg-cinema-900 flex flex-col items-center justify-center gap-4">
        <Film className="w-16 h-16 text-cinema-600" />
        <p className="font-display text-2xl text-cinema-300">电影未找到</p>
        <Link
          to="/"
          className="text-amber-primary hover:text-amber-light transition"
        >
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cinema-900">
      <div className="sticky top-0 z-20 bg-gradient-to-b from-cinema-800 to-transparent px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-cinema-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-3xl flex-1">{movie.name}</h1>
          <span className="px-3 py-1 rounded-full bg-cinema-700 text-sm">
            {movie.year}
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-primary/20 text-amber-primary text-sm flex items-center gap-1">
            <Quote className="w-3.5 h-3.5" />
            {quotes.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {quotes.map((quote) => (
          <QuoteCard key={quote.id} quote={quote} onDelete={handleDeleteQuote} />
        ))}
      </div>

      <div className="grain-overlay" />
    </div>
  )
}
