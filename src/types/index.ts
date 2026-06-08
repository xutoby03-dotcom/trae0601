export type PotSize = 'small' | 'medium' | 'large'
export type LightPosition = 'full-sun' | 'partial-sun' | 'shade'
export type ObservationType = 'growth' | 'flowering' | 'fruiting' | 'yellowing' | 'pest' | 'fertilizing' | 'repotting' | 'other'

export interface Plant {
  id: string
  name: string
  variety: string
  sowingDate: string
  potSize: PotSize
  soilType: string
  lightPosition: LightPosition
  wateringFrequencyDays: number
  lastWatered: string
  lastFertilized: string
  fertilizeFrequencyDays: number
  gridRow: number
  gridCol: number
  photo: string
  createdAt: string
}

export interface Observation {
  id: string
  plantId: string
  type: ObservationType
  description: string
  heightCm: number | null
  pestDescription: string | null
  fertilizerType: string | null
  fertilizerAmount: string | null
  newPotSize: string | null
  photos: string[]
  observedAt: string
  createdAt: string
}

export interface Harvest {
  id: string
  plantId: string
  harvestDate: string
  weightGrams: number
  tasteRating: number
  notes: string
  createdAt: string
}

export const VARIETY_PRESETS = [
  { name: '番茄', emoji: '🍅' },
  { name: '薄荷', emoji: '🌿' },
  { name: '辣椒', emoji: '🌶️' },
  { name: '生菜', emoji: '🥬' },
  { name: '黄瓜', emoji: '🥒' },
  { name: '小葱', emoji: '🧅' },
  { name: '草莓', emoji: '🍓' },
  { name: '罗勒', emoji: '🌱' },
  { name: '茄子', emoji: '🍆' },
  { name: '豆角', emoji: '🫛' },
] as const

export const OBSERVATION_TYPE_CONFIG: Record<ObservationType, { label: string; emoji: string; color: string }> = {
  growth: { label: '长高', emoji: '📈', color: 'leaf' },
  flowering: { label: '开花', emoji: '🌸', color: 'mint' },
  fruiting: { label: '结果', emoji: '🥗', color: 'chili' },
  yellowing: { label: '叶片异常', emoji: '🍂', color: 'earth' },
  pest: { label: '虫害', emoji: '🐛', color: 'tomato' },
  fertilizing: { label: '施肥', emoji: '💧', color: 'dew' },
  repotting: { label: '换盆', emoji: '🪴', color: 'wood' },
  other: { label: '其他', emoji: '📝', color: 'earth' },
}

export const POT_SIZE_LABELS: Record<PotSize, string> = {
  small: '小盆 (< 15cm)',
  medium: '中盆 (15-25cm)',
  large: '大盆 (> 25cm)',
}

export const LIGHT_POSITION_LABELS: Record<LightPosition, string> = {
  'full-sun': '全日照 ☀️',
  'partial-sun': '半日照 🌤️',
  'shade': '阴凉 🌥️',
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

export function isWaterNeeded(plant: Plant): boolean {
  if (!plant.lastWatered) return true
  const daysSinceWater = getDaysSince(plant.lastWatered)
  return daysSinceWater >= plant.wateringFrequencyDays
}

export function isFertilizeNeeded(plant: Plant): boolean {
  if (!plant.lastFertilized || !plant.fertilizeFrequencyDays) return false
  const daysSinceFertilizer = getDaysSince(plant.lastFertilized)
  return daysSinceFertilizer >= plant.fertilizeFrequencyDays
}

export function hasRecentPest(observations: Observation[]): boolean {
  const recentCutoff = new Date()
  recentCutoff.setDate(recentCutoff.getDate() - 7)
  return observations.some(
    o => o.type === 'pest' && new Date(o.observedAt) >= recentCutoff
  )
}
