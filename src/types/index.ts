export type CarpoolStatus = 'recruiting' | 'full' | 'departed' | 'cancelled'

export interface Passenger {
  id: string
  name: string
  joinedAt: string
}

export interface Message {
  id: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
}

export interface Carpool {
  id: string
  departure: string
  destination: string
  departureTime: string
  totalSeats: number
  passengers: Passenger[]
  totalCost: number
  allowLuggage: boolean
  contact: string
  status: CarpoolStatus
  messages: Message[]
  createdAt: string
  publisherId: string
  publisherName: string
}

export interface FrequentRoute {
  id: string
  departure: string
  destination: string
  count: number
  lastUsed: string
}

export const STATUS_LABELS: Record<CarpoolStatus, string> = {
  recruiting: '招募中',
  full: '已满员',
  departed: '已出发',
  cancelled: '已取消',
}

export const STATUS_COLORS: Record<CarpoolStatus, string> = {
  recruiting: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  full: 'bg-amber-100 text-amber-700 border-amber-200',
  departed: 'bg-slate-100 text-slate-500 border-slate-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
}

export const STATUS_DOT_COLORS: Record<CarpoolStatus, string> = {
  recruiting: 'bg-emerald-500',
  full: 'bg-amber-500',
  departed: 'bg-slate-400',
  cancelled: 'bg-red-500',
}
