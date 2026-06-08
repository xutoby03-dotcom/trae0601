export type DiseaseType = 'hypertension' | 'diabetes' | 'heartDisease' | 'other'

export type TaskType = 'registration' | 'accompany' | 'purchase' | 'other'

export type TaskStatus = 'pending' | 'inProgress' | 'completed'

export type CostType = 'medication' | 'examination'

export interface Elder {
  id: string
  name: string
  age: number
  hospital: string
  doctor: string
  emergencyContact: string
  emergencyPhone: string
  insuranceType: string
  insuranceNumber: string
}

export interface ChronicDisease {
  id: string
  elderId: string
  type: DiseaseType
  diagnosisDate: string
  targetIndicator: string
  followUpCycleDays: number
  precautions: string
}

export interface Medication {
  id: string
  diseaseId: string
  name: string
  dosage: string
  frequency: string
  startDate: string
}

export interface CheckItem {
  id: string
  diseaseId: string
  name: string
  cycle: string
}

export interface FollowUpRecord {
  id: string
  diseaseId: string
  date: string
  checkResults: string
  doctorAdvice: string
  nextDate: string
  medicationAdjust: string
  cost: number
  costType: CostType
}

export interface HealthIndicator {
  id: string
  diseaseId: string
  date: string
  name: string
  value: number
  unit: string
  isAbnormal: boolean
}

export interface FamilyTask {
  id: string
  elderId: string
  type: TaskType
  description: string
  assignee: string
  dueDate: string
  status: TaskStatus
}

export const DISEASE_TYPE_LABELS: Record<DiseaseType, string> = {
  hypertension: '高血压',
  diabetes: '糖尿病',
  heartDisease: '心脏病',
  other: '其他',
}

export const DISEASE_TYPE_COLORS: Record<DiseaseType, string> = {
  hypertension: 'bg-red-100 text-red-700 border-red-200',
  diabetes: 'bg-amber-100 text-amber-700 border-amber-200',
  heartDisease: 'bg-rose-100 text-rose-700 border-rose-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  registration: '挂号',
  accompany: '陪诊',
  purchase: '买药',
  other: '其他',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: '待完成',
  inProgress: '进行中',
  completed: '已完成',
}

export const COST_TYPE_LABELS: Record<CostType, string> = {
  medication: '药费',
  examination: '检查费',
}
