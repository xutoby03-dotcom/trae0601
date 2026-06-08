export type Mood = 'tired' | 'annoyed' | 'happy' | 'insomnia' | 'want-cry' | 'want-learn' | 'want-empty'

export type TimeSlot = '20min' | '1hr' | 'evening'

export type MediaType = 'book' | 'movie' | 'series' | 'music'

export interface MediaItem {
  id: string
  title: string
  type: MediaType
  duration: number
  moods: Mood[]
  intensity: number
  consumed: boolean
  rating: number
  note: string
  createdAt: string
}

export interface ConsumptionRecord {
  id: string
  mediaId: string
  mood: Mood
  consumedAt: string
}

export interface BlindDrawRecord {
  id: string
  mediaId: string
  mood: Mood
  timeSlot: TimeSlot
  accepted: boolean
  swapReason?: string
  drawnAt: string
}

export const MOOD_CONFIG: Record<Mood, { emoji: string; label: string; color: string }> = {
  tired: { emoji: '😴', label: '累', color: '#6366f1' },
  annoyed: { emoji: '😤', label: '烦', color: '#ef4444' },
  happy: { emoji: '😊', label: '开心', color: '#f59e0b' },
  insomnia: { emoji: '🌙', label: '失眠', color: '#8b5cf6' },
  'want-cry': { emoji: '😢', label: '想哭', color: '#3b82f6' },
  'want-learn': { emoji: '🧠', label: '想学习', color: '#10b981' },
  'want-empty': { emoji: '🫧', label: '想放空', color: '#06b6d4' },
}

export const TIMESLOT_CONFIG: Record<TimeSlot, { label: string; maxMinutes: number }> = {
  '20min': { label: '20 分钟', maxMinutes: 20 },
  '1hr': { label: '1 小时', maxMinutes: 60 },
  evening: { label: '一个晚上', maxMinutes: 300 },
}

export const MEDIA_TYPE_CONFIG: Record<MediaType, { label: string; color: string; icon: string }> = {
  book: { label: '书', color: '#d97706', icon: '📖' },
  movie: { label: '电影', color: '#dc2626', icon: '🎬' },
  series: { label: '剧', color: '#7c3aed', icon: '📺' },
  music: { label: '音乐', color: '#059669', icon: '🎵' },
}

export const MOOD_REASONS: Record<Mood, string[]> = {
  tired: ['累了一天，让这个陪你缓缓', '放空一下吧，这个刚好', '别想太多，就看着就好'],
  annoyed: ['换个心情，试试这个', '让这个帮你散散气', '沉浸进去就忘了烦心事'],
  happy: ['开心的时候看这个更开心', '好心情配好内容', '趁心情好，来点有深度的'],
  insomnia: ['睡不着？这个陪你度过漫漫长夜', '安静地进入这个世界吧', '数羊不如看这个'],
  'want-cry': ['想哭就哭，这个会懂你', '痛快哭一场，这个很配', '准备好纸巾，这个很催泪'],
  'want-learn': ['学点东西吧，时间不等人', '这个能让你变强一点', '好奇心驱动的选择'],
  'want-empty': ['什么都不想，就看着', '让大脑休息，这个刚好', '放空专用，不用动脑'],
}
