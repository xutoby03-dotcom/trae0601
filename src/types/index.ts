export type GoggleSize = 'S' | 'M' | 'L' | 'XL'

export type GoggleStatus =
  | 'available'
  | 'checked_out'
  | 'pending_clean'
  | 'disinfected'
  | 'drying'
  | 'stored'
  | 'under_repair'
  | 'retired'

export type DamageType = 'lens_scratched' | 'strap_broken' | 'nose_pad_missing' | 'other'

export type CheckoutStatus = 'active' | 'partial_returned' | 'returned' | 'overdue'

export type DamageActionType = 'repair' | 'replace'

export type DamageStatus = 'pending' | 'in_progress' | 'completed'

export interface Goggle {
  id: string
  code: string
  size: GoggleSize
  labId: string
  status: GoggleStatus
  lastDisinfectionTime: string | null
  photoUrl: string | null
  purchaseDate: string
  createdAt: string
  updatedAt: string
}

export interface CheckoutRecord {
  id: string
  classId: string
  experimentProject: string
  labId: string
  teacherId: string
  quantity: number
  goggleIds: string[]
  checkoutTime: string
  expectedReturnTime: string
  actualReturnTime: string | null
  status: CheckoutStatus
}

export interface DamageReport {
  id: string
  goggleId: string
  damageType: DamageType
  description: string
  photoUrl: string | null
  reportedAt: string
  actionType: DamageActionType
  status: DamageStatus
  completedAt: string | null
  notes: string | null
}

export interface Lab {
  id: string
  name: string
  building: string
  roomNumber: string
}

export interface ClassInfo {
  id: string
  name: string
  grade: string
  department: string
}

export interface Teacher {
  id: string
  name: string
  department: string
}

export const STATUS_LABELS: Record<GoggleStatus, string> = {
  available: '可用',
  checked_out: '借出中',
  pending_clean: '待清洗',
  disinfected: '已消毒',
  drying: '晾干中',
  stored: '已入柜',
  under_repair: '维修中',
  retired: '已停用',
}

export const STATUS_COLORS: Record<GoggleStatus, string> = {
  available: 'bg-emerald-100 text-emerald-800',
  checked_out: 'bg-amber-100 text-amber-800',
  pending_clean: 'bg-orange-100 text-orange-800',
  disinfected: 'bg-sky-100 text-sky-800',
  drying: 'bg-indigo-100 text-indigo-800',
  stored: 'bg-teal-100 text-teal-800',
  under_repair: 'bg-rose-100 text-rose-800',
  retired: 'bg-gray-100 text-gray-800',
}

export const DAMAGE_LABELS: Record<DamageType, string> = {
  lens_scratched: '镜片花',
  strap_broken: '松紧带断',
  nose_pad_missing: '鼻托脱落',
  other: '其他',
}

export const DAMAGE_COLORS: Record<DamageType, string> = {
  lens_scratched: 'bg-purple-100 text-purple-800',
  strap_broken: 'bg-red-100 text-red-800',
  nose_pad_missing: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
}

export const SIZE_LABELS: Record<GoggleSize, string> = {
  S: 'S (小)',
  M: 'M (中)',
  L: 'L (大)',
  XL: 'XL (加大)',
}

export const CHECKOUT_STATUS_LABELS: Record<CheckoutStatus, string> = {
  active: '领用中',
  partial_returned: '部分归还',
  returned: '已归还',
  overdue: '逾期',
}

export const CHECKOUT_STATUS_COLORS: Record<CheckoutStatus, string> = {
  active: 'bg-teal-100 text-teal-800',
  partial_returned: 'bg-amber-100 text-amber-800',
  returned: 'bg-emerald-100 text-emerald-800',
  overdue: 'bg-red-100 text-red-800',
}
