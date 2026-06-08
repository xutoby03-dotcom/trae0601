export type UrgencyLevel = 'today' | 'threeDays' | 'oneWeek' | 'safe'

export type FoodStatus = 'open' | 'grouping' | 'pendingPickup' | 'completed' | 'expired'

export interface FoodItem {
  id: string
  name: string
  photo: string
  quantity: number
  originalPrice: number
  sharePrice: number
  expiryDate: string
  pickupLocation: string
  isOpened: boolean
  allergyWarning: string
  coldChainRequired: boolean
  publisherId: string
  publisherName: string
  publisherAvatar: string
  createdAt: string
  status: FoodStatus
  currentQuantity: number
  orders: Order[]
}

export interface Order {
  id: string
  userId: string
  userName: string
  userAvatar: string
  quantity: number
  pickupTime: string
  message: string
  createdAt: string
  pickedUp: boolean
  noShow: boolean
}

export interface MonthlyStats {
  moneySaved: number
  foodPortions: number
  completedOrders: number
  noShowCount: number
  itemsShared: number
}

export interface UserProfile {
  id: string
  name: string
  avatar: string
  noShowCount: number
  completedPickups: number
}

export function getUrgencyLevel(expiryDate: string): UrgencyLevel {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffMs = expiry.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays < 0) return 'safe'
  if (diffDays === 0) return 'today'
  if (diffDays <= 3) return 'threeDays'
  if (diffDays <= 7) return 'oneWeek'
  return 'safe'
}

export function isExpired(expiryDate: string): boolean {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return expiry.getTime() < now.getTime()
}

export function daysUntilExpiry(expiryDate: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatExpiryLabel(expiryDate: string): string {
  const days = daysUntilExpiry(expiryDate)
  if (days < 0) return '已过期'
  if (days === 0) return '今天到期'
  if (days === 1) return '明天到期'
  return `${days}天后到期`
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}
