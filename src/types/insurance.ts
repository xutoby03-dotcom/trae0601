export type InsuranceType = '车险' | '重疾险' | '医疗险' | '意外险' | '其他'
export type PolicyStatus = '快缴费' | '快到期' | '保障中' | '已失效'
export type ClaimStatus = '处理中' | '已赔付' | '已拒赔'
export type PersonRole = '成人' | '孩子' | '老人'

export interface InsurancePolicy {
  id: string
  insuredPerson: string
  insuranceType: InsuranceType
  company: string
  coverageAmount: number
  premium: number
  paymentDate: string
  expiryDate: string
  agent: string
  photo: string
  createdAt: string
  updatedAt: string
}

export interface RenewalRecord {
  id: string
  policyId: string
  amount: number
  paymentDate: string
  voucher: string
  createdAt: string
}

export interface ClaimRecord {
  id: string
  policyId: string
  reason: string
  materials: string
  payoutAmount: number
  status: ClaimStatus
  createdAt: string
}

export const INSURANCE_TYPES: InsuranceType[] = ['车险', '重疾险', '医疗险', '意外险', '其他']
export const CLAIM_STATUSES: ClaimStatus[] = ['处理中', '已赔付', '已拒赔']
export const PERSON_ROLES: PersonRole[] = ['成人', '孩子', '老人']

export const PERSON_ROLE_CONFIG: Record<PersonRole, { label: string; color: string; bg: string }> = {
  '成人': { label: '成人', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  '孩子': { label: '孩子', color: 'text-pink-700', bg: 'bg-pink-50 border-pink-200' },
  '老人': { label: '老人', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
}

export const INSURANCE_TYPE_COLORS: Record<InsuranceType, string> = {
  '车险': '#3b82f6',
  '重疾险': '#ef4444',
  '医疗险': '#10b981',
  '意外险': '#f59e0b',
  '其他': '#8b5cf6',
}

export const STATUS_CONFIG: Record<PolicyStatus, { color: string; bg: string; label: string }> = {
  '快缴费': { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', label: '快缴费' },
  '快到期': { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: '快到期' },
  '保障中': { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: '保障中' },
  '已失效': { color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', label: '已失效' },
}
