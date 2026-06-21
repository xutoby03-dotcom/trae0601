import type {
  Observation,
  RecommendationResult,
  ScenarioType,
  Sample,
} from "@/types"
import { hasAllThreeDays, hasDay7 } from "@/utils/observation"

const INDICATOR_SCORES: Record<string, number> = {
  none: 3,
  mild: 1,
  severe: 0,
}

const ADHESION_SCORES: Record<string, number> = {
  excellent: 3,
  good: 1,
  poor: 0,
}

const SCENARIO_WEIGHTS: Record<
  ScenarioType,
  { shrinkage: number; bubbles: number; yellowing: number; moldSpots: number; adhesion: number }
> = {
  kitchen: { shrinkage: 1, bubbles: 1, yellowing: 2, moldSpots: 1, adhesion: 1.5 },
  bathroom: { shrinkage: 1.5, bubbles: 1, yellowing: 1, moldSpots: 2, adhesion: 1 },
  window: { shrinkage: 2, bubbles: 1, yellowing: 1, moldSpots: 1, adhesion: 1.5 },
  balcony: { shrinkage: 1.5, bubbles: 1, yellowing: 1.5, moldSpots: 1, adhesion: 1 },
  general: { shrinkage: 1, bubbles: 1, yellowing: 1, moldSpots: 1, adhesion: 1 },
}

function getLatestObservation(
  observations: Observation[]
): Observation | undefined {
  if (observations.length === 0) return undefined
  return observations.reduce((latest, obs) =>
    obs.day > latest.day ? obs : latest
  )
}

function computeSampleScore(
  observations: Observation[],
  scenario: ScenarioType
): number {
  const latest = getLatestObservation(observations)
  if (!latest) return 0

  const weights = SCENARIO_WEIGHTS[scenario]
  const indicators = [
    { key: "shrinkage" as const, value: latest.shrinkage, weight: weights.shrinkage },
    { key: "bubbles" as const, value: latest.bubbles, weight: weights.bubbles },
    { key: "yellowing" as const, value: latest.yellowing, weight: weights.yellowing },
    { key: "moldSpots" as const, value: latest.moldSpots, weight: weights.moldSpots },
    { key: "adhesion" as const, value: latest.adhesion, weight: weights.adhesion },
  ]

  let totalWeight = 0
  let weightedScore = 0

  for (const indicator of indicators) {
    const scoreMap = indicator.key === "adhesion" ? ADHESION_SCORES : INDICATOR_SCORES
    const score = scoreMap[indicator.value] ?? 0
    weightedScore += score * indicator.weight
    totalWeight += indicator.weight * 3
  }

  return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0
}

function generateReasons(
  observations: Observation[],
  scenario: ScenarioType
): string[] {
  const latest = getLatestObservation(observations)
  if (!latest) return ["暂无观察数据"]

  const reasons: string[] = []
  const weights = SCENARIO_WEIGHTS[scenario]

  if (latest.shrinkage === "none" && weights.shrinkage > 1) {
    reasons.push("无收缩，适合温差变化大的环境")
  }
  if (latest.yellowing === "none" && weights.yellowing > 1) {
    reasons.push("未发黄，适合光照充足区域")
  }
  if (latest.moldSpots === "none" && weights.moldSpots > 1) {
    reasons.push("无霉点，适合潮湿环境")
  }
  if (latest.adhesion === "excellent" && weights.adhesion > 1) {
    reasons.push("附着力优秀，适合承力部位")
  }
  if (latest.bubbles === "none") {
    reasons.push("无气泡，施工质量稳定")
  }

  if (reasons.length === 0) {
    if (latest.shrinkage !== "none") reasons.push("存在收缩现象")
    if (latest.yellowing !== "none") reasons.push("存在发黄现象")
    if (latest.moldSpots !== "none") reasons.push("存在霉点")
    if (latest.adhesion !== "excellent") reasons.push("附着力一般")
  }

  return reasons.slice(0, 3)
}

export function getRecommendations(
  samples: Sample[],
  observations: Observation[]
): Record<ScenarioType, RecommendationResult[]> {
  const scenarios: ScenarioType[] = [
    "kitchen",
    "bathroom",
    "window",
    "balcony",
    "general",
  ]

  const results: Record<ScenarioType, RecommendationResult[]> = {
    kitchen: [],
    bathroom: [],
    window: [],
    balcony: [],
    general: [],
  }

  for (const scenario of scenarios) {
    const scenarioResults: RecommendationResult[] = samples
      .map((sample) => {
        const sampleObs = observations.filter(
          (o) => o.sampleId === sample.id
        )
        return {
          scenario,
          sampleId: sample.id,
          score: computeSampleScore(sampleObs, scenario),
          reasons: generateReasons(sampleObs, scenario),
        }
      })
      .filter((r) => {
        if (r.score <= 0) return false
        const sampleObs = observations.filter(
          (o) => o.sampleId === r.sampleId
        )
        if (!hasDay7(sampleObs)) return false
        if (scenario === "kitchen" || scenario === "bathroom" || scenario === "window") {
          return hasAllThreeDays(sampleObs)
        }
        return true
      })
      .sort((a, b) => b.score - a.score)

    results[scenario] = scenarioResults
  }

  return results
}

export function getRadarData(observations: Observation[]): number[] {
  const latest = getLatestObservation(observations)
  if (!latest) return [0, 0, 0, 0, 0]

  return [
    INDICATOR_SCORES[latest.shrinkage],
    INDICATOR_SCORES[latest.bubbles],
    INDICATOR_SCORES[latest.yellowing],
    INDICATOR_SCORES[latest.moldSpots],
    ADHESION_SCORES[latest.adhesion],
  ]
}
