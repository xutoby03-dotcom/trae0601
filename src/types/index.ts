export type VentType = '排风管外排' | '冷凝式' | '热泵式'

export type ClothingType = '棉织物' | '化纤' | '羊毛' | '丝绸' | '混合' | '毛巾' | '床单'

export type DryingProgram = '标准' | '快速' | '轻柔' | '强力' | '节能' | '定时'

export type LintAmount = '少量' | '中等' | '大量' | '极多'

export type CondensateStatus = '正常' | '需清理' | '已满'

export interface Device {
  id: string
  model: string
  capacity: number
  location: string
  ventType: VentType
  purchaseDate: string
  photoUrl: string
  createdAt: string
  updatedAt: string
}

export interface DryingRecord {
  id: string
  deviceId: string
  clothingTypes: ClothingType[]
  weight: number
  program: DryingProgram
  duration: number
  filterCleaned: boolean
  date: string
  createdAt: string
}

export interface CleaningRecord {
  id: string
  deviceId: string
  dryingRecordId: string
  lintAmount: LintAmount
  ventChecked: boolean
  hasOdor: boolean
  hasNoise: boolean
  condensateStatus: CondensateStatus
  notes: string
  date: string
  createdAt: string
}
