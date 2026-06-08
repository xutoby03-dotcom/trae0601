export type ClothingCategory = 'tops' | 'pants' | 'outerwear' | 'shoes' | 'accessories'
export type ClothingColor = 'black' | 'white' | 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'navy' | 'purple' | 'pink' | 'brown' | 'beige' | 'khaki' | 'denim' | 'multicolor'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all'
export type Thickness = 'thin' | 'medium' | 'thick'
export type Occasion = 'casual' | 'work' | 'formal' | 'sport' | 'date' | 'party'
export type WashStatus = 'clean' | 'worn_once' | 'worn_twice' | 'needs_wash' | 'washing'

export interface ClothingItem {
  id: string
  name: string
  photo: string
  category: ClothingCategory
  color: ClothingColor
  season: Season[]
  thickness: Thickness
  occasion: Occasion[]
  price: number
  washStatus: WashStatus
  wearCount: number
  createdAt: string
}

export interface Outfit {
  id: string
  name: string
  items: string[]
  date: string
  createdAt: string
}

export interface WeatherCondition {
  temperature: number
  isRaining: boolean
  isFormal: boolean
}

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  tops: '上衣',
  pants: '裤子',
  outerwear: '外套',
  shoes: '鞋子',
  accessories: '配饰',
}

export const COLOR_LABELS: Record<ClothingColor, string> = {
  black: '黑色', white: '白色', gray: '灰色', red: '红色',
  orange: '橙色', yellow: '黄色', green: '绿色', blue: '蓝色',
  navy: '藏蓝', purple: '紫色', pink: '粉色', brown: '棕色',
  beige: '米色', khaki: '卡其', denim: '牛仔', multicolor: '多彩',
}

export const SEASON_LABELS: Record<Season, string> = {
  spring: '春', summer: '夏', autumn: '秋', winter: '冬', all: '四季',
}

export const THICKNESS_LABELS: Record<Thickness, string> = {
  thin: '薄', medium: '中', thick: '厚',
}

export const OCCASION_LABELS: Record<Occasion, string> = {
  casual: '日常', work: '通勤', formal: '正式', sport: '运动', date: '约会', party: '聚会',
}

export const WASH_STATUS_LABELS: Record<WashStatus, string> = {
  clean: '干净', worn_once: '穿过1次', worn_twice: '穿过2次', needs_wash: '待洗', washing: '洗涤中',
}

export const COLOR_HEX: Record<ClothingColor, string> = {
  black: '#1a1a1a', white: '#f5f5f5', gray: '#9e9e9e', red: '#e53935',
  orange: '#ff9800', yellow: '#fdd835', green: '#43a047', blue: '#1e88e5',
  navy: '#283593', purple: '#8e24aa', pink: '#ec407a', brown: '#6d4c41',
  beige: '#d7ccc8', khaki: '#c5b358', denim: '#5c7faa', multicolor: 'linear-gradient(135deg, #e53935, #1e88e5, #43a047, #fdd835)',
}
