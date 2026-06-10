export type DrinkType = 'water' | 'coffee' | 'tea' | 'soda' | 'juice' | 'milk'

export type Scenario = 'exercise' | 'bedtime' | 'cold' | 'normal'

export interface Member {
  id: string
  name: string
  age: number
  dailyGoal: number
  cupCapacity: number
  limitWater: boolean
  reminderPeriods: string[]
  avatar: string
  color: string
}

export interface DrinkRecord {
  id: string
  memberId: string
  amount: number
  drinkType: DrinkType
  scenarios: Scenario[]
  timestamp: number
}

export const DRINK_TYPE_CONFIG: Record<DrinkType, { label: string; ratio: number; color: string }> = {
  water: { label: '白水', ratio: 1.0, color: '#4FC3F7' },
  coffee: { label: '咖啡', ratio: 0.6, color: '#795548' },
  tea: { label: '茶', ratio: 0.8, color: '#66BB6A' },
  soda: { label: '碳酸饮料', ratio: 0.4, color: '#FF7043' },
  juice: { label: '果汁', ratio: 0.5, color: '#FFA726' },
  milk: { label: '牛奶', ratio: 0.7, color: '#ECEFF1' },
}

export const SCENARIO_CONFIG: Record<Scenario, { label: string; emoji: string }> = {
  exercise: { label: '运动', emoji: '🏃' },
  bedtime: { label: '睡前', emoji: '🌙' },
  cold: { label: '感冒', emoji: '🤧' },
  normal: { label: '日常', emoji: '💧' },
}

export const MEMBER_COLORS = [
  '#4FC3F7', '#81C784', '#FF8A65', '#CE93D8',
  '#FFD54F', '#4DD0E1', '#A1887F', '#F06292',
]

export const MEMBER_AVATARS = [
  '👴', '👵', '👨', '👩', '👦', '👧', '👶', '🧑',
]

export function getEffectiveWater(amount: number, drinkType: DrinkType): number {
  return Math.round(amount * DRINK_TYPE_CONFIG[drinkType].ratio)
}
