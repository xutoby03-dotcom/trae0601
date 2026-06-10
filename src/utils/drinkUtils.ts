import type { DrinkType, Scenario, Member } from '@/types'
import { DRINK_TYPE_CONFIG, SCENARIO_CONFIG, getEffectiveWater } from '@/types'

export function getDrinkTypeInfo(type: DrinkType) {
  return DRINK_TYPE_CONFIG[type]
}

export function getScenarioInfo(scenario: Scenario) {
  return SCENARIO_CONFIG[scenario]
}

export function getMemberProgress(member: Member, effectiveWater: number) {
  return Math.min(effectiveWater / member.dailyGoal, 1)
}

export function getMemberStatus(member: Member, effectiveWater: number, hour: number): string {
  const progress = effectiveWater / member.dailyGoal

  if (member.limitWater) {
    if (progress >= 1) return '已达上限 🚫'
    if (progress >= 0.9) return '接近上限 ⚠️'
    if (hour >= 20 && progress >= 0.7) return '睡前少喝 🌙'
    if (hour >= 20) return '晚上了少喝点 🌙'
  } else {
    if (progress >= 1) return '已达标 🎉'
    if (progress >= 0.8) return '快达标了'
  }

  if (progress < 0.3 && hour > 12) return '该多喝水了'
  const remaining = member.dailyGoal - effectiveWater
  return `还差 ${remaining}ml`
}

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function getWeekDays(): Date[] {
  const today = new Date()
  const days: Date[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    days.push(d)
  }
  return days
}

export function getHourlyDistribution(records: { timestamp: number }[]): number[] {
  const hours = new Array(24).fill(0)
  records.forEach((r) => {
    const h = new Date(r.timestamp).getHours()
    hours[h]++
  })
  return hours
}

export function getEffectiveWaterForRecords(records: { amount: number; drinkType: DrinkType }[]): number {
  return records.reduce((sum, r) => sum + getEffectiveWater(r.amount, r.drinkType), 0)
}

export function getDayLabel(date: Date): string {
  const today = new Date()
  const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  return `周${weekDays[date.getDay()]}`
}

export function shouldShowReminder(member: Member, lastRecordTime: number | null): string | null {
  const now = new Date()
  const hour = now.getHours()

  if (member.limitWater && hour >= 20) {
    return `${member.name} 睡前少喝水 🌙`
  }

  if (lastRecordTime && Date.now() - lastRecordTime > 2 * 60 * 60 * 1000) {
    return `${member.name} 该喝水了 💧`
  }

  if (hour >= 14 && hour <= 16) {
    return `下午容易忘记喝水，记得提醒家人 💧`
  }

  return null
}
