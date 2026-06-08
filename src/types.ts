export interface Habit {
  id: string
  name: string
  icon: string
  frequency: 'daily' | 'weekly'
  targetPerWeek: number
  energyCost: 1 | 2 | 3 | 4 | 5
  color: string
  createdAt: string
  archived: boolean
}

export interface DailyRecord {
  date: string
  habitCompletions: Record<string, boolean>
  energy: 1 | 2 | 3 | 4 | 5
  mood: 1 | 2 | 3 | 4 | 5
  sleep: 1 | 2 | 3 | 4 | 5
  stress: 1 | 2 | 3 | 4 | 5
}

export interface HabitInsight {
  habitId: string
  habitName: string
  completionRate: number
  avgEnergyAfter: number
  avgEnergyOverall: number
  correlation: number
  suggestion: string
}

export interface WeeklyReview {
  weekStart: string
  weekEnd: string
  overallEnergy: number
  overallMood: number
  topHabits: string[]
  insights: HabitInsight[]
  summary: string[]
}

export const HABIT_ICONS = [
  '🌅', '🏃', '📚', '📱', '💧', '🧘', '✍️', '🍎', '😴', '🏋️',
  '🎵', '🌿', '💊', '🚶', '🎨', '🍳', '☕', '🧹', '📝', '🎯',
]

export const HABIT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#eab308', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
]

export const ENERGY_LABELS: Record<number, string> = {
  1: '极低',
  2: '偏低',
  3: '一般',
  4: '不错',
  5: '充沛',
}

export const MOOD_LABELS: Record<number, string> = {
  1: '很差',
  2: '低落',
  3: '平淡',
  4: '不错',
  5: '很好',
}

export const SLEEP_LABELS: Record<number, string> = {
  1: '极差',
  2: '较差',
  3: '一般',
  4: '良好',
  5: '极佳',
}

export const STRESS_LABELS: Record<number, string> = {
  1: '爆表',
  2: '很高',
  3: '有些',
  4: '轻微',
  5: '轻松',
}
