export type IndicatorLevel = "none" | "mild" | "severe"
export type AdhesionLevel = "excellent" | "good" | "poor"
export type ObservationDay = 1 | 3 | 7
export type ScenarioType = "kitchen" | "bathroom" | "window" | "balcony" | "general"

export interface Sample {
  id: string
  brand: string
  model: string
  color: string
  substrate: string
  thickness: number
  temperature: number
  humidity: number
  initialPhoto: string
  createdAt: string
}

export interface Observation {
  id: string
  sampleId: string
  day: ObservationDay
  photos: string[]
  shrinkage: IndicatorLevel
  bubbles: IndicatorLevel
  yellowing: IndicatorLevel
  moldSpots: IndicatorLevel
  adhesion: AdhesionLevel
  notes: string
  observedAt: string
}

export interface RecommendationResult {
  scenario: ScenarioType
  sampleId: string
  score: number
  reasons: string[]
}

export const OBSERVATION_DAYS: ObservationDay[] = [1, 3, 7]

export const SUBSTRATE_OPTIONS = [
  "瓷砖",
  "玻璃",
  "铝合金",
  "石材",
  "木材",
  "PVC",
  "不锈钢",
  "其他",
]

export const COLOR_OPTIONS = [
  "白色",
  "透明",
  "黑色",
  "灰色",
  "米色",
  "棕色",
  "其他",
]

export const SCENARIO_LABELS: Record<ScenarioType, string> = {
  kitchen: "厨房",
  bathroom: "卫生间",
  window: "窗边",
  balcony: "阳台",
  general: "通用",
}

export const SCENARIO_ICONS: Record<ScenarioType, string> = {
  kitchen: "ChefHat",
  bathroom: "Droplets",
  window: "PanelLeft",
  balcony: "Sun",
  general: "Layers",
}

export const INDICATOR_LABELS = {
  shrinkage: "收缩",
  bubbles: "气泡",
  yellowing: "发黄",
  moldSpots: "霉点",
  adhesion: "附着力",
} as const

export const INDICATOR_LEVEL_LABELS: Record<IndicatorLevel, string> = {
  none: "无",
  mild: "轻微",
  severe: "明显",
}

export const ADHESION_LEVEL_LABELS: Record<AdhesionLevel, string> = {
  excellent: "优",
  good: "良",
  poor: "差",
}
