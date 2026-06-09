export interface FoodItem {
  id: string
  name: string
  quantity: number
  source: string
  shelfLayer: number
  expiryDate: string
  coldChain: boolean
  allergens: string
  photoUrl: string
  status: 'available' | 'expired' | 'depleted'
  createdAt: string
}

export interface ClaimRecord {
  id: string
  foodItemId: string
  foodName: string
  quantity: number
  claimedAt: string
  notes: string
  claimerName: string
}

export interface CleaningRecord {
  id: string
  temperature: number
  disinfectionTime: string
  abnormalOdor: string
  notes: string
  recordedAt: string
  recorderName: string
}

export type ExpiryStatus = 'expired' | 'today' | 'soon' | 'safe'
