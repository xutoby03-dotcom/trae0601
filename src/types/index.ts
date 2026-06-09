export interface Pet {
  id: string
  name: string
  breed: string
  age: number
  vaccineStatus: string
  allergies: string
  temperament: string
  foodBrand: string
  emergencyContact: string
  type: 'cat' | 'dog'
  avatarUrl: string
}

export interface FeedingPlan {
  dailyAmount: string
  schedule: string
  notes: string
}

export interface WalkPlan {
  walkTime: string
  route: string
  leashLocation: string
}

export interface CleanPlan {
  bathFrequency: string
  litterFrequency: string
  supplyLocations: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
}

export interface Taboo {
  id: string
  content: string
  category: 'feeding' | 'cleaning' | 'walking' | 'health'
}

export interface Supply {
  id: string
  name: string
  remainingDays: number
  totalDays: number
}

export interface DailyCheckin {
  id: string
  fosterId: string
  date: string
  appetite: 'good' | 'normal' | 'poor'
  stool: 'normal' | 'soft' | 'abnormal'
  mood: 'energetic' | 'calm' | 'lethargic'
  abnormalNote: string
  photos: string[]
  completed: boolean
}

export interface Message {
  id: string
  fosterId: string
  content: string
  priority: 'normal' | 'important'
  createdAt: string
}

export interface Foster {
  id: string
  petId: string
  startDate: string
  endDate: string
  pickupMethod: string
  feederName: string
  feederPhone: string
  feedingPlan: FeedingPlan
  walkPlan: WalkPlan | null
  cleanPlan: CleanPlan
  medications: Medication[]
  taboos: Taboo[]
  supplies: Supply[]
}
