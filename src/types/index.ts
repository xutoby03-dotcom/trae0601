export type SettlementCycle = 'daily' | 'weekly' | 'monthly'

export interface Job {
  id: string
  name: string
  hourlyRate: number
  settlementCycle: SettlementCycle
  contact: string
  location: string
  color: string
  createdAt: number
}

export type ShiftStatus = 'pending' | 'settled'

export interface Shift {
  id: string
  jobId: string
  startTime: number
  endTime: number
  isOvertime: boolean
  transportFee: number
  mealAllowance: number
  lateDeduction: number
  status: ShiftStatus
  commuteMinutes: number
  createdAt: number
}

export type LeaveSwapType = 'leave' | 'swap'

export interface LeaveSwap {
  id: string
  shiftId: string
  jobId: string
  type: LeaveSwapType
  substituteName: string
  note: string
  createdAt: number
}
