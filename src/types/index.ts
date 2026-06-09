export interface Book {
  id: string
  title: string
  ageRange: string
  totalPages: number
  theme: string
  difficulty: 'easy' | 'medium' | 'hard'
  coverUrl: string
  createdAt: string
}

export interface CheckInRecord {
  id: string
  bookId: string
  date: string
  duration: number
  currentPage: number
  enjoyment: 1 | 2 | 3 | 4 | 5
  retelling: string
  readingType: 'together' | 'independent'
  createdAt: string
}

export interface RewardRule {
  id: string
  name: string
  description: string
  conditionType: 'consecutive_days'
  conditionDays: number
  reward: string
  enabled: boolean
  createdAt: string
}

export interface RewardAchievement {
  id: string
  ruleId: string
  achievedAt: string
}

export const BOOK_THEMES = [
  '童话', '科普', '历史', '冒险', '成长',
  '动物', '自然', '艺术', '数学', '情感',
  '神话', '科幻', '传记', '诗歌', '生活'
] as const

export const DIFFICULTY_LABELS: Record<Book['difficulty'], string> = {
  easy: '简单',
  medium: '中等',
  hard: '较难'
}

export const DIFFICULTY_COLORS: Record<Book['difficulty'], string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700'
}
