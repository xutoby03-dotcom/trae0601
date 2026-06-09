export type UmbrellaStatus = 'available' | 'borrowed' | 'damaged' | 'lost'
export type UmbrellaSize = 'S' | 'M' | 'L'
export type DamageType = 'rib_broken' | 'canopy_torn' | 'button_malfunction' | 'other'
export type BorrowStatus = 'active' | 'returned' | 'overdue'
export type ReturnCondition = 'good' | 'damaged' | 'lost'

export interface Umbrella {
  id: string
  code: string
  color: string
  size: UmbrellaSize
  location: string
  deposit: number
  photoUrl: string
  status: UmbrellaStatus
  contributorId: string
  contributorName: string
  createdAt: string
}

export interface BorrowRecord {
  id: string
  umbrellaId: string
  borrowerName: string
  borrowTime: string
  expectedReturnTime: string
  actualReturnTime: string | null
  returnLocation: string
  conditionOnReturn: ReturnCondition | null
  damageTypes: DamageType[]
  damageNote: string
  returnPhotoUrl: string | null
  status: BorrowStatus
}

export interface Location {
  id: string
  name: string
}

export interface WeatherData {
  isRainy: boolean
  precipitationProbability: number
  description: string
}

export const UMBRELLA_COLORS = [
  { name: '红', value: '#EF4444' },
  { name: '蓝', value: '#3B82F6' },
  { name: '黑', value: '#1F2937' },
  { name: '绿', value: '#22C55E' },
  { name: '黄', value: '#EAB308' },
  { name: '紫', value: '#A855F7' },
  { name: '粉', value: '#EC4899' },
  { name: '橙', value: '#F97316' },
  { name: '白', value: '#F3F4F6' },
  { name: '灰', value: '#9CA3AF' },
]

export const LOCATIONS: Location[] = [
  { id: 'loc1', name: '小区东门' },
  { id: 'loc2', name: '小区西门' },
  { id: 'loc3', name: '社区中心' },
  { id: 'loc4', name: '地下车库' },
  { id: 'loc5', name: '物业前台' },
]

export const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  rib_broken: '伞骨断裂',
  canopy_torn: '伞面破损',
  button_malfunction: '按钮失灵',
  other: '其他',
}

export const STATUS_LABELS: Record<UmbrellaStatus, string> = {
  available: '可借',
  borrowed: '借出中',
  damaged: '破损待修',
  lost: '丢失',
}

export const SIZE_LABELS: Record<UmbrellaSize, string> = {
  S: '小号',
  M: '中号',
  L: '大号',
}
