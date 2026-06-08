import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Habit,
  DailyRecord,
  WeeklyReview,
  HabitInsight,
  HABIT_ICONS,
  HABIT_COLORS,
} from '../types'
import { generateId } from '../utils/analysis'
import { calcCorrelation, generateInsight, getWeekDates } from '../utils/analysis'
import { formatDate } from '../utils/date'

interface HabitStore {
  habits: Habit[]
  records: Record<string, DailyRecord>
  reviews: WeeklyReview[]

  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  archiveHabit: (id: string) => void
  deleteHabit: (id: string) => void

  upsertRecord: (date: string, record: Partial<DailyRecord>) => void
  getRecord: (date: string) => DailyRecord | undefined
  toggleHabitCompletion: (date: string, habitId: string) => void

  generateReview: (weekStart?: string) => WeeklyReview
  getLatestReview: () => WeeklyReview | undefined
}

const defaultRecord = (date: string): DailyRecord => ({
  date,
  habitCompletions: {},
  energy: 3,
  mood: 3,
  sleep: 3,
  stress: 3,
})

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      records: {},
      reviews: [],

      addHabit: (habit) => {
        const newHabit: Habit = {
          ...habit,
          id: generateId(),
          createdAt: new Date().toISOString(),
          archived: false,
        }
        set((s) => ({ habits: [...s.habits, newHabit] }))
      },

      updateHabit: (id, updates) => {
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }))
      },

      archiveHabit: (id) => {
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, archived: !h.archived } : h
          ),
        }))
      },

      deleteHabit: (id) => {
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
        }))
      },

      upsertRecord: (date, partial) => {
        set((s) => {
          const existing = s.records[date] || defaultRecord(date)
          return {
            records: {
              ...s.records,
              [date]: { ...existing, ...partial, date },
            },
          }
        })
      },

      getRecord: (date) => {
        return get().records[date]
      },

      toggleHabitCompletion: (date, habitId) => {
        set((s) => {
          const existing = s.records[date] || defaultRecord(date)
          const current = existing.habitCompletions[habitId] || false
          return {
            records: {
              ...s.records,
              [date]: {
                ...existing,
                date,
                habitCompletions: {
                  ...existing.habitCompletions,
                  [habitId]: !current,
                },
              },
            },
          }
        })
      },

      generateReview: (weekStart?) => {
        const state = get()
        const start = weekStart || getWeekDates(new Date())[0]
        const weekDates = getWeekDates(new Date(start))
        const weekEnd = weekDates[6]

        const activeHabits = state.habits.filter((h) => !h.archived)
        const weekRecords = weekDates
          .map((d) => state.records[d])
          .filter(Boolean) as DailyRecord[]

        const overallEnergy =
          weekRecords.length > 0
            ? weekRecords.reduce((s, r) => s + r.energy, 0) / weekRecords.length
            : 3
        const overallMood =
          weekRecords.length > 0
            ? weekRecords.reduce((s, r) => s + r.mood, 0) / weekRecords.length
            : 3

        const insights: HabitInsight[] = activeHabits.map((habit) => {
          const totalDays = weekRecords.length
          const completedDays = weekRecords.filter(
            (r) => r.habitCompletions[habit.id]
          ).length
          const completionRate = totalDays > 0 ? completedDays / totalDays : 0

          const energyAfterHabit = weekRecords
            .filter((r) => r.habitCompletions[habit.id])
            .map((r) => r.energy)
          const avgEnergyAfter =
            energyAfterHabit.length > 0
              ? energyAfterHabit.reduce((a, b) => a + b, 0) /
                energyAfterHabit.length
              : overallEnergy

          const habitCompletionBinary = weekRecords.map(
            (r) => (r.habitCompletions[habit.id] ? 1 : 0)
          )
          const energyValues = weekRecords.map((r) => r.energy)
          const correlation = calcCorrelation(habitCompletionBinary, energyValues)

          const suggestion = generateInsight(
            completionRate,
            avgEnergyAfter,
            overallEnergy,
            correlation,
            habit.name
          )

          return {
            habitId: habit.id,
            habitName: habit.name,
            completionRate,
            avgEnergyAfter,
            avgEnergyOverall: overallEnergy,
            correlation,
            suggestion,
          }
        })

        const topHabits = insights
          .filter((i) => i.correlation > 0.2)
          .sort((a, b) => b.correlation - a.correlation)
          .map((i) => i.habitName)

        const summary: string[] = []

        if (overallEnergy >= 4) {
          summary.push('本周整体精力状态不错，继续保持！')
        } else if (overallEnergy >= 3) {
          summary.push('本周精力状态一般，还有提升空间。')
        } else {
          summary.push('本周精力偏低，注意休息和调整节奏。')
        }

        const positiveHabits = insights.filter(
          (i) => i.correlation > 0.3 && i.completionRate >= 0.5
        )
        if (positiveHabits.length > 0) {
          summary.push(
            `${positiveHabits.map((h) => h.habitName).join('、')}对状态有正面影响，值得坚持。`
          )
        }

        const hardHabits = insights.filter(
          (i) => i.completionRate < 0.3 && i.completionRate > 0
        )
        if (hardHabits.length > 0) {
          summary.push(
            `${hardHabits.map((h) => h.habitName).join('、')}完成率较低，考虑调整目标。`
          )
        }

        const negativeHabits = insights.filter(
          (i) => i.correlation < -0.3 && i.completionRate >= 0.4
        )
        if (negativeHabits.length > 0) {
          summary.push(
            `${negativeHabits.map((h) => h.habitName).join('、')}可能消耗过多精力，注意适度。`
          )
        }

        const lowCompletion = insights.filter((i) => i.completionRate === 0)
        if (lowCompletion.length > 0) {
          summary.push(
            `${lowCompletion.map((h) => h.habitName).join('、')}本周完全没做，需要重新评估是否保留。`
          )
        }

        const review: WeeklyReview = {
          weekStart: start,
          weekEnd,
          overallEnergy,
          overallMood,
          topHabits,
          insights,
          summary,
        }

        set((s) => ({
          reviews: [
            ...s.reviews.filter((r) => r.weekStart !== start),
            review,
          ],
        }))

        return review
      },

      getLatestReview: () => {
        const reviews = get().reviews
        if (reviews.length === 0) return undefined
        return reviews.sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0]
      },
    }),
    {
      name: 'habit-energy-map-storage',
    }
  )
)
