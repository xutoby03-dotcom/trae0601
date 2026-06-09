export type InspectionStatus = 'pending' | 'cleaning' | 'completed' | 'reviewing' | 'approved' | 'rework'
export type PropertyStatus = 'vacant' | 'checkout_today' | 'cleaning' | 'reviewing' | 'ready'
export type PhotoType = 'before' | 'after'

export type CheckCategory = 'bedding' | 'bathroom' | 'kitchen' | 'floor' | 'garbage' | 'fridge' | 'doorLock' | 'remote'

export interface Staff {
  id: string
  name: string
  phone: string
  role: 'cleaner' | 'landlord'
}

export interface Property {
  id: string
  name: string
  address: string
  rooms: number
  beds: number
  supplyStandards: string[]
  cleanerId: string
  checkInTime: string
  status: PropertyStatus
  createdAt: string
  complaintCount: number
}

export interface CheckItem {
  id: string
  inspectionId: string
  category: CheckCategory
  name: string
  passed: boolean | null
  note: string
}

export interface Photo {
  id: string
  inspectionId: string
  type: PhotoType
  url: string
  uploadedAt: string
}

export interface SupplyRecord {
  id: string
  inspectionId: string
  itemName: string
  quantity: number
}

export interface ReworkItem {
  id: string
  inspectionId: string
  checkItemId: string
  reason: string
  deductionReason: string
  deductionAmount: number
}

export interface Inspection {
  id: string
  propertyId: string
  cleanerId: string
  status: InspectionStatus
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  reviewedAt: string | null
  checkItems: CheckItem[]
  photos: Photo[]
  supplyRecords: SupplyRecord[]
  reworkItems: ReworkItem[]
}

export const CATEGORY_LABELS: Record<CheckCategory, string> = {
  bedding: '床品',
  bathroom: '浴室',
  kitchen: '厨房',
  floor: '地面',
  garbage: '垃圾',
  fridge: '冰箱',
  doorLock: '门锁',
  remote: '遥控器',
}

export const CATEGORY_ICONS: Record<CheckCategory, string> = {
  bedding: '🛏️',
  bathroom: '🚿',
  kitchen: '🍳',
  floor: '🧹',
  garbage: '🗑️',
  fridge: '🧊',
  doorLock: '🔐',
  remote: '📱',
}

export const DEFAULT_CHECK_ITEMS: Record<CheckCategory, string[]> = {
  bedding: ['床单更换', '被套更换', '枕套更换', '床铺整理'],
  bathroom: ['马桶清洁', '淋浴间清洁', '镜子擦拭', '地漏清理', '毛巾更换'],
  kitchen: ['灶台清洁', '水槽清洁', '餐具归位', '油烟机擦拭'],
  floor: ['客厅清扫', '卧室清扫', '阳台清扫', '拖地'],
  garbage: ['客厅垃圾桶', '卧室垃圾桶', '浴室垃圾桶', '厨房垃圾桶'],
  fridge: ['过期食品清理', '冰箱擦拭', '冰箱异味检查'],
  doorLock: ['门锁功能检查', '钥匙归位', '门禁卡检查'],
  remote: ['空调遥控器', '电视遥控器', '电池检查'],
}

export const SUPPLY_OPTIONS = ['纸巾', '洗发水', '矿泉水', '沐浴露', '牙刷', '拖鞋', '垃圾袋', '洗手液']
