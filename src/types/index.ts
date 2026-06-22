export type CellMaterial =
  | 'bamboo'
  | 'wood'
  | 'pinecone'
  | 'straw'
  | 'hollowStem'
  | 'bark'
  | 'stone'
  | 'moss'
  | 'corrugated'
  | 'drilledWood'

export type Orientation =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'northeast'
  | 'northwest'
  | 'southeast'
  | 'southwest'

export type HeightLevel = 'ground' | 'low' | 'middle' | 'high'

export type OccupancyStatus = 'empty' | 'underObservation' | 'occupied'

export type VisitorType = 'bee' | 'ladybug' | 'butterfly' | 'beetle' | 'spider' | 'ant' | 'other'

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy'

export interface Cell {
  id: string
  cellNumber: string
  material: CellMaterial
  orientation: Orientation
  height: HeightLevel
  hasRainProtection: boolean
  surroundingPlants: string[]
  status: OccupancyStatus
  registeredAt: string
  lastObservedAt: string | null
}

export interface Observation {
  id: string
  cellId: string
  observationDate: string
  hasSeal: boolean
  hasBiteMarks: boolean
  hasEmergenceHole: boolean
  visitorTypes: VisitorType[]
  weather: WeatherType
  notes: string
  recorder: string
}

export interface MaterialAlert {
  material: CellMaterial
  materialName: string
  unusedDays: number
  cellCount: number
  suggestion: string
}

export interface TrendDataPoint {
  date: string
  occupied: number
  underObservation: number
  empty: number
}

export interface MaterialStat {
  material: CellMaterial
  materialName: string
  totalCells: number
  occupiedCells: number
  occupancyRate: number
}

export const MATERIAL_NAMES: Record<CellMaterial, string> = {
  bamboo: '竹子',
  wood: '原木',
  pinecone: '松果',
  straw: '稻草',
  hollowStem: '空心茎',
  bark: '树皮',
  stone: '石块',
  moss: '苔藓',
  corrugated: '瓦楞纸',
  drilledWood: '钻孔木',
}

export const ORIENTATION_NAMES: Record<Orientation, string> = {
  north: '北',
  south: '南',
  east: '东',
  west: '西',
  northeast: '东北',
  northwest: '西北',
  southeast: '东南',
  southwest: '西南',
}

export const HEIGHT_NAMES: Record<HeightLevel, string> = {
  ground: '地面层',
  low: '低层',
  middle: '中层',
  high: '高层',
}

export const STATUS_NAMES: Record<OccupancyStatus, string> = {
  empty: '空置',
  underObservation: '观察中',
  occupied: '已入住',
}

export const VISITOR_NAMES: Record<VisitorType, string> = {
  bee: '蜜蜂',
  ladybug: '瓢虫',
  butterfly: '蝴蝶',
  beetle: '甲虫',
  spider: '蜘蛛',
  ant: '蚂蚁',
  other: '其他',
}

export const WEATHER_NAMES: Record<WeatherType, string> = {
  sunny: '晴天',
  cloudy: '多云',
  rainy: '雨天',
  windy: '大风',
  stormy: '暴风雨',
}

export const WEATHER_EMOJIS: Record<WeatherType, string> = {
  sunny: '☀️',
  cloudy: '⛅',
  rainy: '🌧️',
  windy: '💨',
  stormy: '⛈️',
}

export const VISITOR_EMOJIS: Record<VisitorType, string> = {
  bee: '🐝',
  ladybug: '🐞',
  butterfly: '🦋',
  beetle: '🪲',
  spider: '🕷️',
  ant: '🐜',
  other: '🐛',
}

export const PLANT_OPTIONS = [
  '向日葵',
  '薰衣草',
  '玫瑰',
  '薄荷',
  '三叶草',
  '蒲公英',
  '波斯菊',
  '万寿菊',
  '月季',
  '灌木',
  '草坪',
  '树木',
]
