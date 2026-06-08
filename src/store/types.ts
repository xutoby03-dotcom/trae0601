export type EquipmentCategory = 'shelter' | 'cooking' | 'lighting' | 'furniture' | 'sleeping' | 'safety' | 'other'
export type EquipmentStatus = 'available' | 'borrowed' | 'overdue' | 'maintenance'
export type BorrowStatus = 'borrowed' | 'returned' | 'overdue'
export type SceneType = 'mountain_overnight' | 'beach_bbq' | 'family_camping' | 'custom'

export interface Equipment {
  id: string
  name: string
  category: EquipmentCategory
  photo: string
  totalQuantity: number
  availableQuantity: number
  status: EquipmentStatus
  notes: string
  createdAt: string
}

export interface BorrowRecord {
  id: string
  equipmentId: string
  borrowerName: string
  borrowDate: string
  plannedReturnDate: string
  actualReturnDate: string | null
  hasDeposit: boolean
  depositAmount: number
  quantity: number
  status: BorrowStatus
  isIntact: boolean | null
  damageDescription: string
  repairCost: number
  notes: string
}

export interface SelectedEquipment {
  equipmentId: string
  quantity: number
}

export interface CampingTrip {
  id: string
  name: string
  date: string
  scene: SceneType
  selectedEquipment: SelectedEquipment[]
  createdAt: string
}

export interface SceneTemplate {
  id: string
  name: string
  description: string
  icon: string
  requiredCategories: EquipmentCategory[]
  recommendedItems: { category: EquipmentCategory; itemNames: string[] }[]
}

export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  shelter: '帐篷/庇护',
  cooking: '炉具/烹饪',
  lighting: '照明',
  furniture: '桌椅/家具',
  sleeping: '睡眠系统',
  safety: '安全/急救',
  other: '其他',
}

export const STATUS_LABELS: Record<EquipmentStatus, string> = {
  available: '可用',
  borrowed: '借出',
  overdue: '逾期',
  maintenance: '维修中',
}

export const SCENE_LABELS: Record<SceneType, string> = {
  mountain_overnight: '山里过夜',
  beach_bbq: '海边烧烤',
  family_camping: '亲子露营',
  custom: '自定义',
}
