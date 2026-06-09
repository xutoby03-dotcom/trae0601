export interface Stop {
  id: string
  name: string
  order: number
  estimatedTime: string
}

export interface ShuttleRoute {
  id: string
  name: string
  departure: string
  destination: string
  departureTime: string
  totalSeats: number
  driverPhone: string
  type: 'morning' | 'evening'
  isTemporary: boolean
  date: string
  stops: Stop[]
  isDelayed: boolean
}

export type ReservationStatus = 'reserved' | 'boarded' | 'late_no_show' | 'no_show' | 'cancelled'

export interface Reservation {
  id: string
  routeId: string
  employeeId: string
  employeeName: string
  boardingStop: string
  hasLuggage: boolean
  companions: number
  status: ReservationStatus
  createdAt: string
  cancelledAt?: string
  isWaitlisted: boolean
  waitlistPosition: number
}

export type CreditType = 'late_cancel' | 'no_show'

export interface CreditRecord {
  id: string
  employeeId: string
  type: CreditType
  routeId: string
  reason: string
  points: number
  createdAt: string
}

export interface Employee {
  id: string
  name: string
  department: string
  creditScore: number
  isBanned: boolean
  banEndDate?: string
}

export type UserRole = 'employee' | 'admin'
export type TabType = 'morning' | 'evening' | 'soon'
