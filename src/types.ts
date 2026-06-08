export interface Pet {
  id: string
  name: string
  species: 'cat' | 'dog'
  breed: string
  birthday: string
  weight: number
  chipNumber: string
  photo: string
  hospital: string
  createdAt: string
}

export type HealthRecordType = 'vaccine' | 'deworming' | 'checkup' | 'allergy' | 'surgery'

export interface HealthRecord {
  id: string
  petId: string
  type: HealthRecordType
  title: string
  date: string
  nextDate: string
  hospital: string
  doctor: string
  cost: number
  certificatePhoto: string
  notes: string
  createdAt: string
}

export interface ReminderItem {
  record: HealthRecord
  pet: Pet
  daysLeft: number
  urgency: 'urgent' | 'warning' | 'normal'
}

export interface CostStats {
  total: number
  byType: Record<HealthRecordType, number>
  byMonth: { month: string; cost: number }[]
  byPet: { petId: string; petName: string; cost: number }[]
}

export const RECORD_TYPE_CONFIG: Record<HealthRecordType, { label: string; color: string; bgColor: string; icon: string }> = {
  vaccine: { label: '疫苗', color: '#22c55e', bgColor: '#f0fdf4', icon: 'syringe' },
  deworming: { label: '驱虫', color: '#3b82f6', bgColor: '#eff6ff', icon: 'bug' },
  checkup: { label: '体检', color: '#8b5cf6', bgColor: '#f5f3ff', icon: 'stethoscope' },
  allergy: { label: '过敏', color: '#f97316', bgColor: '#fff7ed', icon: 'alert-triangle' },
  surgery: { label: '手术', color: '#ef4444', bgColor: '#fef2f2', icon: 'scissors' },
}
