export type VehicleSize = 'small' | 'medium' | 'suv' | 'any'

export type SpotStatus = 'available' | 'in_use' | 'pending'

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed'

export interface DaySlot {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface ParkingSpot {
  id: string
  building: string
  spotNumber: string
  isWallAdjacent: boolean
  vehicleSize: VehicleSize
  availableSlots: DaySlot[]
  contactPhone: string
  ownerId: string
  ownerName: string
  status: SpotStatus
}

export interface ParkingApplication {
  id: string
  spotId: string
  applicantId: string
  applicantName: string
  licensePlate: string
  estimatedHours: number
  isEV: boolean
  hasLargeItems: boolean
  status: ApplicationStatus
  startTime: string
  endTime: string
  isOvertime: boolean
  isWrongSpot: boolean
}

export interface StatsRecord {
  id: string
  spotId: string
  applicationId: string
  usedHours: number
  isOvertime: boolean
  createdAt: string
}
