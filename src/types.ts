export type GarbageCategory = 'kitchen' | 'recyclable' | 'hazardous' | 'other'

export interface FamilyMember {
  id: string
  name: string
  avatar: string
  role: 'admin' | 'member'
}

export interface GarbageRecord {
  id: string
  name: string
  category: GarbageCategory
  binType: GarbageCategory
  memberId: string
  disposalTime: string
  notes: string
  isCorrect: boolean
  correctedCategory?: GarbageCategory
  correctedBy?: string
  createdAt: string
  disposed: boolean
}

export interface RuleCard {
  id: string
  title: string
  wrongAnswer: string
  correctAnswer: string
  category: GarbageCategory
  description: string
  isFavorited: boolean
}

export interface GarbageRoomSchedule {
  id: string
  dayOfWeek: number
  openTime: string
  closeTime: string
  category: GarbageCategory
  enabled: boolean
}
