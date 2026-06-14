export type UserRole = 'manager' | 'staff'

export interface User {
  id: string
  username: string
  password: string
  name: string
  role: UserRole
  shiftId?: string
  avatar?: string
  status: 'active' | 'inactive'
  createdAt: string
}

export type ShiftType = 'opening' | 'midday' | 'closing'

export interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  type: ShiftType
  description?: string
}

export interface Part {
  id: string
  deviceId: string
  name: string
  category: '缸体' | '出料' | '搅拌' | '接水' | '外壳' | string
  sortOrder: number
  required: boolean
  description?: string
}

export interface DevicePhoto {
  id: string
  deviceId: string
  url: string
  description?: string
  sortOrder: number
}

export interface Device {
  id: string
  machineNo: string
  name: string
  flavorSlots: number
  disinfectantId: string
  shiftIds: string[]
  location?: string
  purchaseDate?: string
  status: 'active' | 'inactive' | 'maintenance'
  createdAt: string
  parts: Part[]
  photos?: DevicePhoto[]
}

export interface Disinfectant {
  id: string
  model: string
  name: string
  manufacturer: string
  expireDate: string
  stock: number
  unitConsumption: number
  status: 'active' | 'expired' | 'low_stock'
  createdAt: string
}

export type DisinfectantLogType = 'purchase' | 'consume'

export interface DisinfectantLog {
  id: string
  disinfectantId: string
  type: DisinfectantLogType
  quantity: number
  operatorId: string
  remark?: string
  createdAt: string
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'expired'

export interface Task {
  id: string
  deviceId: string
  shiftId: string
  disinfectantId: string
  name: string
  taskDate: string
  timeSlot: ShiftType
  scheduledTime: string
  assigneeId?: string
  status: TaskStatus
  recordId?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export interface RecordItem {
  id: string
  recordId: string
  partId: string
  partName: string
  category: string
  completed: boolean
  remark?: string
  sortOrder: number
}

export type RecordPhotoType = 'completion' | 'abnormal'

export interface RecordPhoto {
  id: string
  recordId: string
  partId?: string
  url: string
  type: RecordPhotoType
  description?: string
  uploadedAt: string
  reviewed?: boolean
  reviewedBy?: string
  reviewedAt?: string
  reviewRemark?: string
}

export type ReviewStatus = 'pending' | 'approved' | 'rectified'

export interface Record {
  id: string
  taskId: string
  deviceId: string
  operatorId: string
  shiftId: string
  recordDate: string
  timeSlot: ShiftType
  completedCount: number
  totalCount: number
  completionRate: number
  hasMissed: boolean
  hasAbnormal: boolean
  missedReason?: string
  disinfectantUsed: string
  disinfectantValid: boolean
  startTime: string
  endTime: string
  duration: number
  reviewerId?: string
  reviewStatus: ReviewStatus
  reviewRemark?: string
  reviewedAt?: string
  createdAt: string
  items: RecordItem[]
  photos: RecordPhoto[]
}

export type NotificationType = 'missed' | 'disinfectant_expire' | 'task_expired' | 'abnormal'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  content: string
  relatedId?: string
  relatedType?: string
  senderId?: string
  receiverId?: string
  read: boolean
  createdAt: string
  handled?: boolean
  handledAt?: string
  handlerId?: string
}

export interface NotificationSettings {
  missedEnabled: boolean
  disinfectantWarningDays: number
  taskExpiredEnabled: boolean
  abnormalEnabled: boolean
}

export type TimeSlotLabel = {
  [key in ShiftType]: string
}

export const TIME_SLOT_LABELS: TimeSlotLabel = {
  opening: '开店前',
  midday: '午间',
  closing: '打烊'
}

export const TASK_STATUS_LABELS: { [key in TaskStatus]: string } = {
  pending: '待执行',
  in_progress: '进行中',
  completed: '已完成',
  expired: '已逾期'
}

export const TASK_STATUS_COLORS: { [key in TaskStatus]: string } = {
  pending: '#909399',
  in_progress: '#1890ff',
  completed: '#52c41a',
  expired: '#f5222d'
}
