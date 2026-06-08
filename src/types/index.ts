export type Condition = '全新' | '9成新' | '8成新' | '7成新' | '6成新及以下'
export type Category = '数码' | '家电' | '服装' | '书籍' | '家居' | '其他'
export type ItemStatus = 'selling' | 'sold'
export type BargainStatus = 'pending' | 'accepted' | 'rejected'

export interface Item {
  id: number
  name: string
  brand: string
  originalPrice: number
  purchaseDate: string
  condition: Condition
  accessoriesComplete: boolean
  flaws: string
  photos: string[]
  category: Category
  currentPrice: number
  suggestedPriceMin: number
  suggestedPriceMax: number
  freeShipping: boolean
  status: ItemStatus
  createdAt: string
  updatedAt: string
}

export interface PriceRecord {
  id: number
  itemId: number
  price: number
  reason: string
  createdAt: string
}

export interface BargainOffer {
  id: number
  itemId: number
  offerPrice: number
  message: string
  status: BargainStatus
  sellerNote: string
  createdAt: string
  updatedAt: string
}

export interface ItemFilters {
  category?: Category
  condition?: Condition
  minPrice?: number
  maxPrice?: number
  freeShipping?: boolean
  status?: ItemStatus
}

export interface Stats {
  totalListedValue: number
  totalListedCount: number
  totalSoldValue: number
  totalSoldCount: number
  recycledSpaceEstimate: number
  categoryBreakdown: { category: string; count: number; value: number }[]
}

export interface EstimateResult {
  suggestedMin: number
  suggestedMax: number
  suggestedPrice: number
}
