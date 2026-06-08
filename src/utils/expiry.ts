import { differenceInDays, parseISO } from 'date-fns'
import type { ExpiryStatus, Medicine } from '@/types'

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const days = differenceInDays(parseISO(expiryDate), new Date())
  if (days <= 0) return 'expired'
  if (days <= 30) return 'expiring_soon'
  return 'normal'
}

export function getDaysUntilExpiry(expiryDate: string): number {
  return differenceInDays(parseISO(expiryDate), new Date())
}

export function isLowStock(medicine: Medicine): boolean {
  return medicine.quantity <= medicine.lowStockThreshold
}

export function needsRestock(medicine: Medicine): boolean {
  return isLowStock(medicine) || getExpiryStatus(medicine.expiryDate) !== 'normal'
}

export function getExpiryStatusLabel(status: ExpiryStatus): string {
  switch (status) {
    case 'expired': return '已过期'
    case 'expiring_soon': return '即将过期'
    case 'normal': return '正常'
  }
}

export function getExpiryStatusColor(status: ExpiryStatus): string {
  switch (status) {
    case 'expired': return 'text-red-600 bg-red-50 border-red-200'
    case 'expiring_soon': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'normal': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  }
}

export function getRestockReasonLabel(reason: 'low_stock' | 'expiring_soon'): string {
  switch (reason) {
    case 'low_stock': return '库存不足'
    case 'expiring_soon': return '即将过期'
  }
}
