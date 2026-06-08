import type { Gear, UsageRecord } from '@/types'
import { getTotalUsage } from './statusCalc'

export function getDepreciationRate(
  gear: Gear,
  usageRecords: UsageRecord[]
): number {
  if (gear.maxUsage <= 0) return 0
  const totalUsage = getTotalUsage(gear, usageRecords)
  return Math.min(totalUsage / gear.maxUsage, 1)
}

export function getRemainingValue(
  gear: Gear,
  usageRecords: UsageRecord[]
): number {
  const rate = getDepreciationRate(gear, usageRecords)
  return gear.price * (1 - rate)
}

export function getDepreciationPercent(
  gear: Gear,
  usageRecords: UsageRecord[]
): number {
  return Math.round(getDepreciationRate(gear, usageRecords) * 100)
}

export function getLifeExpectancy(
  gear: Gear,
  usageRecords: UsageRecord[]
): { used: number; total: number; unit: string } {
  const used = getTotalUsage(gear, usageRecords)
  return {
    used: Math.round(used * 10) / 10,
    total: gear.maxUsage,
    unit: gear.maxUsageUnit,
  }
}
