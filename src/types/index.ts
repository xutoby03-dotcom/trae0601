export type Rarity = 'common' | 'rare' | 'hidden'

export interface Collection {
  id: string
  seriesId: string
  characterName: string
  rarity: Rarity
  purchasePrice: number
  purchaseDate: string
  purchaseChannel: string
  isDuplicate: boolean
  willingToExchange: boolean
  photo: string
  notes: string
  currentValue: number
  createdAt: string
  updatedAt: string
}

export interface Series {
  id: string
  name: string
  description: string
  totalItems: number
  coverImage: string
  createdAt: string
}

export interface SeriesItem {
  id: string
  seriesId: string
  characterName: string
  rarity: Rarity
  imageUrl: string
}

export interface ExchangeRequest {
  id: string
  haveCollectionId: string
  haveSeriesName: string
  haveCharacterName: string
  haveRarity: Rarity
  havePhoto: string
  wantSeriesName: string
  wantCharacterName: string
  maxPriceDifference: number
  notes: string
  isActive: boolean
  createdAt: string
}

export interface SavedExchange {
  id: string
  exchangeRequestId: string
  savedAt: string
}

export const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bg: string; border: string }> = {
  common: { label: '常规', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300' },
  rare: { label: '稀有', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' },
  hidden: { label: '隐藏', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300' },
}
