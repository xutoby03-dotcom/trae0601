export interface Plan {
  id: string
  tankNumber: string
  species: string
  speciesTemplate: string
  totalDays: number
  startDate: string
  createdAt: string
}

export interface DailySchedule {
  id: string
  planId: string
  dayIndex: number
  blueRatio: number
  whiteRatio: number
  purpleRatio: number
  brightness: number
}

export interface Observation {
  id: string
  planId: string
  dayIndex: number
  extensionLevel: 1 | 2 | 3 | 4 | 5
  floatHeight: 'top' | 'middle' | 'bottom'
  feedingResponse: 'active' | 'moderate' | 'refuse'
  wallCollision: boolean
  notes: string
  recordedAt: string
}

export interface SpeciesTemplate {
  id: string
  name: string
  description: string
  defaultDays: number
  startBlue: number
  startWhite: number
  startPurple: number
  startBrightness: number
  endBlue: number
  endWhite: number
  endPurple: number
  endBrightness: number
}

export interface AnomalyDetail {
  type: string
  dayIndices: number[]
  severity: 'warning' | 'critical'
  message: string
}

export interface AdjustmentSuggestion {
  targetDay: number
  currentBlue: number
  currentWhite: number
  currentPurple: number
  currentBrightness: number
  suggestedBlue: number
  suggestedWhite: number
  suggestedPurple: number
  suggestedBrightness: number
  reason: string
}

export interface AppliedAdjustment {
  id: string
  planId: string
  targetDay: number
  originalBlue: number
  originalWhite: number
  originalPurple: number
  originalBrightness: number
  adjustedBlue: number
  adjustedWhite: number
  adjustedPurple: number
  adjustedBrightness: number
  reason: string
  appliedAt: string
}
