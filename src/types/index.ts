export type PlanStatus = 'voting' | 'funding' | 'purchased' | 'delivered' | 'completed'
export type PackagingStatus = 'none' | 'packing' | 'packed'

export interface GiftCandidate {
  id: string
  name: string
  price: number
  imageUrl: string
  purchaseLink: string
  votes: string[]
}

export interface Participant {
  id: string
  name: string
  pledgedAmount: number
  hasPaid: boolean
  advancedAmount: number
}

export interface AvoidanceNote {
  id: string
  authorName: string
  content: string
  createdAt: string
}

export interface OrderInfo {
  orderNumber: string
  courier: string
  estimatedArrival: string
  packagingStatus: PackagingStatus
  actualArrival: string
}

export interface BlessingAssignment {
  id: string
  participantName: string
  blessingContent: string
  isCompleted: boolean
}

export interface RefundRecord {
  id: string
  amount: number
  reason: string
  refundTo: string
  createdAt: string
}

export interface BudgetAdjustment {
  id: string
  additionalAmount: number
  reason: string
  createdAt: string
}

export interface Plan {
  id: string
  birthdayPerson: string
  birthdayDate: string
  totalBudget: number
  shippingAddress: string
  organizerName: string
  responsiblePerson: string
  status: PlanStatus
  createdAt: string
  giftCandidates: GiftCandidate[]
  participants: Participant[]
  avoidanceNotes: AvoidanceNote[]
  orderInfo: OrderInfo | null
  blessingAssignments: BlessingAssignment[]
  refundRecords: RefundRecord[]
  budgetAdjustments: BudgetAdjustment[]
}
