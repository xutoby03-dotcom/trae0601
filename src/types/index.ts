export type PlaceCategory = 'coffee' | 'park' | 'bookstore' | 'exhibition' | 'riverside' | 'nightmarket' | 'bakery' | 'gallery'

export interface Place {
  id: string
  name: string
  category: PlaceCategory
  stayMinutes: number
  walkDistance: number
  openTime: string
  closeTime: string
  budget: number
  tags: string[]
  mapX: number
  mapY: number
  emoji: string
}

export interface WalkRoute {
  id: string
  name: string
  placeIds: string[]
  createdAt: string
  totalMinutes: number
  totalDistance: number
  totalBudget: number
}

export interface MoodMode {
  id: string
  name: string
  emoji: string
  tagFilters: string[]
}

export interface RouteStats {
  totalMinutes: number
  totalDistance: number
  totalBudget: number
  warnings: string[]
}
