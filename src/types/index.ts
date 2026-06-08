export type PetType = 'cat' | 'dog'

export type TaskType = 'breakfast' | 'dinner' | 'litter' | 'walk' | 'medicine'

export type TimeSlot = 'morning' | 'noon' | 'evening' | 'night'

export type PoopStatus = 'normal' | 'soft' | 'loose' | 'constipated'

export interface Pet {
  id: string
  name: string
  type: PetType
  photo: string
  feedPerDay: number
  feedAmountGrams: number
  restrictions: string
  medications: string
  specialHabits: string
  createdAt: string
}

export interface FamilyMember {
  id: string
  name: string
  avatar: string
  color: string
}

export interface TaskTemplate {
  id: string
  petId: string
  taskType: TaskType
  timeSlot: TimeSlot
  deadlineMinutes: number
}

export interface TaskInstance {
  id: string
  templateId: string
  petId: string
  date: string
  taskType: TaskType
  timeSlot: TimeSlot
  completed: boolean
  completedAt: string | null
}

export interface TaskAssignment {
  id: string
  taskInstanceId: string
  memberId: string
  assignedAt: string
}

export interface DailyRecord {
  id: string
  petId: string
  date: string
  foodActualGrams: number
  waterMl: number
  poopStatus: PoopStatus
  abnormalNote: string
}

export interface FosterSession {
  id: string
  token: string
  fosterPersonName: string
  startDate: string
  endDate: string
  assignedPetIds: string[]
  active: boolean
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  breakfast: '早饭',
  dinner: '晚饭',
  litter: '清理猫砂',
  walk: '遛狗',
  medicine: '吃药',
}

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: '早晨',
  noon: '中午',
  evening: '傍晚',
  night: '晚上',
}

export const POOP_STATUS_LABELS: Record<PoopStatus, string> = {
  normal: '正常',
  soft: '软便',
  loose: '拉稀',
  constipated: '便秘',
}

export const TASK_TYPE_COLORS: Record<TaskType, string> = {
  breakfast: 'bg-orange-400',
  dinner: 'bg-amber-500',
  litter: 'bg-emerald-400',
  walk: 'bg-sky-400',
  medicine: 'bg-rose-400',
}

export const TASK_TYPE_BORDER_COLORS: Record<TaskType, string> = {
  breakfast: 'border-l-orange-400',
  dinner: 'border-l-amber-500',
  litter: 'border-l-emerald-400',
  walk: 'border-l-sky-400',
  medicine: 'border-l-rose-400',
}

export const MEMBER_COLORS = [
  '#F97316', '#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#14B8A6', '#EAB308', '#EF4444',
]

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
}
