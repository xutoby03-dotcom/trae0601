export type OrderStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed'
export type Urgency = 'low' | 'medium' | 'high' | 'urgent'
export type ContactType = 'repairman' | 'property' | 'other'
export type CostCategory = 'labor' | 'material' | 'other'
export type RoomId = 'kitchen' | 'bathroom' | 'bedroom' | 'living_room' | 'balcony' | 'entrance' | 'study' | 'other'

export interface Room {
  id: RoomId
  name: string
  icon: string
}

export interface Contact {
  id: string
  name: string
  phone: string
  type: ContactType
  tags: string[]
  avgRating: number
  totalOrders: number
}

export interface CommunicationRecord {
  id: string
  orderId: string
  content: string
  direction: 'outgoing' | 'incoming'
  createdAt: string
}

export interface QuotationRecord {
  id: string
  orderId: string
  quotationBy: string
  amount: number
  note: string
  createdAt: string
}

export interface VisitRecord {
  id: string
  orderId: string
  scheduledTime: string
  actualTime: string
  note: string
}

export interface CostItem {
  id: string
  orderId: string
  category: CostCategory
  amount: number
  note: string
}

export interface WorkOrder {
  id: string
  title: string
  description: string
  roomId: RoomId
  urgency: Urgency
  status: OrderStatus
  beforePhotos: string[]
  afterPhotos: string[]
  estimatedCost: number
  contactId: string
  appointmentTime: string
  rating: number
  createdAt: string
  updatedAt: string
  communications: CommunicationRecord[]
  quotations: QuotationRecord[]
  visits: VisitRecord[]
  costs: CostItem[]
}

export const ROOMS: Room[] = [
  { id: 'kitchen', name: '厨房', icon: 'ChefHat' },
  { id: 'bathroom', name: '卫生间', icon: 'Bath' },
  { id: 'bedroom', name: '卧室', icon: 'Bed' },
  { id: 'living_room', name: '客厅', icon: 'Sofa' },
  { id: 'balcony', name: '阳台', icon: 'Sun' },
  { id: 'entrance', name: '玄关', icon: 'DoorOpen' },
  { id: 'study', name: '书房', icon: 'BookOpen' },
  { id: 'other', name: '其他', icon: 'Home' },
]

export const URGENCY_CONFIG: Record<Urgency, { label: string; color: string; bg: string }> = {
  low: { label: '低', color: 'text-slate-500', bg: 'bg-slate-100' },
  medium: { label: '中', color: 'text-blue-600', bg: 'bg-blue-50' },
  high: { label: '高', color: 'text-orange-600', bg: 'bg-orange-50' },
  urgent: { label: '紧急', color: 'text-red-600', bg: 'bg-red-50' },
}

export const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  pending: { label: '待处理', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-400' },
  scheduled: { label: '已预约', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400' },
  in_progress: { label: '维修中', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400' },
  completed: { label: '已完成', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400' },
}

export const COST_CATEGORY_CONFIG: Record<CostCategory, { label: string }> = {
  labor: { label: '人工费' },
  material: { label: '材料费' },
  other: { label: '其他' },
}

export const CONTACT_TYPE_CONFIG: Record<ContactType, { label: string }> = {
  repairman: { label: '维修师傅' },
  property: { label: '物业' },
  other: { label: '其他' },
}
