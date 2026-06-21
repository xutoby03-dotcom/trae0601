import type { Observation, DailySchedule, AnomalyDetail, AdjustmentSuggestion } from '@/types'

export function detectAnomalies(observations: Observation[]): AnomalyDetail[] {
  const anomalies: AnomalyDetail[] = []
  const sorted = [...observations].sort((a, b) => a.dayIndex - b.dayIndex)

  const extensionAnomalyDays = sorted.filter(o => o.extensionLevel <= 2).map(o => o.dayIndex)
  const floatAnomalyDays = sorted.filter(o => o.floatHeight === 'bottom').map(o => o.dayIndex)
  const feedingAnomalyDays = sorted.filter(o => o.feedingResponse === 'refuse').map(o => o.dayIndex)
  const collisionAnomalyDays = sorted.filter(o => o.wallCollision).map(o => o.dayIndex)

  const findConsecutive = (days: number[]): number[][] => {
    if (days.length === 0) return []
    const groups: number[][] = []
    let current = [days[0]]
    for (let i = 1; i < days.length; i++) {
      if (days[i] === days[i - 1] + 1) {
        current.push(days[i])
      } else {
        groups.push(current)
        current = [days[i]]
      }
    }
    groups.push(current)
    return groups.filter(g => g.length >= 2)
  }

  const makeAnomaly = (type: string, days: number[], msg: string): AnomalyDetail | null => {
    const consecutive = findConsecutive(days)
    if (consecutive.length === 0) return null
    const allDays = consecutive.flat()
    return {
      type,
      dayIndices: allDays,
      severity: allDays.length >= 4 ? 'critical' : 'warning',
      message: msg,
    }
  }

  const ext = makeAnomaly('extension', extensionAnomalyDays, '舒展度连续偏低，水母可能因光强应激缩伞')
  if (ext) anomalies.push(ext)

  const flt = makeAnomaly('float', floatAnomalyDays, '漂浮高度持续偏低，水母活力不足或光线刺激过强')
  if (flt) anomalies.push(flt)

  const fed = makeAnomaly('feeding', feedingAnomalyDays, '摄食反应连续拒绝，水母可能处于应激状态')
  if (fed) anomalies.push(fed)

  const col = makeAnomaly('collision', collisionAnomalyDays, '连续撞壁，水母定向能力受损，灯光可能造成眩晕')
  if (col) anomalies.push(col)

  return anomalies
}

export function generateSuggestions(
  anomalies: AnomalyDetail[],
  schedules: DailySchedule[],
  observations: Observation[]
): AdjustmentSuggestion[] {
  if (anomalies.length === 0) return []

  const anomalyRatio = observations.length > 0
    ? anomalies.reduce((sum, a) => sum + a.dayIndices.length, 0) / schedules.length
    : 0

  if (anomalyRatio < 0.2 && !anomalies.some(a => a.severity === 'critical')) return []

  const sorted = [...schedules].sort((a, b) => a.dayIndex - b.dayIndex)
  const suggestions: AdjustmentSuggestion[] = []

  const hasExtension = anomalies.some(a => a.type === 'extension')
  const hasCollision = anomalies.some(a => a.type === 'collision')

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]

    const blueDelta = Math.abs(curr.blueRatio - prev.blueRatio)
    const whiteDelta = Math.abs(curr.whiteRatio - prev.whiteRatio)
    const purpleDelta = Math.abs(curr.purpleRatio - prev.purpleRatio)
    const brightDelta = Math.abs(curr.brightness - prev.brightness)

    const shouldSlow = hasExtension || hasCollision
    const anyDelta = blueDelta + whiteDelta + purpleDelta + brightDelta
    if (anyDelta === 0) continue

    const factor = shouldSlow ? 0.3 : 0.5

    const sBlue = Math.round(prev.blueRatio + (curr.blueRatio - prev.blueRatio) * factor)
    const sWhite = Math.round(prev.whiteRatio + (curr.whiteRatio - prev.whiteRatio) * factor)
    const sPurple = Math.round(prev.purpleRatio + (curr.purpleRatio - prev.purpleRatio) * factor)
    const sBright = Math.round(prev.brightness + (curr.brightness - prev.brightness) * factor)

    if (sBlue !== curr.blueRatio || sWhite !== curr.whiteRatio || sPurple !== curr.purpleRatio || sBright !== curr.brightness) {
      suggestions.push({
        targetDay: curr.dayIndex,
        currentBlue: curr.blueRatio,
        currentWhite: curr.whiteRatio,
        currentPurple: curr.purpleRatio,
        currentBrightness: curr.brightness,
        suggestedBlue: sBlue,
        suggestedWhite: sWhite,
        suggestedPurple: sPurple,
        suggestedBrightness: sBright,
        reason: hasExtension
          ? '舒展度异常：建议将光变化幅度降低至原计划的30%，优先稳定蓝光比例'
          : hasCollision
            ? '撞壁异常：建议大幅减缓亮度变化，降低白光增幅'
            : '检测到异常指标：建议将光变化幅度降低至原计划的50%',
      })
    }
  }

  return suggestions
}
