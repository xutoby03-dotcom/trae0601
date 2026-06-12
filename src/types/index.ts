export interface Device {
  id: string
  name: string
  brand: string
  model: string
  category: string
  room: string
  purchaseDate: string
  warrantyYears: number
  purchaseChannel: string
  invoicePhoto?: string
  warrantyCardPhoto?: string
  devicePhoto?: string
  notes?: string
  createdAt: string
}

export interface MaintenanceRecord {
  id: string
  deviceId: string
  date: string
  fault: string
  repairShop: string
  cost: number
  coveredByWarranty: boolean
  repairOrderPhoto?: string
  notes?: string
  createdAt: string
}

export type WarrantyStatus = 'in-warranty' | 'expiring-soon' | 'expired'

export interface DeviceFilters {
  search?: string
  brand?: string
  room?: string
  warrantyStatus?: WarrantyStatus | 'all'
}
