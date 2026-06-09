export interface Runner {
  id: string
  nickname: string
  avatar: string
  defaultPace: number
}

export interface Route {
  id: string
  name: string
  type: 'track' | 'riverside' | 'street' | 'park'
  distance: number
  wellLit: boolean
  description: string
  color: string
  pathPoints: { x: number; y: number }[]
}

export interface Activity {
  id: string
  routeId: string
  organizerId: string
  startPoint: string
  expectedPace: number
  expectedDistance: number
  startTime: string
  acceptBeginner: boolean
  notes: string
  status: 'upcoming' | 'ongoing' | 'completed'
  createdAt: string
}

export interface Participation {
  id: string
  activityId: string
  runnerId: string
  pace: number
  targetDistance: number
  completed: boolean
  noShow: boolean
  actualDistance: number
  actualDuration: number
}

export interface SafetyAlert {
  id: string
  type: 'late_night' | 'poor_lighting' | 'rain' | 'solo_return'
  message: string
  routeId?: string
  timestamp: string
}

export interface MonthlyStats {
  totalDistance: number
  totalRuns: number
  averagePace: number
  routeRanking: { routeId: string; name: string; count: number }[]
  partnerRanking: { runnerId: string; nickname: string; avatar: string; attendCount: number }[]
  weeklyDistances: number[]
}
