import type { LockerSize } from '@/types'

export const EXPRESS_COMPANIES = [
  '顺丰速运',
  '京东物流',
  '中通快递',
  '圆通速递',
  '申通快递',
  '韵达快递',
  '百世快递',
  '极兔速递',
  '中国邮政',
  '德邦快递',
  '其他',
] as const

export const LOCKER_SIZE_OPTIONS: { value: LockerSize; label: string; volume: string }[] = [
  { value: 'small', label: '小号', volume: '30×20×15cm' },
  { value: 'medium', label: '中号', volume: '40×30×25cm' },
  { value: 'large', label: '大号', volume: '60×40×35cm' },
  { value: 'xlarge', label: '超大', volume: '80×50×50cm' },
]

export const SIZE_LABEL: Record<LockerSize, string> = {
  small: '小号',
  medium: '中号',
  large: '大号',
  xlarge: '超大',
}

export const SIZE_BADGE_COLOR: Record<LockerSize, string> = {
  small: 'bg-slate-100 text-slate-600',
  medium: 'bg-primary-100 text-primary-700',
  large: 'bg-blue-100 text-blue-700',
  xlarge: 'bg-purple-100 text-purple-700',
}

export const URGENT_THRESHOLD_HOURS = 48
