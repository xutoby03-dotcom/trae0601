export type GearType = 'running_shoe' | 'racket' | 'bicycle' | 'yoga_mat' | 'other'
export type GearStatus = 'good' | 'due_soon' | 'overdue' | 'retired'
export type UsageUnit = 'km' | 'hours' | 'times'
export type UsageFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'

export interface Gear {
  id: string
  name: string
  type: GearType
  purchaseDate: string
  price: number
  usageFrequency: UsageFrequency
  maintenanceCycleDays: number
  maxUsage: number
  maxUsageUnit: UsageUnit
  photo: string
  lastMaintenanceDate: string
  createdAt: string
}

export interface UsageRecord {
  id: string
  gearId: string
  date: string
  duration: number
  distance: number
  count: number
  note: string
}

export interface MaintenanceRecord {
  id: string
  gearId: string
  date: string
  type: string
  note: string
}

export interface MaintenanceTemplate {
  gearType: GearType
  name: string
  cycleDays: number
  maxUsage: number
  maxUsageUnit: UsageUnit
  steps: string[]
  tools: string[]
}

export const GEAR_TYPE_LABELS: Record<GearType, string> = {
  running_shoe: '跑鞋',
  racket: '球拍',
  bicycle: '自行车',
  yoga_mat: '瑜伽垫',
  other: '其他',
}

export const GEAR_TYPE_ICONS: Record<GearType, string> = {
  running_shoe: '👟',
  racket: '🎾',
  bicycle: '🚲',
  yoga_mat: '🧘',
  other: '🎒',
}

export const USAGE_UNIT_LABELS: Record<UsageUnit, string> = {
  km: '公里',
  hours: '小时',
  times: '次',
}

export const FREQUENCY_LABELS: Record<UsageFrequency, string> = {
  daily: '每天',
  weekly: '每周',
  biweekly: '每两周',
  monthly: '每月',
}

export const STATUS_LABELS: Record<GearStatus, string> = {
  good: '状态良好',
  due_soon: '需保养',
  overdue: '已超期',
  retired: '已退役',
}
