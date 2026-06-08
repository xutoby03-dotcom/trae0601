import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCineQuoteStore } from '@/store'
import { QuoteFilter } from '@/types'
import Navbar from '@/components/Navbar'
import FilmStrip from '@/components/FilmStrip'
import FilterPanel from '@/components/FilterPanel'
import { Plus, Film, Sparkles } from 'lucide-react'

const DEFAULT_FILTER: QuoteFilter = {
  keyword: '',
  emotions: [],
  character: '',
  yearFrom: null,
  yearTo: null,
}

export default function FilmWall() {
  const navigate = useNavigate()
  const { movies, initialized, init, filterQuotes } = useCineQuoteStore()

  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState<QuoteFilter>(DEFAULT_FILTER)
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    if (!initialized) init()
  }, [initialized, init])

  const isFilterActive = useMemo(() => {
    return (
      filter.keyword !== '' ||
      filter.emotions.length > 0 ||
      filter.character !== '' ||
      filter.yearFrom !== null ||
      filter.yearTo !== null
    )
  }, [filter])

  const filteredQuotes = useMemo(() => {
    if (!isFilterActive) return null
    return filterQuotes(filter)
  }, [isFilterActive, filter, filterQuotes])

  const displayMovies = useMemo(() => {
    if (!isFilterActive || !filteredQuotes) return movies

    const quotesByMovieId = new Map<string, typeof filteredQuotes>()
    for (const q of filteredQuotes) {
      const list = quotesByMovieId.get(q.movieId) || []
      list.push(q)
      quotesByMovieId.set(q.movieId, list)
    }

    return movies.filter((m) => quotesByMovieId.has(m.id))
  }, [isFilterActive, filteredQuotes, movies])

  const quotesByMovieForDisplay = useMemo(() => {
    if (!isFilterActive || !filteredQuotes) return null

    const map = new Map<string, typeof filteredQuotes>()
    for (const q of filteredQuotes) {
      const list = map.get(q.movieId) || []
      list.push(q)
      map.set(q.movieId, list)
    }
    return map
  }, [isFilterActive, filteredQuotes])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-cinema-900 flex items-center justify-center">
        <Film className="w-12 h-12 text-amber-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cinema-900">
      <Navbar
        onFilterToggle={() => setFilterOpen(!filterOpen)}
        filterOpen={filterOpen}
        onSearchChange={(v) => {
          setSearchValue(v)
          setFilter((prev) => ({ ...prev, keyword: v }))
        }}
        searchValue={searchValue}
      />

      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filter={filter}
        onFilterChange={setFilter}
      />

      <div className="container mx-auto py-20 px-4">
        {movies.length > 0 ? (
          isFilterActive && displayMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Sparkles className="w-16 h-16 text-cinema-600 mb-4" />
              <h2 className="font-display text-xl text-cinema-400 mb-2">没有匹配的台词</h2>
              <p className="text-cinema-500 mb-6">试试调整筛选条件</p>
              <button
                onClick={() => {
                  setFilter(DEFAULT_FILTER)
                  setSearchValue('')
                }}
                className="px-6 py-2 rounded-full border border-amber-primary text-amber-primary hover:bg-amber-primary hover:text-cinema-900 transition-colors"
              >
                清除筛选
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {displayMovies.map((movie, index) => (
                <FilmStrip
                  key={movie.id}
                  movie={movie}
                  quotes={
                    isFilterActive && quotesByMovieForDisplay
                      ? quotesByMovieForDisplay.get(movie.id) || []
                      : useCineQuoteStore.getState().getQuotesByMovie(movie.id)
                  }
                  onQuoteClick={(quoteId) => navigate(`/quote/${quoteId}`)}
                  onMovieClick={(movieId) => navigate(`/movie/${movieId}`)}
                  index={index}
                />
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Film className="w-20 h-20 text-cinema-600 mb-6" />
            <h2 className="font-display text-2xl text-cinema-300 mb-2">还没有台词收藏</h2>
            <p className="text-cinema-500 mb-8">点击上方按钮添加你的第一句台词</p>
            <Link
              to="/add"
              className="px-8 py-3 rounded-full bg-amber-primary text-cinema-900 font-semibold hover:bg-amber-light transition-colors"
            >
              开始收藏
            </Link>
          </div>
        )}
      </div>

      <Link
        to="/add"
        className="fixed bottom-8 right-8 z-30 w-14 h-14 flex items-center justify-center rounded-full bg-amber-primary text-cinema-900 shadow-lg shadow-amber-primary/30 hover:scale-110 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </Link>

      <div className="grain-overlay" />
    </div>
  )
}
