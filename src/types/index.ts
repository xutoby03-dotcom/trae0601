export interface Sample {
  id: string
  code: string
  type: string
  batch: string
  tempMin: number
  tempMax: number
  currentTemp: number
  expiryDate: string
  hazardLevel: number
  photo: string
  totalQuantity: number
  remainingQuantity: number
  status: 'normal' | 'expiring' | 'expired' | 'temp_abnormal'
  createdAt: string
  updatedAt: string
}

export interface CheckoutRecord {
  id: string
  sampleId: string
  className: string
  labBench: string
  studentName: string
  quantity: number
  checkoutTime: string
  teacherConfirmed: boolean
  teacherName: string
  status: 'pending' | 'confirmed' | 'rejected' | 'returned' | 'disposed'
}

export interface ReturnRecord {
  id: string
  checkoutId: string
  sampleId: string
  type: 'return' | 'dispose'
  remainingQuantity: number
  contaminated: boolean
  contaminationDesc: string
  disposalMethod: 'incineration' | 'chemical' | 'autoclave' | 'other'
  returnPerson: string
  returnTime: string
  reason: string
}

export const SAMPLE_TYPES = ['血液', '组织', '细胞', '微生物', '化学试剂', '其他'] as const
export const DISPOSAL_METHODS = [
  { value: 'incineration', label: '焚烧处理' },
  { value: 'chemical', label: '化学处理' },
  { value: 'autoclave', label: '高压灭菌' },
  { value: 'other', label: '其他方式' },
] as const
export const DISPOSE_REASONS = ['过期', '污染', '损坏', '实验结束', '其他'] as const
