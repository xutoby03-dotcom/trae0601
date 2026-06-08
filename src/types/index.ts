export interface Plan {
  id: string
  name: string
  monthlyFee: number
  discountedFee: number
  speed: number
  uploadSpeed: number
  contractMonths: number
  installFee: number
  routerFee: number
  freeData: string
  tvPackage: string
  earlyTerminationFee: number
  discountEndDate: string
}

export interface FamilyNeeds {
  gaming: boolean
  remoteWork: boolean
  elderlyTV: boolean
  multiVideo: boolean
}

export interface CostResult {
  months12: number
  months24: number
  breakdown: CostBreakdown
}

export interface CostBreakdown {
  monthlyTotal: number
  installFee: number
  routerFee: number
  discountSaving: number
}

export interface Pitfall {
  type: 'warning' | 'danger'
  title: string
  description: string
  planName: string
}

export interface MatchScore {
  gaming: number
  remoteWork: number
  elderlyTV: number
  multiVideo: number
  overall: number
}

export const EMPTY_PLAN: Omit<Plan, 'id'> = {
  name: '',
  monthlyFee: 0,
  discountedFee: 0,
  speed: 0,
  uploadSpeed: 0,
  contractMonths: 12,
  installFee: 0,
  routerFee: 0,
  freeData: '',
  tvPackage: '',
  earlyTerminationFee: 0,
  discountEndDate: '',
}
