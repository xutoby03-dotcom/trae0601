export type Category = '生活' | '吃饭' | '交通' | '娱乐' | '学习'

export type PreMood = '焦虑' | '开心' | '平静' | '冲动' | '压力' | '无聊' | '难过'

export type PostFeeling = '满足' | '后悔' | '无所谓' | '意外惊喜'

export type RegretStatus = '后悔' | '不后悔' | '可替代'

export type PaymentMethod = '微信' | '支付宝' | '现金' | '信用卡' | '借记卡' | '其他'

export interface Expense {
  id: string
  amount: number
  category: Category
  merchant: string
  paymentMethod: PaymentMethod
  isPlanned: boolean
  preMood: PreMood
  postFeeling: PostFeeling
  review: string
  regretStatus: RegretStatus | ''
  createdAt: string
}

export interface BudgetConfig {
  category: Category
  monthlyLimit: number
}

export interface CoolItem {
  id: string
  name: string
  estimatedPrice: number
  category: Category
  preMood: PreMood
  addedAt: string
  decideAfter: string
  decision: '买' | '不买' | ''
}

export const CATEGORIES: Category[] = ['生活', '吃饭', '交通', '娱乐', '学习']

export const PRE_MOODS: PreMood[] = ['焦虑', '开心', '平静', '冲动', '压力', '无聊', '难过']

export const POST_FEELINGS: PostFeeling[] = ['满足', '后悔', '无所谓', '意外惊喜']

export const REGRET_STATUSES: RegretStatus[] = ['后悔', '不后悔', '可替代']

export const PAYMENT_METHODS: PaymentMethod[] = ['微信', '支付宝', '现金', '信用卡', '借记卡', '其他']

export const CATEGORY_COLORS: Record<Category, string> = {
  '生活': '#6bcb77',
  '吃饭': '#ffd93d',
  '交通': '#4d96ff',
  '娱乐': '#ff6b6b',
  '学习': '#c4b5fd',
}

export const MOOD_COLORS: Record<PreMood, string> = {
  '焦虑': '#ff6b6b',
  '开心': '#ffd93d',
  '平静': '#6bcb77',
  '冲动': '#ff8c42',
  '压力': '#845ec2',
  '无聊': '#a8a8a8',
  '难过': '#4b7bec',
}

export const MOOD_EMOJIS: Record<PreMood, string> = {
  '焦虑': '😰',
  '开心': '😊',
  '平静': '😌',
  '冲动': '🔥',
  '压力': '😫',
  '无聊': '😶',
  '难过': '😢',
}

export const POST_FEELING_EMOJIS: Record<PostFeeling, string> = {
  '满足': '😊',
  '后悔': '😣',
  '无所谓': '😐',
  '意外惊喜': '🤩',
}

export const DEFAULT_BUDGETS: BudgetConfig[] = [
  { category: '生活', monthlyLimit: 2000 },
  { category: '吃饭', monthlyLimit: 3000 },
  { category: '交通', monthlyLimit: 800 },
  { category: '娱乐', monthlyLimit: 1500 },
  { category: '学习', monthlyLimit: 1000 },
]
