export type CoatLength = 'short' | 'medium' | 'long'
export type Temperament = 'gentle' | 'nervous' | 'aggressive' | 'excited'
export type ServiceType = 'bath' | 'haircut' | 'nail_trim' | 'ear_clean' | 'teeth_clean' | 'gland_expression' | 'flea_treatment'
export type AppointmentStatus = 'pending' | 'today' | 'pickup' | 'completed'
export type PickupMethod = 'self_drop' | 'shop_pickup' | 'delivery'
export type ReminderType = 'bath' | 'deworming'

export interface Pet {
  id: string
  name: string
  breed: string
  weight: number
  coatLength: CoatLength
  temperament: Temperament
  allergies: string
  preferredShop: string
  avatar: string
  defaultServices: ServiceType[]
  createdAt: string
}

export interface Appointment {
  id: string
  petId: string
  services: ServiceType[]
  datetime: string
  pickupMethod: PickupMethod
  budget: number
  specialRequests: string
  status: AppointmentStatus
  shopName: string
  createdAt: string
}

export interface GroomingRecord {
  id: string
  appointmentId: string
  actualCost: number
  photos: string[]
  satisfactionScore: number
  hadStress: boolean
  stressNote: string
  completedAt: string
}

export interface Reminder {
  id: string
  petId: string
  type: ReminderType
  dueDate: string
  isCompleted: boolean
  createdAt: string
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  bath: '洗澡',
  haircut: '剪毛',
  nail_trim: '剪指甲',
  ear_clean: '清耳朵',
  teeth_clean: '洁牙',
  gland_expression: '挤肛门腺',
  flea_treatment: '驱虫',
}

export const COAT_LENGTH_LABELS: Record<CoatLength, string> = {
  short: '短毛',
  medium: '中长',
  long: '长毛',
}

export const TEMPERAMENT_LABELS: Record<Temperament, string> = {
  gentle: '温顺',
  nervous: '紧张',
  aggressive: '攻击性',
  excited: '兴奋',
}

export const PICKUP_METHOD_LABELS: Record<PickupMethod, string> = {
  self_drop: '自行送到',
  shop_pickup: '店家接送',
  delivery: '上门服务',
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: '待预约',
  today: '今天美容',
  pickup: '待接回',
  completed: '已完成',
}

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  bath: '洗澡',
  deworming: '驱虫',
}
