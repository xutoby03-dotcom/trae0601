export type DeviceStatus = 'available' | 'in_use' | 'pending_clean' | 'pending_maintenance' | 'disabled'
export type ArmrestType = 'fixed' | 'removable' | 'none'
export type FootPadStatus = 'good' | 'worn' | 'cracked'
export type DisinfectMethod = 'alcohol' | 'chlorine' | 'uv' | 'other'
export type DryingLocation = 'bathroom' | 'balcony' | 'other'
export type AlertStatus = 'pending' | 'resolved'
export type AlertTriggerSource = 'pre_check' | 'post_check' | 'manual'

export interface Device {
  id: string
  code: string
  weightCapacity: number
  armrestType: ArmrestType
  footPadStatus: FootPadStatus
  purchaseDate: string
  photo: string
  status: DeviceStatus
  createdAt: string
  updatedAt: string
}

export interface CheckRecord {
  id: string
  deviceId: string
  seatOk: boolean
  backrestOk: boolean
  footPadOk: boolean
  screwsOk: boolean
  drainHoleOk: boolean
  allPassed: boolean
  checkedAt: string
  checkedBy: string
}

export interface CleanRecord {
  id: string
  deviceId: string
  cleaner: string
  disinfectMethod: DisinfectMethod
  dryingLocation: DryingLocation
  foundLoose: boolean
  notes: string
  cleanedAt: string
}

export interface MaintenanceAlert {
  id: string
  deviceId: string
  reason: string
  triggerSource: AlertTriggerSource
  status: AlertStatus
  createdAt: string
  resolvedAt: string | null
  resolvedBy: string | null
  resolvedNotes: string | null
}

export interface UsageRecord {
  id: string
  deviceId: string
  checkRecordId: string | null
  cleanRecordId: string | null
  startTime: string
  endTime: string | null
  status: 'in_progress' | 'completed'
}
