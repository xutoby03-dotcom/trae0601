export type Proximity = 'close' | 'normal' | 'distant'
export type GiftCategory = 'food' | 'drink' | 'health' | 'fruit' | 'tobacco_alcohol' | 'other'
export type PurchaseChannel = 'online' | 'offline' | 'homemade'
export type VisitStatus = 'pending' | 'visited'

export interface Relative {
  id: string
  title: string
  address: string
  proximity: Proximity
  lastYearGift: string
  dietaryRestrictions: string
  budget: number
}

export interface Gift {
  id: string
  name: string
  category: GiftCategory
  unitPrice: number
  quantity: number
  suitableFor: string
  shelfLife: string
  purchaseChannel: PurchaseChannel
  purchased: boolean
}

export interface Visit {
  id: string
  relativeId: string
  visitDate: string
  status: VisitStatus
  returnGift: string
  childRedEnvelope: number
  notes: string
}

export interface VisitGift {
  id: string
  visitId: string
  giftId: string
  quantity: number
}

export interface Alert {
  id: string
  type: 'duplicate' | 'shelf_life' | 'budget'
  message: string
  relativeId?: string
  giftId?: string
  visitId?: string
}

export const PROXIMITY_LABELS: Record<Proximity, string> = {
  close: '近亲',
  normal: '一般',
  distant: '远亲',
}

export const GIFT_CATEGORY_LABELS: Record<GiftCategory, string> = {
  food: '食品',
  drink: '饮品',
  health: '保健品',
  fruit: '水果',
  tobacco_alcohol: '烟酒',
  other: '其他',
}

export const PURCHASE_CHANNEL_LABELS: Record<PurchaseChannel, string> = {
  online: '线上',
  offline: '线下',
  homemade: '自制',
}

export const PROXIMITY_COLORS: Record<Proximity, string> = {
  close: 'bg-red-100 text-red-700',
  normal: 'bg-amber-100 text-amber-700',
  distant: 'bg-stone-100 text-stone-600',
}

export const GIFT_CATEGORY_COLORS: Record<GiftCategory, string> = {
  food: 'bg-orange-100 text-orange-700',
  drink: 'bg-blue-100 text-blue-700',
  health: 'bg-green-100 text-green-700',
  fruit: 'bg-pink-100 text-pink-700',
  tobacco_alcohol: 'bg-purple-100 text-purple-700',
  other: 'bg-stone-100 text-stone-600',
}
