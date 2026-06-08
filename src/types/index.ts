export interface Movie {
  id: string
  name: string
  year: number
  quoteCount: number
  coverImageId: string | null
  createdAt: number
  updatedAt: number
}

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
  unit: string
}

export interface Quote {
  id: string
  movieId: string
  character: string
  text: string
  timestamp: string
  emotions: string[]
  note: string
  imageId: string | null
  isExcerpt: boolean
  excerptStyle: string
  brightness: number
  cropArea: CropArea | null
  showSubtitle: boolean
  subtitleText: string
  createdAt: number
  updatedAt: number
}

export interface ImageData {
  id: string
  data: Blob
  type: string
  size: number
  createdAt: number
}

export interface QuoteFilter {
  keyword: string
  emotions: string[]
  character: string
  yearFrom: number | null
  yearTo: number | null
}

export const EMOTIONS = [
  '感动',
  '励志',
  '忧郁',
  '热血',
  '浪漫',
  '幽默',
  '悲伤',
  '哲理',
  '温暖',
  '震撼',
  '讽刺',
  '孤独',
] as const

export type Emotion = (typeof EMOTIONS)[number]

export const EMOTION_COLORS: Record<string, string> = {
  '感动': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  '励志': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  '忧郁': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  '热血': 'bg-red-600/20 text-red-400 border-red-600/30',
  '浪漫': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  '幽默': 'bg-green-500/20 text-green-300 border-green-500/30',
  '悲伤': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  '哲理': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  '温暖': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  '震撼': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  '讽刺': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  '孤独': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
}

export const EXCERPT_STYLES = [
  { id: 'cinema', name: '影院经典' },
  { id: 'typewriter', name: '打字机' },
  { id: 'neon', name: '霓虹灯' },
  { id: 'minimal', name: '极简' },
] as const
