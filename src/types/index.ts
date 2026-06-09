export interface Participant {
  id: string
  name: string
  color: string
  isActive: boolean
  leftDate?: string
}

export type ExpenseCategory = 'transport' | 'hotel' | 'food' | 'ticket' | 'shopping' | 'other'

export type ExpenseStatus = 'pending' | 'confirmed' | 'disputed'

export interface Expense {
  id: string
  tripId: string
  payerId: string
  amount: number
  category: ExpenseCategory
  date: string
  description: string
  splitAmong: string[]
  photo?: string
  notes: string
  status: ExpenseStatus
  useSharedFund: boolean
}

export interface SharedFundContribution {
  id: string
  participantId: string
  amount: number
  date: string
}

export interface Trip {
  id: string
  destination: string
  startDate: string
  endDate: string
  participants: Participant[]
  budget: number
  expenses: Expense[]
  sharedFund: SharedFundContribution[]
  createdAt: string
}

export interface Settlement {
  fromId: string
  toId: string
  amount: number
}

export const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  transport: { label: '交通', icon: '🚄', color: '#3b82f6' },
  hotel: { label: '住宿', icon: '🏨', color: '#8b5cf6' },
  food: { label: '餐饮', icon: '🍜', color: '#f97316' },
  ticket: { label: '门票', icon: '🎫', color: '#14b8a6' },
  shopping: { label: '购物', icon: '🛍️', color: '#ec4899' },
  other: { label: '其他', icon: '📌', color: '#6b7280' },
}

export const PARTICIPANT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
]

export const STATUS_CONFIG: Record<ExpenseStatus, { label: string; color: string; bg: string }> = {
  pending: { label: '待确认', color: '#f59e0b', bg: '#fef3c7' },
  confirmed: { label: '已分摊', color: '#10b981', bg: '#d1fae5' },
  disputed: { label: '有争议', color: '#ef4444', bg: '#fee2e2' },
}
