export interface Consumable {
  id: string
  name: string
  specification: string
  unit: string
  stock: number
  minAlert: number
  cabinet: string
  isHazardous: boolean
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export interface Requisition {
  id: string
  consumableId: string
  projectName: string
  quantity: number
  purpose: string
  advisor: string
  returnNote: string
  applicant: string
  status: 'pending' | 'approved' | 'rejected' | 'hazardous_pending'
  isHazardous: boolean
  createdAt: string
  approvedAt?: string
  approvedBy?: string
  rejectReason?: string
}

export interface Restock {
  id: string
  consumableId: string
  quantity: number
  operator: string
  createdAt: string
}
