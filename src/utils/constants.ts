import type { RoastLevel, ProcessMethod, GrindSize } from '@/types'

export const ROAST_LEVELS: { value: RoastLevel; label: string }[] = [
  { value: 'light', label: '浅焙' },
  { value: 'medium-light', label: '中浅焙' },
  { value: 'medium', label: '中焙' },
  { value: 'medium-dark', label: '中深焙' },
  { value: 'dark', label: '深焙' },
]

export const PROCESS_METHODS: { value: ProcessMethod; label: string }[] = [
  { value: 'washed', label: '水洗' },
  { value: 'natural', label: '日晒' },
  { value: 'honey', label: '蜜处理' },
  { value: 'anaerobic', label: '厌氧' },
  { value: 'other', label: '其他' },
]

export const GRIND_SIZES: { value: GrindSize; label: string }[] = [
  { value: 'fine', label: '细' },
  { value: 'medium-fine', label: '中细' },
  { value: 'medium', label: '中' },
  { value: 'medium-coarse', label: '中粗' },
  { value: 'coarse', label: '粗' },
]

export const EQUIPMENT_OPTIONS = [
  '手冲', 'V60', 'Chemex', '法压壶', '虹吸壶', '爱乐压', '意式', '摩卡壶', '其他',
]

export const ROAST_COLORS: Record<RoastLevel, { bg: string; band: string; text: string }> = {
  'light': { bg: '#FFF8F0', band: '#E8C9A0', text: '#8B6914' },
  'medium-light': { bg: '#F5E6D3', band: '#D4A574', text: '#6F4E37' },
  'medium': { bg: '#E8D5BC', band: '#B8864E', text: '#5C3A1E' },
  'medium-dark': { bg: '#C4A882', band: '#8B6914', text: '#3E2412' },
  'dark': { bg: '#6F4E37', band: '#3E2412', text: '#F5E6D3' },
}

export const FLAVOR_KEYS = ['acidity', 'sweetness', 'bitterness', 'body', 'aroma'] as const

export const FLAVOR_LABELS: Record<string, string> = {
  acidity: '酸度',
  sweetness: '甜度',
  bitterness: '苦度',
  body: '醇厚度',
  aroma: '香气',
}
