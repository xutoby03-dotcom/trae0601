export type DegradationLevel = 'A' | 'B' | 'C' | 'D' | 'E'

export type UserRole = 'owner' | 'admin'

export interface User {
  id: string
  name: string
  phone: string
  role: UserRole
  building: string
}

export interface Vehicle {
  id: string
  userId: string
  brand: string
  batteryModel: string
  purchaseDate: string
  nominalRange: number
  chargeHabit: 'daily' | 'every2days' | 'every3days'
  heatAnomaly: 'none' | 'occasional' | 'yes'
  building: string
  degradationLevel: DegradationLevel
  lastCheckupDate: string
}

export interface CheckupRecord {
  id: string
  vehicleId: string
  date: string
  voltage: number
  fullChargeHours: number
  actualRange: number
  photos: string[]
  degradationLevel: DegradationLevel
  degradationScore: number
  suggestion: string
}

export interface DetectionEvent {
  id: string
  date: string
  timeSlot: string
  location: string
  maxSlots: number
  createdBy: string
}

export interface EventRegistration {
  id: string
  eventId: string
  vehicleId: string
  userId: string
  queueNumber: number
}
