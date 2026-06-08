import type { MoodMode } from '@/types'

export const moodModes: MoodMode[] = [
  {
    id: 'sunshine',
    name: '想晒太阳',
    emoji: '☀️',
    tagFilters: ['晒太阳', '自然', '散步'],
  },
  {
    id: 'quiet',
    name: '想安静',
    emoji: '🤫',
    tagFilters: ['安静', '文艺', '阅读'],
  },
  {
    id: 'photo',
    name: '想拍照',
    emoji: '📸',
    tagFilters: ['拍照', '展览', '文艺'],
  },
  {
    id: 'food',
    name: '想吃东西',
    emoji: '😋',
    tagFilters: ['美食', '下午茶', '夜生活'],
  },
]
