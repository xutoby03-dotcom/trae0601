export interface Purifier {
  id: string
  brand: string
  model: string
  installDate: string
  purchaseLink: string
}

export type FilterType = 'PP棉' | '活性炭' | 'RO膜' | '超滤膜' | '后置炭' | '其他'

export interface FilterConfig {
  id: string
  purifierId: string
  filterType: FilterType
  suggestedLifespanDays: number
  purchaseLink: string
}

export interface ReplacementRecord {
  id: string
  filterConfigId: string
  purifierId: string
  replaceDate: string
  cost: number
}

export type OdorLevel = 'none' | 'mild' | 'obvious'

export interface WaterQualityLog {
  id: string
  purifierId: string
  logDate: string
  flowRate: number
  tdsValue: number
  odorLevel: OdorLevel
}

export type FilterStatus = 'normal' | 'warning' | 'expired'

export interface FilterWithStatus extends FilterConfig {
  purifier: Purifier
  remainingDays: number
  remainingPercent: number
  status: FilterStatus
  lastReplaceDate: string | null
}

export const FILTER_TYPE_OPTIONS: FilterType[] = ['PP棉', '活性炭', 'RO膜', '超滤膜', '后置炭', '其他']

export const FILTER_TYPE_COLORS: Record<FilterType, string> = {
  'PP棉': '#94a3b8',
  '活性炭': '#78716c',
  'RO膜': '#0d9488',
  '超滤膜': '#06b6d4',
  '后置炭': '#a3a3a3',
  '其他': '#737373',
}

export const FILTER_TYPE_ICONS: Record<FilterType, string> = {
  'PP棉': '🧶',
  '活性炭': '⚫',
  'RO膜': '🔬',
  '超滤膜': '💧',
  '后置炭': '🫧',
  '其他': '🔧',
}
