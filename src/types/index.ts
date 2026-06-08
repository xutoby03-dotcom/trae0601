export type RoastLevel = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'
export type ProcessMethod = 'washed' | 'natural' | 'honey' | 'anaerobic' | 'other'
export type GrindSize = 'fine' | 'medium-fine' | 'medium' | 'medium-coarse' | 'coarse'

export interface Flavor {
  acidity: number
  sweetness: number
  bitterness: number
  body: number
  aroma: number
}

export interface CoffeeBean {
  id: string
  name: string
  origin: string
  roastLevel: RoastLevel
  processMethod: ProcessMethod
  purchaseDate: string
  openDate: string | null
  price: number | null
  weightTotal: number
  weightRemaining: number
  flavor: Flavor
  createdAt: string
  updatedAt: string
}

export interface BrewRecord {
  id: string
  beanId: string
  ratio: string
  waterTemp: number
  grindSize: GrindSize
  extractionTime: string
  equipment: string
  rating: number
  notes: string
  brewedAt: string
  createdAt: string
}

export interface Alert {
  beanId: string
  beanName: string
  type: 'low-stock' | 'open-too-long'
  message: string
}
