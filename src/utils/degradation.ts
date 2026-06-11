import type { DegradationLevel } from '@/store/types'

interface CheckupInput {
  voltage: number
  fullChargeHours: number
  actualRange: number
  nominalRange: number
  chargeHabit: 'daily' | 'every2days' | 'every3days'
  heatAnomaly: 'none' | 'occasional' | 'yes'
}

function calcRangeScore(actualRange: number, nominalRange: number): number {
  if (nominalRange <= 0) return 0
  const ratio = actualRange / nominalRange
  if (ratio >= 0.9) return 100
  if (ratio >= 0.75) return 80
  if (ratio >= 0.6) return 55
  if (ratio >= 0.4) return 30
  return 10
}

function calcVoltageScore(voltage: number): number {
  const nominalVoltage = 48
  const deviation = Math.abs(voltage - nominalVoltage)
  if (deviation <= 1) return 100
  if (deviation <= 3) return 80
  if (deviation <= 5) return 55
  if (deviation <= 8) return 30
  return 10
}

function calcChargeTimeScore(hours: number, chargeHabit: string): number {
  const baseHours: Record<string, number> = {
    daily: 4,
    every2days: 6,
    every3days: 8,
  }
  const base = baseHours[chargeHabit] || 6
  const increase = hours - base
  if (increase <= 0) return 100
  if (increase <= 1) return 80
  if (increase <= 2) return 55
  if (increase <= 4) return 30
  return 10
}

function calcHeatScore(heatAnomaly: string): number {
  if (heatAnomaly === 'none') return 100
  if (heatAnomaly === 'occasional') return 55
  return 20
}

export function calculateDegradation(input: CheckupInput): {
  score: number
  level: DegradationLevel
  suggestion: string
} {
  const rangeScore = calcRangeScore(input.actualRange, input.nominalRange)
  const voltageScore = calcVoltageScore(input.voltage)
  const chargeTimeScore = calcChargeTimeScore(input.fullChargeHours, input.chargeHabit)
  const heatScore = calcHeatScore(input.heatAnomaly)

  const score = Math.round(
    rangeScore * 0.4 + voltageScore * 0.3 + chargeTimeScore * 0.2 + heatScore * 0.1
  )

  let level: DegradationLevel
  let suggestion: string

  if (score >= 85) {
    level = 'A'
    suggestion = '电池状态良好，建议保持现有充电习惯，定期体检。'
  } else if (score >= 70) {
    level = 'B'
    suggestion = '电池轻微衰减，建议减少快充频率，避免过充过放，3个月内复查。'
  } else if (score >= 50) {
    level = 'C'
    suggestion = '电池明显衰减，建议前往专业门店检测，考虑更换电池，避免长时间骑行。'
  } else if (score >= 30) {
    level = 'D'
    suggestion = '电池严重衰减，续航大幅下降，强烈建议尽快更换电池，注意充电安全。'
  } else {
    level = 'E'
    suggestion = '⚠️ 电池状态危险！存在安全隐患，请立即停止使用并更换电池，联系物业报备。'
  }

  return { score, level, suggestion }
}

export function getLevelColor(level: DegradationLevel): string {
  const colors: Record<DegradationLevel, string> = {
    A: 'emerald',
    B: 'amber',
    C: 'orange',
    D: 'red',
    E: 'rose',
  }
  return colors[level]
}

export function getLevelLabel(level: DegradationLevel): string {
  const labels: Record<DegradationLevel, string> = {
    A: '健康',
    B: '轻微衰减',
    C: '明显衰减',
    D: '严重衰减',
    E: '危险',
  }
  return labels[level]
}

export function getStatusZone(level: DegradationLevel): 'normal' | 'check' | 'degraded' | 'danger' {
  if (level === 'A') return 'normal'
  if (level === 'B') return 'check'
  if (level === 'C') return 'degraded'
  return 'danger'
}
