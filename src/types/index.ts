export type SeatType = 'lounge' | 'sofa' | 'quiet_corner'
export type SeatStatus = 'available' | 'reserved' | 'cleaning'

export interface NapSpot {
  id: string
  name: string
  area: string
  seatType: SeatType
  capacity: number
  hasLightBlocking: boolean
  nearAC: boolean
  availableFrom: string
  availableTo: string
  rules: string
  gridRow: number
  gridCol: number
  status: SeatStatus
}

export interface Reservation {
  id: string
  spotId: string
  employeeName: string
  employeeId: string
  date: string
  startTime: string
  endTime: string
  needQuiet: boolean
  acceptNearby: boolean
  status: 'confirmed' | 'checked_in' | 'completed' | 'no_show' | 'cancelled'
  checkedInAt?: string
  completedAt?: string
  cleanedUp?: boolean
  hasLeftItems?: boolean
  leftItemsDesc?: string
  createdAt: string
}

export interface TimeSlot {
  label: string
  value: string
}

export const TIME_SLOTS: TimeSlot[] = [
  { label: '12:00', value: '12:00' },
  { label: '12:15', value: '12:15' },
  { label: '12:30', value: '12:30' },
  { label: '12:45', value: '12:45' },
  { label: '13:00', value: '13:00' },
  { label: '13:15', value: '13:15' },
  { label: '13:30', value: '13:30' },
  { label: '13:45', value: '13:45' },
  { label: '14:00', value: '14:00' },
]

export const SEAT_TYPE_LABELS: Record<SeatType, string> = {
  lounge: '躺椅',
  sofa: '沙发',
  quiet_corner: '安静角落',
}

export const AREA_OPTIONS = [
  'A区-窗边',
  'B区-休息室',
  'C区-会议室旁',
  'D区-茶水间旁',
  'E区-走廊尽头',
]
