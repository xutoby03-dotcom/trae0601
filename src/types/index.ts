export interface Trip {
  id: string
  title: string
  coverImage: string
  startDate: string
  endDate: string
  description: string
}

export interface Day {
  id: string
  tripId: string
  date: string
  location: string
  weather: Weather
  totalCost: number
}

export interface Photo {
  id: string
  dayId: string
  url: string
  location: string
  date: string
  companions: string
  cost: number
  weather: Weather
  story: string
  tags: TagName[]
}

export interface Tag {
  id: string
  photoId: string
  name: TagName
  color: string
}

export type TagName = '美食' | '风景' | '交通' | '踩坑' | '惊喜'
export type StoryStyle = '轻松' | '纪念' | '攻略'
export type Weather = '晴' | '多云' | '阴' | '小雨' | '大雨' | '雪' | '雾'

export const TAG_CONFIG: Record<TagName, { color: string; bg: string; emoji: string }> = {
  '美食': { color: '#FF6B6B', bg: '#FFE8E8', emoji: '🍜' },
  '风景': { color: '#4ECDC4', bg: '#E0F7F5', emoji: '🏔️' },
  '交通': { color: '#45B7D1', bg: '#E0F2F8', emoji: '🚄' },
  '踩坑': { color: '#96CEB4', bg: '#E8F5EE', emoji: '⚠️' },
  '惊喜': { color: '#FFB347', bg: '#FFF3E0', emoji: '✨' },
}

export const WEATHER_ICONS: Record<Weather, string> = {
  '晴': '☀️',
  '多云': '⛅',
  '阴': '☁️',
  '小雨': '🌧️',
  '大雨': '⛈️',
  '雪': '❄️',
  '雾': '🌫️',
}

export const ALL_TAGS: TagName[] = ['美食', '风景', '交通', '踩坑', '惊喜']
export const ALL_WEATHERS: Weather[] = ['晴', '多云', '阴', '小雨', '大雨', '雪', '雾']
