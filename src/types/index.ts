export type PlantStatus = 'healthy' | 'thirsty' | 'yellowLeaf' | 'needsNutrients'

export type LightNeed = 'low' | 'medium' | 'high'

export type ObservationType = 'leafChange' | 'pest' | 'fertilize' | 'prune' | 'water' | 'repot'

export type AlertType = 'overwatering' | 'neglected' | 'yellowing' | 'pestWarning'

export interface Plant {
  id: string
  name: string
  desk: string
  area: string
  lightNeed: LightNeed
  wateringFrequencyDays: number
  lastSoilChange: string
  photo: string
  status: PlantStatus
  createdAt: string
  lastWateredAt: string
  isDead: boolean
}

export interface Adoption {
  id: string
  plantId: string
  userId: string
  userName: string
  wateringDays: number[]
  startDate: string
  endDate: string | null
  isTemporary: boolean
  originalAdoptionId: string | null
}

export interface ObservationLog {
  id: string
  plantId: string
  userId: string
  userName: string
  date: string
  type: ObservationType
  content: string
}

export interface PlantAlert {
  id: string
  plantId: string
  plantName: string
  type: AlertType
  message: string
  createdAt: string
  resolved: boolean
}

export interface Employee {
  id: string
  name: string
  avatar: string
  department: string
}

export const STATUS_LABELS: Record<PlantStatus, string> = {
  healthy: '健康',
  thirsty: '缺水',
  yellowLeaf: '黄叶',
  needsNutrients: '待领养分',
}

export const LIGHT_LABELS: Record<LightNeed, string> = {
  low: '低光照',
  medium: '中等光照',
  high: '强光照',
}

export const OBSERVATION_LABELS: Record<ObservationType, string> = {
  leafChange: '叶子变化',
  pest: '虫害',
  fertilize: '施肥',
  prune: '修剪',
  water: '浇水',
  repot: '换盆/换土',
}

export const ALERT_LABELS: Record<AlertType, string> = {
  overwatering: '过度浇水',
  neglected: '长期无人负责',
  yellowing: '黄叶警告',
  pestWarning: '虫害警告',
}

export const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const
