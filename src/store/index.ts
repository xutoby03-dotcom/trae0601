import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Book, CheckInRecord, RewardRule, RewardAchievement } from '@/types'
import { getLocalDateString, getYesterdayDateString, getDaysBetween } from '@/lib/utils'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

interface ReadingStore {
  books: Book[]
  checkIns: CheckInRecord[]
  rewardRules: RewardRule[]
  rewardAchievements: RewardAchievement[]

  addBook: (book: Omit<Book, 'id' | 'createdAt'>) => string
  updateBook: (id: string, book: Partial<Book>) => void
  deleteBook: (id: string) => void

  addCheckIn: (record: Omit<CheckInRecord, 'id' | 'createdAt'>) => CheckInRecord
  getTodayCheckIns: () => CheckInRecord[]
  getCheckInsByBook: (bookId: string) => CheckInRecord[]
  getCheckInsByDateRange: (start: string, end: string) => CheckInRecord[]

  addRewardRule: (rule: Omit<RewardRule, 'id' | 'createdAt'>) => void
  updateRewardRule: (id: string, rule: Partial<RewardRule>) => void
  deleteRewardRule: (id: string) => void
  addRewardAchievement: (achievement: Omit<RewardAchievement, 'id'>) => void

  getBookProgress: (bookId: string) => number
  getConsecutiveDays: (bookId: string) => number
  getOverallConsecutiveDays: () => number
  getLongestConsecutiveDays: () => number
  getMonthlyStats: (year: number, month: number) => {
    booksRead: number
    totalDuration: number
    totalCheckIns: number
    togetherCount: number
    independentCount: number
  }
  getFavoriteThemes: () => { theme: string; count: number }[]
  getStuckBooks: () => { bookId: string; lastReadDate: string; daysSinceLastRead: number; progress: number }[]
}

export const useReadingStore = create<ReadingStore>()(
  persist(
    (set, get) => ({
      books: [],
      checkIns: [],
      rewardRules: [],
      rewardAchievements: [],

      addBook: (bookData) => {
        const id = generateId()
        const book: Book = { ...bookData, id, createdAt: new Date().toISOString() }
        set((state) => ({ books: [...state.books, book] }))
        return id
      },

      updateBook: (id, updates) => {
        set((state) => ({
          books: state.books.map((b) => (b.id === id ? { ...b, ...updates } : b))
        }))
      },

      deleteBook: (id) => {
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
          checkIns: state.checkIns.filter((c) => c.bookId !== id)
        }))
      },

      addCheckIn: (recordData) => {
        const id = generateId()
        const record: CheckInRecord = { ...recordData, id, createdAt: new Date().toISOString() }
        set((state) => ({ checkIns: [...state.checkIns, record] }))

        const state = get()
        for (const rule of state.rewardRules) {
          if (!rule.enabled) continue
          if (rule.conditionType === 'consecutive_days') {
            const streak = state.getOverallConsecutiveDays()
            if (streak >= rule.conditionDays) {
              const alreadyAchieved = state.rewardAchievements.some(
                (a) => a.ruleId === rule.id
              )
              if (!alreadyAchieved) {
                state.addRewardAchievement({
                  ruleId: rule.id,
                  achievedAt: new Date().toISOString()
                })
              }
            }
          }
        }

        return record
      },

      getTodayCheckIns: () => {
        const today = getLocalDateString()
        return get().checkIns.filter((c) => c.date === today)
      },

      getCheckInsByBook: (bookId) => {
        return get()
          .checkIns.filter((c) => c.bookId === bookId)
          .sort((a, b) => b.date.localeCompare(a.date))
      },

      getCheckInsByDateRange: (start, end) => {
        return get().checkIns.filter((c) => c.date >= start && c.date <= end)
      },

      addRewardRule: (ruleData) => {
        const id = generateId()
        const rule: RewardRule = { ...ruleData, id, createdAt: new Date().toISOString() }
        set((state) => ({ rewardRules: [...state.rewardRules, rule] }))
      },

      updateRewardRule: (id, updates) => {
        set((state) => ({
          rewardRules: state.rewardRules.map((r) => (r.id === id ? { ...r, ...updates } : r))
        }))
      },

      deleteRewardRule: (id) => {
        set((state) => ({
          rewardRules: state.rewardRules.filter((r) => r.id !== id),
          rewardAchievements: state.rewardAchievements.filter((a) => a.ruleId !== id)
        }))
      },

      addRewardAchievement: (achievement) => {
        const a: RewardAchievement = { ...achievement, id: generateId() }
        set((state) => ({ rewardAchievements: [...state.rewardAchievements, a] }))
      },

      getBookProgress: (bookId) => {
        const state = get()
        const book = state.books.find((b) => b.id === bookId)
        if (!book) return 0
        const checkIns = state.checkIns.filter((c) => c.bookId === bookId)
        if (checkIns.length === 0) return 0
        const maxPage = Math.max(...checkIns.map((c) => c.currentPage))
        return Math.min(maxPage / book.totalPages, 1)
      },

      getConsecutiveDays: (bookId) => {
        const state = get()
        const checkIns = state.checkIns
          .filter((c) => c.bookId === bookId)
          .map((c) => c.date)
          .sort()
          .reverse()

        if (checkIns.length === 0) return 0

        const uniqueDates = [...new Set(checkIns)]
        let streak = 1
        const today = getLocalDateString()

        if (uniqueDates[0] !== today) {
          const yesterday = getYesterdayDateString()
          if (uniqueDates[0] !== yesterday) return 0
        }

        for (let i = 1; i < uniqueDates.length; i++) {
          const diff = getDaysBetween(uniqueDates[i - 1], uniqueDates[i])
          if (diff === 1) {
            streak++
          } else {
            break
          }
        }
        return streak
      },

      getOverallConsecutiveDays: () => {
        const state = get()
        const allDates = [...new Set(state.checkIns.map((c) => c.date))].sort().reverse()

        if (allDates.length === 0) return 0

        let streak = 1
        const today = getLocalDateString()

        if (allDates[0] !== today) {
          const yesterday = getYesterdayDateString()
          if (allDates[0] !== yesterday) return 0
        }

        for (let i = 1; i < allDates.length; i++) {
          const diff = getDaysBetween(allDates[i - 1], allDates[i])
          if (diff === 1) {
            streak++
          } else {
            break
          }
        }
        return streak
      },

      getLongestConsecutiveDays: () => {
        const state = get()
        const allDates = [...new Set(state.checkIns.map((c) => c.date))].sort()

        if (allDates.length === 0) return 0

        let longest = 1
        let current = 1

        for (let i = 1; i < allDates.length; i++) {
          const diff = getDaysBetween(allDates[i], allDates[i - 1])
          if (diff === 1) {
            current++
            longest = Math.max(longest, current)
          } else if (diff > 1) {
            current = 1
          }
        }
        return longest
      },

      getMonthlyStats: (year, month) => {
        const state = get()
        const start = `${year}-${String(month).padStart(2, '0')}-01`
        const lastDay = new Date(year, month, 0).getDate()
        const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

        const monthCheckIns = state.checkIns.filter((c) => c.date >= start && c.date <= end)

        const uniqueBookIds = new Set(monthCheckIns.map((c) => c.bookId))
        const completedBookIds = new Set<string>()
        for (const bookId of uniqueBookIds) {
          const book = state.books.find((b) => b.id === bookId)
          if (book) {
            const bookCheckIns = monthCheckIns.filter((c) => c.bookId === bookId)
            const maxPage = Math.max(...bookCheckIns.map((c) => c.currentPage))
            if (maxPage >= book.totalPages) completedBookIds.add(bookId)
          }
        }

        return {
          booksRead: completedBookIds.size,
          totalDuration: monthCheckIns.reduce((sum, c) => sum + c.duration, 0),
          totalCheckIns: monthCheckIns.length,
          togetherCount: monthCheckIns.filter((c) => c.readingType === 'together').length,
          independentCount: monthCheckIns.filter((c) => c.readingType === 'independent').length
        }
      },

      getFavoriteThemes: () => {
        const state = get()
        const themeCount: Record<string, number> = {}
        for (const checkIn of state.checkIns) {
          const book = state.books.find((b) => b.id === checkIn.bookId)
          if (book) {
            themeCount[book.theme] = (themeCount[book.theme] || 0) + 1
          }
        }
        return Object.entries(themeCount)
          .map(([theme, count]) => ({ theme, count }))
          .sort((a, b) => b.count - a.count)
      },

      getStuckBooks: () => {
        const state = get()
        const today = getLocalDateString()
        const result: { bookId: string; lastReadDate: string; daysSinceLastRead: number; progress: number }[] = []

        for (const book of state.books) {
          const bookCheckIns = state.checkIns.filter((c) => c.bookId === book.id)
          if (bookCheckIns.length === 0) continue

          const progress = state.getBookProgress(book.id)
          if (progress >= 1) continue

          const lastDate = bookCheckIns.sort((a, b) => b.date.localeCompare(a.date))[0].date
          const daysSince = getDaysBetween(today, lastDate)

          if (daysSince >= 3) {
            result.push({ bookId: book.id, lastReadDate: lastDate, daysSinceLastRead: daysSince, progress })
          }
        }

        return result.sort((a, b) => b.daysSinceLastRead - a.daysSinceLastRead)
      }
    }),
    {
      name: 'reading-app-storage'
    }
  )
)
