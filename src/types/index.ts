export interface HearingAid {
  id: string
  side: 'left' | 'right'
  model: string
  batteryType: 'rechargeable' | 'disposable_13' | 'disposable_312' | 'disposable_10' | 'disposable_675'
  chargingCase: string
  purchaseDate: string
  warrantyPhone: string
}

export interface DailyRecord {
  id: string
  aidId: string
  date: string
  wearingHours: number
  batteryLevel: number
  isCharging: boolean
  hasWhistling: boolean
  hasHearingIssue: boolean
  notes: string
}

export interface Reminder {
  id: string
  type: 'before_sleep_charge' | 'before_out_check' | 'regular_maintenance' | 'custom'
  time: string
  aidIds: string[]
  enabled: boolean
  description: string
}

export interface MaintenanceRecord {
  id: string
  aidId: string
  date: string
  type: 'clean_filter' | 'replace_ear_tip' | 'repair' | 'other'
  notes: string
}

export const BATTERY_TYPE_LABELS: Record<HearingAid['batteryType'], string> = {
  rechargeable: '可充电',
  disposable_13: '13号电池',
  disposable_312: '312号电池',
  disposable_10: '10号电池',
  disposable_675: '675号电池',
}

export const REMINDER_TYPE_LABELS: Record<Reminder['type'], string> = {
  before_sleep_charge: '睡前充电',
  before_out_check: '出门前检查',
  regular_maintenance: '定期维护',
  custom: '自定义',
}

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceRecord['type'], string> = {
  clean_filter: '清洁滤网',
  replace_ear_tip: '更换耳塞',
  repair: '维修',
  other: '其他',
}

export const SIDE_LABELS: Record<HearingAid['side'], string> = {
  left: '左耳',
  right: '右耳',
}
