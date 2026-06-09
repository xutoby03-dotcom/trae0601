export type PrinterStatus = 'normal' | 'low_supply' | 'fault' | 'procurement'

export interface Printer {
  id: string
  name: string
  location: string
  model: string
  consumableModels: string[]
  responsiblePerson: string
  supplier: string
  status: PrinterStatus
  createdAt: string
}

export type ReportType = 'no_paper' | 'paper_jam' | 'no_ink' | 'faint_print'
export type ImpactLevel = 'low' | 'medium' | 'high'
export type ReportStatus = 'open' | 'processing' | 'closed'

export interface Report {
  id: string
  printerId: string
  type: ReportType
  description: string
  photos: string[]
  impactLevel: ImpactLevel
  mergedCount: number
  mergedFrom: string[]
  status: ReportStatus
  createdAt: string
  createdBy: string
}

export type ConsumableCategory = 'paper' | 'toner' | 'ink_cartridge'

export interface Consumable {
  id: string
  name: string
  category: ConsumableCategory
  quantity: number
  unit: string
  threshold: number
  compatibleModels: string[]
}

export type ProcurementStatus = 'ordered' | 'arrived' | 'installed'

export interface Procurement {
  id: string
  consumableId: string
  quantity: number
  supplier: string
  cost: number
  status: ProcurementStatus
  orderedAt: string
  arrivedAt?: string
  installedAt?: string
}

export interface StockRecord {
  id: string
  consumableId: string
  type: 'in' | 'out'
  quantity: number
  reason: string
  createdAt: string
}

export interface MonthlyCost {
  month: string
  cost: number
}

export interface ConsumableTrend {
  month: string
  paper: number
  toner: number
  ink: number
}
