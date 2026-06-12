export type PipelineStatus =
  | 'pending'
  | 'scheduling'
  | 'technical'
  | 'final'
  | 'hired'
  | 'rejected'

export type BonusStatus = 'pending' | 'available' | 'paid'

export interface InterviewFeedback {
  id: string
  status: PipelineStatus
  feedback: string
  createdAt: string
  interviewer?: string
}

export interface Candidate {
  id: string
  name: string
  avatar: string
  targetPosition: string
  referrer: string
  resumeUrl: string
  resumeName: string
  sourceDate: string
  status: PipelineStatus
  bonusStatus: BonusStatus
  bonusAmount: number
  onboarded?: boolean
  confirmedPermanent?: boolean
  feedbacks: InterviewFeedback[]
}

export const PIPELINE_STATUS_LABELS: Record<PipelineStatus, string> = {
  pending: '待筛选',
  scheduling: '约面',
  technical: '技术面',
  final: '终面',
  hired: '已录用',
  rejected: '未通过',
}

export const PIPELINE_STATUS_ORDER: PipelineStatus[] = [
  'pending',
  'scheduling',
  'technical',
  'final',
  'hired',
  'rejected',
]

export const PIPELINE_STATUS_COLORS: Record<PipelineStatus, string> = {
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
  scheduling: 'bg-blue-50 text-blue-700 border-blue-200',
  technical: 'bg-purple-50 text-purple-700 border-purple-200',
  final: 'bg-amber-50 text-amber-700 border-amber-200',
  hired: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

export const PIPELINE_STATUS_DOT: Record<PipelineStatus, string> = {
  pending: 'bg-gray-400',
  scheduling: 'bg-blue-500',
  technical: 'bg-purple-500',
  final: 'bg-amber-500',
  hired: 'bg-green-500',
  rejected: 'bg-red-500',
}

export const BONUS_STATUS_LABELS: Record<BonusStatus, string> = {
  pending: '待确认',
  available: '可发放',
  paid: '已发放',
}

export const BONUS_STATUS_COLORS: Record<BonusStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  available: 'bg-green-50 text-green-700 border-green-200',
  paid: 'bg-gray-100 text-gray-600 border-gray-200',
}

export const POSITIONS = [
  '前端工程师',
  '后端工程师',
  '产品经理',
  'UI设计师',
  '测试工程师',
  '数据分析师',
]

export const REFERRERS = [
  '张伟',
  '李娜',
  '王强',
  '刘洋',
  '陈静',
  '赵磊',
]
