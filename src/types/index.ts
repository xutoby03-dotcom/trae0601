export type ProductType = 'cake' | 'cookie' | 'bread' | 'other'

export type BakingResult = 'success' | 'failure' | 'partial'

export type RecordStatus = 'pending_review' | 'improved' | 'failed'

export type ProblemTag =
  | 'cracking'
  | 'collapsing'
  | 'undercooked'
  | 'too_hard'
  | 'too_sweet'
  | 'burnt_outside_raw_inside'
  | 'no_color'
  | 'coarse_texture'
  | 'shrinking'
  | 'demolding_difficulty'

export type AdjustmentItem = 'sugar' | 'oil' | 'water' | 'fermentTime' | 'ovenTemp' | 'other'

export interface RecipeAdjustment {
  id: string
  recordId: string
  item: AdjustmentItem
  before: number
  after: number
  unit: string
}

export interface BakingRecord {
  id: string
  productName: string
  productType: ProductType
  date: string
  ovenTemp: number
  bakeTime: number
  flourType: string
  humidity: number
  photos: string[]
  result: BakingResult
  tasteScore: number
  notes: string
  problemTags: ProblemTag[]
  status: RecordStatus
  versionLabel: string
  versionNumber: number
  parentId: string | null
  productId: string
  createdAt: string
  adjustments: RecipeAdjustment[]
  materialCost: number
  recipe: string
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  cake: '蛋糕',
  cookie: '饼干',
  bread: '面包',
  other: '其他',
}

export const PROBLEM_TAG_LABELS: Record<ProblemTag, string> = {
  cracking: '开裂',
  collapsing: '塌陷',
  undercooked: '没熟',
  too_hard: '太硬',
  too_sweet: '太甜',
  burnt_outside_raw_inside: '外焦内生',
  no_color: '不上色',
  coarse_texture: '组织粗糙',
  shrinking: '回缩',
  demolding_difficulty: '脱模困难',
}

export const ADJUSTMENT_ITEM_LABELS: Record<AdjustmentItem, string> = {
  sugar: '糖',
  oil: '油',
  water: '水',
  fermentTime: '发酵时间',
  ovenTemp: '烤温',
  other: '其他',
}

export const RESULT_LABELS: Record<BakingResult, string> = {
  success: '成功',
  failure: '失败',
  partial: '部分成功',
}

export const STATUS_LABELS: Record<RecordStatus, string> = {
  pending_review: '待复盘',
  improved: '已改良',
  failed: '失败',
}

export const FLOUR_TYPES = ['高筋面粉', '中筋面粉', '低筋面粉', '全麦面粉', '其他']
