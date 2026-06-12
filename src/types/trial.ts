export type CourseCategory = '画画' | '篮球' | '编程' | '音乐' | '舞蹈' | '英语' | '数学' | '其他'

export type TrialStatus = '待试听' | '已试听' | '已报名' | '放弃'

export type InterestLevel = 1 | 2 | 3 | 4 | 5
export type ConvenienceLevel = 1 | 2 | 3 | 4 | 5

export interface EnrollmentDecision {
  decidedAt: string
  reason: string
  discountDeadline?: string
  discountInfo?: string
}

export interface Feedback {
  childInterest: InterestLevel
  teacherFeedback: string
  convenience: ConvenienceLevel
  wantToEnroll: boolean
  feedbackAt: string
}

export interface PrepItem {
  id: string
  text: string
  completed: boolean
}

export interface TrialLesson {
  id: string
  organization: string
  courseName: string
  category: CourseCategory
  ageGroup: string
  trialTime: string
  address: string
  teacher: string
  fee: number
  classroomPhoto: string
  status: TrialStatus
  prepItems: PrepItem[]
  feedback?: Feedback
  enrollment?: EnrollmentDecision
  giveUpReason?: string
  createdAt: string
}

export const CATEGORY_OPTIONS: CourseCategory[] = ['画画', '篮球', '编程', '音乐', '舞蹈', '英语', '数学', '其他']

export const STATUS_OPTIONS: TrialStatus[] = ['待试听', '已试听', '已报名', '放弃']

export const INTEREST_LABELS: Record<InterestLevel, string> = {
  1: '没兴趣',
  2: '有点兴趣',
  3: '一般',
  4: '挺喜欢',
  5: '非常喜欢'
}

export const CONVENIENCE_LABELS: Record<ConvenienceLevel, string> = {
  1: '很不方便',
  2: '不太方便',
  3: '一般',
  4: '比较方便',
  5: '非常方便'
}

export const CATEGORY_ICONS: Record<CourseCategory, string> = {
  '画画': '🎨',
  '篮球': '🏀',
  '编程': '💻',
  '音乐': '🎵',
  '舞蹈': '💃',
  '英语': '📚',
  '数学': '🔢',
  '其他': '📦'
}

export const STATUS_COLORS: Record<TrialStatus, { bg: string; text: string; border: string }> = {
  '待试听': { bg: 'var(--warning-light)', text: '#b45309', border: 'var(--warning)' },
  '已试听': { bg: 'var(--info-light)', text: 'var(--info)', border: 'var(--info)' },
  '已报名': { bg: 'var(--success-light)', text: 'var(--success)', border: 'var(--success)' },
  '放弃': { bg: 'var(--danger-light)', text: 'var(--danger)', border: 'var(--danger)' }
}
