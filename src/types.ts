export type VisitorStatus = 'expected' | 'checked-in' | 'departed' | 'no-show'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type ItemType = 'parcel' | 'equipment' | 'other'
export type ItemDirection = 'in' | 'out'
export type RiskType = 'no-host-confirm' | 'room-conflict' | 'badge-not-returned' | 'overtime-stay'
export type RiskSeverity = 'high' | 'medium' | 'low'

export interface Visitor {
  id: string
  name: string
  company: string
  phone: string
  licensePlate: string
  purpose: string
  status: VisitorStatus
  badgeNumber: string | null
  badgeReturned: boolean
  hostId: string
  meetingRoomId: string
  appointmentId: string
  expectedArrival: string
  actualArrival: string | null
  actualDeparture: string | null
  createdAt: string
}

export interface Appointment {
  id: string
  visitorName: string
  visitorCompany: string
  visitorPhone: string
  visitorLicensePlate: string
  purpose: string
  hostId: string
  meetingRoomId: string
  expectedArrival: string
  expectedDeparture: string
  status: AppointmentStatus
  hostConfirmed: boolean
  createdAt: string
}

export interface Employee {
  id: string
  name: string
  department: string
  position: string
  phone: string
}

export interface MeetingRoom {
  id: string
  name: string
  floor: string
  capacity: number
}

export interface ItemRecord {
  id: string
  visitorId: string
  appointmentId: string
  itemType: ItemType
  description: string
  direction: ItemDirection
  timestamp: string
  operator: string
}

export interface RiskAlert {
  id: string
  type: RiskType
  severity: RiskSeverity
  message: string
  relatedAppointmentId: string
  relatedVisitorId: string | null
  resolved: boolean
  createdAt: string
}
