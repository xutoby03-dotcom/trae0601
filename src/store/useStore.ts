import { create } from 'zustand'
import type { Book, ReadingSession } from '@/types'

interface BookStore {
  books: Book[]
  sessions: ReadingSession[]
  addBook: (book: Omit<Book, 'id' | 'readCount' | 'lastReadAt' | 'createdAt'>) => void
  updateBook: (id: string, updates: Partial<Book>) => void
  deleteBook: (id: string) => void
  addSession: (session: Omit<ReadingSession, 'id' | 'createdAt'>) => void
  deleteSession: (id: string) => void
  getBookSessions: (bookId: string) => ReadingSession[]
  getSessionsByDate: (date: string) => ReadingSession[]
  getMonthSessions: (yearMonth: string) => ReadingSession[]
}

const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36)

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

const saveToStorage = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // storage full or unavailable
  }
}

export const useStore = create<BookStore>((set, get) => ({
  books: loadFromStorage<Book[]>('picturebook-books', []),
  sessions: loadFromStorage<ReadingSession[]>('picturebook-sessions', []),

  addBook: (bookData) => {
    const now = new Date().toISOString()
    const book: Book = {
      ...bookData,
      id: generateId(),
      readCount: 0,
      lastReadAt: '',
      createdAt: now,
    }
    set((state) => {
      const books = [...state.books, book]
      saveToStorage('picturebook-books', books)
      return { books }
    })
  },

  updateBook: (id, updates) => {
    set((state) => {
      const books = state.books.map((b) => (b.id === id ? { ...b, ...updates } : b))
      saveToStorage('picturebook-books', books)
      return { books }
    })
  },

  deleteBook: (id) => {
    set((state) => {
      const books = state.books.filter((b) => b.id !== id)
      const sessions = state.sessions.filter((s) => s.bookId !== id)
      saveToStorage('picturebook-books', books)
      saveToStorage('picturebook-sessions', sessions)
      return { books, sessions }
    })
  },

  addSession: (sessionData) => {
    const now = new Date().toISOString()
    const session: ReadingSession = {
      ...sessionData,
      id: generateId(),
      createdAt: now,
    }
    set((state) => {
      const sessions = [...state.sessions, session]
      const books = state.books.map((b) => {
        if (b.id === sessionData.bookId) {
          return {
            ...b,
            readCount: b.readCount + 1,
            lastReadAt: sessionData.date,
          }
        }
        return b
      })
      saveToStorage('picturebook-books', books)
      saveToStorage('picturebook-sessions', sessions)
      return { books, sessions }
    })
  },

  deleteSession: (id) => {
    set((state) => {
      const session = state.sessions.find((s) => s.id === id)
      const sessions = state.sessions.filter((s) => s.id !== id)
      const books = session
        ? state.books.map((b) => {
            if (b.id === session.bookId) {
              return { ...b, readCount: Math.max(0, b.readCount - 1) }
            }
            return b
          })
        : state.books
      saveToStorage('picturebook-books', books)
      saveToStorage('picturebook-sessions', sessions)
      return { books, sessions }
    })
  },

  getBookSessions: (bookId) => {
    return get()
      .sessions.filter((s) => s.bookId === bookId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  getSessionsByDate: (date) => {
    return get().sessions.filter((s) => s.date === date)
  },

  getMonthSessions: (yearMonth) => {
    return get().sessions.filter((s) => s.date.startsWith(yearMonth))
  },
}))
