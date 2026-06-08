export type RiskTag =
  | 'unclear_deposit'
  | 'long_contract'
  | 'old_appliances'
  | 'downstairs_noise'
  | 'no_gas'

export const RISK_TAG_LABELS: Record<RiskTag, string> = {
  unclear_deposit: '押金规则不清',
  long_contract: '合同期太长',
  old_appliances: '家电老旧',
  downstairs_noise: '楼下噪音',
  no_gas: '没有燃气',
}

export const RISK_TAG_OPTIONS: { value: RiskTag; label: string }[] = [
  { value: 'unclear_deposit', label: '押金规则不清' },
  { value: 'long_contract', label: '合同期太长' },
  { value: 'old_appliances', label: '家电老旧' },
  { value: 'downstairs_noise', label: '楼下噪音' },
  { value: 'no_gas', label: '没有燃气' },
]

export type InspectionCategory =
  | 'water_pressure'
  | 'lighting'
  | 'noise'
  | 'wall'
  | 'ac'
  | 'fridge'
  | 'door_lock'
  | 'drain'
  | 'network'

export const INSPECTION_CATEGORIES: { value: InspectionCategory; label: string }[] = [
  { value: 'water_pressure', label: '水压' },
  { value: 'lighting', label: '采光' },
  { value: 'noise', label: '噪音' },
  { value: 'wall', label: '墙面' },
  { value: 'ac', label: '空调' },
  { value: 'fridge', label: '冰箱' },
  { value: 'door_lock', label: '门锁' },
  { value: 'drain', label: '下水道' },
  { value: 'network', label: '网络' },
]

export const DEPOSIT_TYPES = [
  '押一付一',
  '押一付三',
  '押一付六',
  '押二付一',
  '押二付三',
  '押二付六',
  '半年付',
  '年付',
]

export const ORIENTATIONS = ['东', '南', '西', '北', '东南', '东北', '西南', '西北']

export interface InspectionItem {
  id: string
  propertyId: string
  category: InspectionCategory
  score: number
  note: string
}

export interface Property {
  id: string
  community: string
  rent: number
  depositType: string
  area: number
  floor: string
  orientation: string
  commuteMinutes: number
  agencyFee: number
  moveInDate: string
  photos: string[]
  riskTags: RiskTag[]
  inspections: InspectionItem[]
  createdAt: string
}

export function calculateDepositAmount(depositType: string, rent: number): number {
  const match = depositType.match(/押(\d+)/)
  if (match) {
    return parseInt(match[1], 10) * rent
  }
  if (depositType === '半年付') return rent
  if (depositType === '年付') return rent
  return rent
}

export function calculateAnnualCost(property: Property): number {
  const deposit = calculateDepositAmount(property.depositType, property.rent)
  return property.rent * 12 + deposit + property.agencyFee
}

export function calculateTotalScore(inspections: InspectionItem[]): number {
  if (inspections.length === 0) return 0
  const total = inspections.reduce((sum, item) => sum + item.score, 0)
  return Math.round((total / inspections.length) * 10) / 10
}
