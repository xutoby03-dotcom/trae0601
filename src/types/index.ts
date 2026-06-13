export type LockerSize = 'small' | 'medium' | 'large' | 'xlarge'
export type LockerStatus = 'empty' | 'occupied' | 'urgent'

export interface Locker {
  id: string
  code: string
  size: LockerSize
  location: string
  isRefrigerated: boolean
  photo: string
  status: LockerStatus
  currentPackageId: string | null
  createdAt: string
}

export interface Package {
  id: string
  lockerId: string
  recipientName: string
  phoneLastFour: string
  expressCompany: string
  size: LockerSize
  isFragile: boolean
  inTime: string
  outTime: string | null
  isPickedUp: boolean
  isUrgent: boolean
  createdAt: string
}

export interface DashboardStats {
  emptyLockers: number
  occupiedLockers: number
  totalLockers: number
  urgentPackages: number
  todayInCount: number
  expressCounts: Record<string, number>
  refrigeratedPackages: Package[]
}

export type ModalType = 'none' | 'locker-form' | 'locker-detail' | 'check-in' | 'check-out'
