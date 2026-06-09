export interface Vehicle {
  id: string
  plateNumber: string
  model: string
  purchaseDate: string
  currentMileage: number
  insuranceExpiry: string
  inspectionExpiry: string
  preferredShop: string
}

export interface MaintenanceRecord {
  id: string
  vehicleId: string
  date: string
  items: string
  mileage: number
  cost: number
  partsBrand: string
  nextSuggestedMileage: number
  notes: string
}

export interface FaultRecord {
  id: string
  vehicleId: string
  date: string
  description: string
  severity: 'low' | 'medium' | 'high'
  status: 'pending' | 'processing' | 'resolved'
  linkedMaintenanceId: string | null
  resolvedDate: string | null
}

export interface ReminderItem {
  id: string
  vehicleId: string
  vehiclePlate: string
  type: 'insurance' | 'inspection' | 'mileage_oil' | 'mileage_tire' | 'mileage_other'
  label: string
  remaining: string
  isOverdue: boolean
  isUrgent: boolean
  daysLeft?: number
  kmLeft?: number
}

export type ReminderGroup = {
  title: string
  items: ReminderItem[]
}
