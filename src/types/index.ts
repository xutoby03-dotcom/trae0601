export type ScreenCondition = 'intact' | 'scratched' | 'cracked'
export type PhoneGroup = 'recyclable' | 'backup' | 'parts'
export type ChannelType = 'door-to-door' | 'mail-in' | 'store'
export type DisposalMethod = 'recycle' | 'resell' | 'donate' | 'keep-parts'

export interface Phone {
  id: string
  brand: string
  model: string
  capacity: string
  color: string
  purchaseYear: number
  screenCondition: ScreenCondition
  batteryHealth: number
  waterDamage: boolean
  accountLocked: boolean
  accessories: string[]
  photos: string[]
  group: PhoneGroup
  estimatedMin: number
  estimatedMax: number
  createdAt: number
  updatedAt: number
}

export interface PlatformQuote {
  id: string
  phoneId: string
  platformName: string
  channelType: ChannelType
  quote: number
  note: string
  createdAt: number
}

export interface Transaction {
  id: string
  phoneId: string
  finalPrice: number
  platform: string
  disposalMethod: DisposalMethod
  note: string
  transactedAt: number
}

export interface DeductionItem {
  label: string
  percentage: number
  amount: number
}

export interface ValuationResult {
  baseMin: number
  baseMax: number
  deductions: DeductionItem[]
  additions: { label: string; amount: number }[]
  estimatedMin: number
  estimatedMax: number
  group: PhoneGroup
}

export const BRANDS = ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OPPO', 'vivo', '其他'] as const
export const CAPACITIES = ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] as const
export const COLORS = ['黑色', '白色', '银色', '金色', '蓝色', '红色', '绿色', '紫色', '其他'] as const
export const ACCESSORIES = ['原装充电器', '原装数据线', '原装盒', '原装耳机', '贴膜', '手机壳'] as const
export const SCREEN_CONDITIONS: { value: ScreenCondition; label: string }[] = [
  { value: 'intact', label: '完好' },
  { value: 'scratched', label: '划痕' },
  { value: 'cracked', label: '碎裂' },
]
export const CHANNEL_TYPES: { value: ChannelType; label: string }[] = [
  { value: 'door-to-door', label: '上门回收' },
  { value: 'mail-in', label: '邮寄回收' },
  { value: 'store', label: '线下门店' },
]
export { GROUP_LABELS, GROUP_COLORS } from '@/utils/valuation'

export const DISPOSAL_METHODS: { value: DisposalMethod; label: string }[] = [
  { value: 'recycle', label: '回收' },
  { value: 'resell', label: '转卖' },
  { value: 'donate', label: '捐赠' },
  { value: 'keep-parts', label: '留用拆件' },
]
