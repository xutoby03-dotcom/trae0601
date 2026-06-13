export interface Coat {
  id: string
  code: string
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL'
  className: string
  studentName: string
  stainLevel: number
  photoUrl: string
  status: 'available' | 'sent' | 'damaged' | 'lost'
  createdAt: string
}

export interface WashBatch {
  id: string
  batchNo: string
  sender: string
  count: number
  expectedReturnDate: string
  status: 'sent' | 'returned' | 'overdue'
  createdAt: string
}

export interface WashBatchItem {
  id: string
  batchId: string
  coatId: string
  returnStatus: 'pending' | 'clean' | 'damaged' | 'missing'
  damageLocation: string
  damageNote: string
  damagePhotoUrl: string
}

export interface RepairRecord {
  id: string
  coatId: string
  washBatchItemId: string
  damageLocation: string
  damageNote: string
  damagePhotoUrl: string
  status: 'pending' | 'repaired'
  repairedAt: string
  repairNote: string
  createdAt: string
}

export const STAIN_COLORS = [
  '#22c55e',
  '#84cc16',
  '#eab308',
  '#f97316',
  '#ef4444',
]

export const DAMAGE_LOCATIONS = ['袖口', '领口', '前襟', '口袋', '下摆', '背部', '其他'] as const
export type DamageLocation = (typeof DAMAGE_LOCATIONS)[number]

export const CLASSES = ['化学一班', '化学二班', '生物一班', '生物二班', '物理一班', '物理二班'] as const
