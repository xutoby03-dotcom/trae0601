export interface Book {
  id: string
  title: string
  author: string
  themes: string[]
  ageRange: string
  pages: number
  coverUrl: string
  adultNote: string
  readCount: number
  lastReadAt: string
  createdAt: string
}

export interface ReadingSession {
  id: string
  bookId: string
  date: string
  duration: number
  childReaction: string
  favoriteCharacter: string
  questionsAsked: string
  focusScore: number
  happinessScore: number
  createdAt: string
}

export const THEME_PRESETS = [
  '害怕', '分享', '上幼儿园', '睡觉',
  '勇气', '友谊', '情绪管理', '自然',
  '家庭', '成长', '想象力', '幽默'
] as const

export const THEME_ICONS: Record<string, string> = {
  '害怕': '👻',
  '分享': '🤝',
  '上幼儿园': '🏫',
  '睡觉': '🌙',
  '勇气': '🦁',
  '友谊': '💛',
  '情绪管理': '🎭',
  '自然': '🌿',
  '家庭': '🏠',
  '成长': '🌱',
  '想象力': '✨',
  '幽默': '😂'
}

export const AGE_RANGES = ['0-1岁', '1-2岁', '2-3岁', '3-4岁', '4-5岁', '5-6岁', '6-8岁', '8岁+']

export const DEFAULT_COVER = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20children%20picture%20book%20cover%20with%20soft%20watercolor%20illustration%20of%20animals%20reading%20together%20warm%20pastel%20colors%20dreamy&image_size=portrait_4_3'
