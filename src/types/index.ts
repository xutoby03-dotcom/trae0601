export interface Point {
  id: number
  building: string
  location: string
  bin_types: string[]
  open_hours: string
  supervisor: string
  camera_position: string
  description: string
  created_at: string
  updated_at: string
  recentInspections?: Inspection[]
  openTickets?: number
}

export interface Inspection {
  id: number
  point_id: number
  inspector: string
  inspection_time: string
  problem_types: string[]
  photos: string[]
  notes: string
  is_serious: number
  created_at: string
  building?: string
  location?: string
  supervisor?: string
  ticket?: Ticket
}

export interface Ticket {
  id: number
  inspection_id?: number
  point_id: number
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'processing' | 'resolved' | 'closed'
  assignee?: string
  repair_photos: string[]
  repair_notes: string
  created_at: string
  assigned_at?: string
  resolved_at?: string
  closed_at?: string
  building?: string
  location?: string
  supervisor?: string
  inspector?: string
  inspection_time?: string
  inspection_problems?: string[]
  inspection_photos?: string[]
}

export interface Promotion {
  id: number
  title: string
  date: string
  location: string
  type: string
  participants: number
  related_points: number[]
  content: string
  photos: string[]
  created_at: string
  points_detail?: Point[]
}

export interface OverviewStats {
  todayInspections: number
  pendingTickets: number
  monthProblems: number
  completionRate: number
  problemChange: number
}

export interface TrendData {
  date: string
  count: number
}

export interface ErrorTypeData {
  name: string
  value: number
  color: string
}

export interface RecurrenceData {
  id: number
  building: string
  location: string
  problemCount: number
}

export interface RepairTimeData {
  pointId: number
  building: string
  avgHours: number
  ticketCount: number
}

export interface FocusBuilding {
  id: number
  building: string
  location: string
  supervisor: string
  problemCount: number
  promotionCount: number
  priority: 'high' | 'medium' | 'low'
}

export const PROBLEM_TYPES = ['混投', '满溢', '破袋', '厨余未沥水', '可回收堆放']

export const BIN_TYPES = ['厨余垃圾', '其他垃圾', '可回收物', '有害垃圾']

export const TICKET_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'bg-amber-100 text-amber-800' },
  processing: { label: '处理中', color: 'bg-blue-100 text-blue-800' },
  resolved: { label: '已整改', color: 'bg-green-100 text-green-800' },
  closed: { label: '已关闭', color: 'bg-gray-100 text-gray-800' },
}

export const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  high: { label: '高优先级', color: 'bg-red-100 text-red-800' },
  medium: { label: '中优先级', color: 'bg-amber-100 text-amber-800' },
  low: { label: '低优先级', color: 'bg-green-100 text-green-800' },
}
