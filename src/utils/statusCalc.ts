import type { Gear, GearStatus, UsageRecord } from '@/types'

export function getGearStatus(
  gear: Gear,
  usageRecords: UsageRecord[]
): GearStatus {
  const totalUsage = getTotalUsage(gear, usageRecords)
  const usageRatio = gear.maxUsage > 0 ? totalUsage / gear.maxUsage : 0

  if (usageRatio >= 1) return 'retired'
  if (usageRatio >= 0.9) return 'overdue'

  const now = new Date()
  const lastMaintenance = gear.lastMaintenanceDate
    ? new Date(gear.lastMaintenanceDate)
    : new Date(gear.purchaseDate)
  const daysSinceMaintenance = Math.floor(
    (now.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)
  )

  const cycleRatio =
    gear.maintenanceCycleDays > 0
      ? daysSinceMaintenance / gear.maintenanceCycleDays
      : 0

  if (cycleRatio >= 1) return 'overdue'
  if (usageRatio >= 0.7 || cycleRatio >= 0.5) return 'due_soon'
  return 'good'
}

export function getTotalUsage(
  gear: Gear,
  usageRecords: UsageRecord[]
): number {
  const records = usageRecords.filter((r) => r.gearId === gear.id)
  if (gear.maxUsageUnit === 'km') {
    return records.reduce((sum, r) => sum + r.distance, 0)
  }
  if (gear.maxUsageUnit === 'hours') {
    return records.reduce((sum, r) => sum + r.duration, 0) / 60
  }
  return records.reduce((sum, r) => sum + r.count, 0)
}

export function getDaysUntilMaintenance(gear: Gear): number | null {
  if (gear.maintenanceCycleDays <= 0) return null
  const now = new Date()
  const lastMaintenance = gear.lastMaintenanceDate
    ? new Date(gear.lastMaintenanceDate)
    : new Date(gear.purchaseDate)
  const nextMaintenance = new Date(lastMaintenance)
  nextMaintenance.setDate(nextMaintenance.getDate() + gear.maintenanceCycleDays)
  const diff = Math.ceil(
    (nextMaintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  return diff
}

export function getStatusColor(status: GearStatus): string {
  switch (status) {
    case 'good':
      return '#34D399'
    case 'due_soon':
      return '#FBBF24'
    case 'overdue':
      return '#EF4444'
    case 'retired':
      return '#6B7280'
  }
}

export function getStatusBgClass(status: GearStatus): string {
  switch (status) {
    case 'good':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    case 'due_soon':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 'overdue':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'retired':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}
