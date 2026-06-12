export type Category = 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessory'

export type ClothingColor =
  | 'black' | 'white' | 'red' | 'blue' | 'green'
  | 'yellow' | 'brown' | 'gray' | 'pink' | 'orange'
  | 'purple' | 'beige' | 'navy' | 'khaki'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export type Occasion = 'casual' | 'work' | 'date' | 'sport' | 'formal' | 'party'

export type WashStatus = 'clean' | 'dirty' | 'washing'

export type IdleAction = 'wash' | 'store' | 'discard'

export interface Clothing {
  id: string
  name: string
  category: Category
  color: ClothingColor
  seasons: Season[]
  occasions: Occasion[]
  lastWornDate: string
  washStatus: WashStatus
  photoUrl: string
  createdAt: string
}

export interface OutfitRecord {
  id: string
  date: string
  topId: string
  bottomId: string
  outerwearId: string
  shoesId: string
  occasion: Occasion | ''
  createdAt: string
}

export const CATEGORY_LABELS: Record<Category, string> = {
  top: '上衣',
  bottom: '下装',
  outerwear: '外套',
  shoes: '鞋子',
  accessory: '配饰',
}

export const COLOR_LABELS: Record<ClothingColor, string> = {
  black: '黑色',
  white: '白色',
  red: '红色',
  blue: '蓝色',
  green: '绿色',
  yellow: '黄色',
  brown: '棕色',
  gray: '灰色',
  pink: '粉色',
  orange: '橙色',
  purple: '紫色',
  beige: '米色',
  navy: '深蓝',
  khaki: '卡其',
}

export const COLOR_HEX: Record<ClothingColor, string> = {
  black: '#2D2D2D',
  white: '#FAFAFA',
  red: '#DC2626',
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#EAB308',
  brown: '#92400E',
  gray: '#9CA3AF',
  pink: '#EC4899',
  orange: '#F97316',
  purple: '#8B5CF6',
  beige: '#D4A574',
  navy: '#1E3A5F',
  khaki: '#C3B091',
}

export const SEASON_LABELS: Record<Season, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
}

export const OCCASION_LABELS: Record<Occasion, string> = {
  casual: '日常',
  work: '通勤',
  date: '约会',
  sport: '运动',
  formal: '正式',
  party: '聚会',
}

export const WASH_STATUS_LABELS: Record<WashStatus, string> = {
  clean: '已清洗',
  dirty: '待清洗',
  washing: '清洗中',
}

export const IDLE_ACTION_LABELS: Record<IdleAction, string> = {
  wash: '送洗',
  store: '收纳',
  discard: '淘汰',
}

export const COLOR_CLASHES: [ClothingColor, ClothingColor][] = [
  ['red', 'green'],
  ['red', 'pink'],
  ['purple', 'orange'],
  ['blue', 'green'],
  ['yellow', 'purple'],
  ['orange', 'pink'],
  ['navy', 'black'],
]

export function getColorsThatClash(color: ClothingColor): ClothingColor[] {
  return COLOR_CLASHES
    .filter(([a, b]) => a === color || b === color)
    .map(([a, b]) => (a === color ? b : a))
}
