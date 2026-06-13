export type VehicleStatus = 'available' | 'maintenance' | 'disabled'
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'in_use' | 'returned'

export interface Vehicle {
  id: string
  plateNumber: string
  model: string
  fuelCard: string
  parkingSpot: string
  custodian: string
  photo: string
  currentFuel: number
  currentMileage: number
  status: VehicleStatus
  createdAt: string
}

export interface Request {
  id: string
  vehicleId: string
  department: string
  purpose: string
  startTime: string
  endTime: string
  driver: string
  destination: string
  estimatedMileage: number
  status: RequestStatus
  applicantName: string
  createdAt: string
  rejectReason?: string
}

export interface ReturnRecord {
  id: string
  requestId: string
  actualMileage: number
  fuelLevel: number
  violations: string
  parkingPhoto: string
  returnedAt: string
  returnedBy: string
}

export interface ConflictResult {
  hasConflict: boolean
  conflictingRequests?: Request[]
}

export interface UsageStats {
  vehicleId: string
  plateNumber: string
  totalHours: number
  tripCount: number
}

export interface DepartmentStats {
  department: string
  count: number
}

export const DEPARTMENTS = [
  '总经理办公室',
  '行政部',
  '财务部',
  '人力资源部',
  '市场部',
  '销售部',
  '技术部',
  '研发部',
  '运营部',
  '客户服务部',
] as const

export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  available: '可用',
  maintenance: '维修中',
  disabled: '停用',
}

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  pending: '待审批',
  approved: '已批准',
  rejected: '已驳回',
  in_use: '使用中',
  returned: '已归还',
}
