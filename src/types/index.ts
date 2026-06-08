export type ToolStatus = 'available' | 'borrowed' | 'maintenance'
export type BorrowRecordStatus = 'pending' | 'active' | 'returned' | 'overdue'
export type ToolCategory = 'electric' | 'hand' | 'measuring' | 'garden' | 'other'

export interface User {
  id: string
  name: string
  avatar: string
  phone: string
  creditScore: number
  createdAt: string
}

export interface Tool {
  id: string
  name: string
  category: ToolCategory
  photo: string
  deposit: number
  maxBorrowHours: number
  pickupLocation: string
  notes: string
  ownerId: string
  status: ToolStatus
  createdAt: string
}

export interface BorrowRecord {
  id: string
  toolId: string
  borrowerId: string
  ownerId: string
  startTime: string
  expectedReturnTime: string
  actualReturnTime: string
  purpose: string
  status: BorrowRecordStatus
  returnPhoto: string
  hasDamage: boolean
  damageDescription: string
  damageCompensation: number
  isOverdue: boolean
}

export interface CreditLog {
  id: string
  userId: string
  change: number
  reason: string
  borrowRecordId: string
  createdAt: string
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  electric: '电动工具',
  hand: '手动工具',
  measuring: '测量工具',
  garden: '园艺工具',
  other: '其他',
}

export const STATUS_LABELS: Record<ToolStatus, string> = {
  available: '空闲',
  borrowed: '已借出',
  maintenance: '维修中',
}

export const BORROW_STATUS_LABELS: Record<BorrowRecordStatus, string> = {
  pending: '待确认',
  active: '借用中',
  returned: '已归还',
  overdue: '已逾期',
}
