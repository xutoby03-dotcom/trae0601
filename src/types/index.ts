export interface Uniform {
  id: string
  school: string
  grade: string
  size: string
  season: string
  gender: string
  condition: string
  hasStain: boolean
  stainDesc: string
  price: number
  isFree: boolean
  photos: string[]
  publisherId: string
  status: 'available' | 'reserved' | 'pending_handover' | 'completed'
  isUrgent: boolean
  createdAt: string
}

export interface Reservation {
  id: string
  uniformId: string
  userId: string
  childHeight: string
  childWeight: string
  message: string
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'no_show'
  createdAt: string
}

export interface Handover {
  id: string
  reservationId: string
  location: string
  datetime: string
  completed: boolean
  noShow: boolean
  completedAt: string
}

export interface PurchaseRequest {
  id: string
  userId: string
  size: string
  season: string
  gender: string
  description: string
  urgent: boolean
  status: 'open' | 'matched' | 'closed'
  createdAt: string
}

export interface User {
  id: string
  name: string
  phone: string
  school: string
  avatar: string
}

export const SIZES = ['110', '120', '130', '140', '150', '160', '165'] as const
export const SEASONS = ['夏装', '冬装', '春秋'] as const
export const GENDERS = ['男款', '女款', '通用'] as const
export const CONDITIONS = ['全新', '九成新', '八成新', '七成新'] as const
export const GRADES = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'] as const

export const SIZE_LABELS: Record<string, string> = {
  '110': '110cm',
  '120': '120cm',
  '130': '130cm',
  '140': '140cm',
  '150': '150cm',
  '160': '160cm',
  '165': '165cm',
}

export const STATUS_LABELS: Record<string, string> = {
  available: '可用',
  reserved: '已预约',
  pending_handover: '待交接',
  completed: '已完成',
}

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  rejected: '已拒绝',
  completed: '已完成',
  no_show: '爽约',
}
