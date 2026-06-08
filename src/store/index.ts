import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { Movie, Quote, QuoteFilter, CropArea } from '@/types'
import { getDB } from '@/lib/db'

interface CineQuoteStore {
  movies: Movie[]
  quotes: Quote[]
  initialized: boolean

  init: () => Promise<void>

  addMovie: (data: { name: string; year: number }) => Promise<Movie>
  updateMovie: (id: string, data: Partial<Movie>) => Promise<void>
  deleteMovie: (id: string) => Promise<void>

  addQuote: (data: {
    movieId: string
    character: string
    text: string
    timestamp: string
    emotions: string[]
    note: string
    imageId: string | null
    isExcerpt: boolean
    excerptStyle: string
    brightness?: number
    cropArea?: CropArea | null
    showSubtitle?: boolean
    subtitleText?: string
  }) => Promise<Quote>
  updateQuote: (id: string, data: Partial<Quote>) => Promise<void>
  deleteQuote: (id: string) => Promise<void>

  saveImage: (blob: Blob) => Promise<string>
  getImageUrl: (id: string | null) => Promise<string | null>
  deleteImage: (id: string) => Promise<void>

  filterQuotes: (filter: QuoteFilter) => Quote[]
  getQuotesByMovie: (movieId: string) => Quote[]
  findOrCreateMovie: (name: string, year: number) => Promise<Movie>
}

export const useCineQuoteStore = create<CineQuoteStore>((set, get) => ({
  movies: [],
  quotes: [],
  initialized: false,

  init: async () => {
    const db = await getDB()
    const movies = await db.getAll('movies')
    const quotes = await db.getAll('quotes')
    movies.sort((a, b) => b.updatedAt - a.updatedAt)
    quotes.sort((a, b) => b.createdAt - a.createdAt)
    set({ movies, quotes, initialized: true })
  },

  addMovie: async (data) => {
    const db = await getDB()
    const now = Date.now()
    const movie: Movie = {
      id: uuid(),
      name: data.name,
      year: data.year,
      quoteCount: 0,
      coverImageId: null,
      createdAt: now,
      updatedAt: now,
    }
    await db.put('movies', movie)
    set((s) => ({ movies: [movie, ...s.movies] }))
    return movie
  },

  updateMovie: async (id, data) => {
    const db = await getDB()
    const existing = await db.get('movies', id)
    if (!existing) return
    const updated = { ...existing, ...data, updatedAt: Date.now() }
    await db.put('movies', updated)
    set((s) => ({
      movies: s.movies.map((m) => (m.id === id ? updated : m)),
    }))
  },

  deleteMovie: async (id) => {
    const db = await getDB()
    const movieQuotes = get().quotes.filter((q) => q.movieId === id)
    for (const q of movieQuotes) {
      if (q.imageId) {
        await db.delete('images', q.imageId)
      }
      await db.delete('quotes', q.id)
    }
    await db.delete('movies', id)
    set((s) => ({
      movies: s.movies.filter((m) => m.id !== id),
      quotes: s.quotes.filter((q) => q.movieId !== id),
    }))
  },

  addQuote: async (data) => {
    const db = await getDB()
    const now = Date.now()
    const quote: Quote = {
      id: uuid(),
      movieId: data.movieId,
      character: data.character,
      text: data.text,
      timestamp: data.timestamp,
      emotions: data.emotions,
      note: data.note,
      imageId: data.imageId,
      isExcerpt: data.isExcerpt,
      excerptStyle: data.excerptStyle,
      brightness: data.brightness ?? 100,
      cropArea: data.cropArea ?? null,
      showSubtitle: data.showSubtitle ?? false,
      subtitleText: data.subtitleText ?? '',
      createdAt: now,
      updatedAt: now,
    }
    await db.put('quotes', quote)

    const movie = await db.get('movies', data.movieId)
    if (movie) {
      const updatedMovie = {
        ...movie,
        quoteCount: movie.quoteCount + 1,
        coverImageId: data.imageId ?? movie.coverImageId,
        updatedAt: now,
      }
      await db.put('movies', updatedMovie)
      set((s) => ({
        quotes: [quote, ...s.quotes],
        movies: s.movies.map((m) =>
          m.id === data.movieId ? updatedMovie : m
        ),
      }))
    } else {
      set((s) => ({ quotes: [quote, ...s.quotes] }))
    }

    return quote
  },

  updateQuote: async (id, data) => {
    const db = await getDB()
    const existing = await db.get('quotes', id)
    if (!existing) return
    const updated = { ...existing, ...data, updatedAt: Date.now() }
    await db.put('quotes', updated)
    set((s) => ({
      quotes: s.quotes.map((q) => (q.id === id ? updated : q)),
    }))
  },

  deleteQuote: async (id) => {
    const db = await getDB()
    const quote = await db.get('quotes', id)
    if (!quote) return
    if (quote.imageId) {
      await db.delete('images', quote.imageId)
    }
    await db.delete('quotes', id)

    const movie = await db.get('movies', quote.movieId)
    if (movie) {
      const updatedMovie = {
        ...movie,
        quoteCount: Math.max(0, movie.quoteCount - 1),
        updatedAt: Date.now(),
      }
      await db.put('movies', updatedMovie)
      set((s) => ({
        quotes: s.quotes.filter((q) => q.id !== id),
        movies: s.movies.map((m) =>
          m.id === quote.movieId ? updatedMovie : m
        ),
      }))
    } else {
      set((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) }))
    }
  },

  saveImage: async (blob: Blob) => {
    const db = await getDB()
    const id = uuid()
    const imageData = {
      id,
      data: blob,
      type: blob.type,
      size: blob.size,
      createdAt: Date.now(),
    }
    await db.put('images', imageData)
    return id
  },

  getImageUrl: async (id: string | null) => {
    if (!id) return null
    const db = await getDB()
    const imageData = await db.get('images', id)
    if (!imageData) return null
    return URL.createObjectURL(imageData.data)
  },

  deleteImage: async (id) => {
    const db = await getDB()
    await db.delete('images', id)
  },

  filterQuotes: (filter: QuoteFilter) => {
    const { quotes } = get()
    return quotes.filter((q) => {
      if (filter.keyword) {
        const kw = filter.keyword.toLowerCase()
        if (
          !q.text.toLowerCase().includes(kw) &&
          !q.character.toLowerCase().includes(kw)
        )
          return false
      }
      if (filter.emotions.length > 0) {
        if (!filter.emotions.some((e) => q.emotions.includes(e))) return false
      }
      if (filter.character) {
        if (
          !q.character
            .toLowerCase()
            .includes(filter.character.toLowerCase())
        )
          return false
      }
      if (filter.yearFrom || filter.yearTo) {
        const movie = get().movies.find((m) => m.id === q.movieId)
        if (!movie) return false
        if (filter.yearFrom && movie.year < filter.yearFrom) return false
        if (filter.yearTo && movie.year > filter.yearTo) return false
      }
      return true
    })
  },

  getQuotesByMovie: (movieId: string) => {
    return get().quotes.filter((q) => q.movieId === movieId)
  },

  findOrCreateMovie: async (name: string, year: number) => {
    const existing = get().movies.find(
      (m) => m.name.toLowerCase() === name.toLowerCase() && m.year === year
    )
    if (existing) return existing
    return get().addMovie({ name, year })
  },
}))
