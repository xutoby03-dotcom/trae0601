import { addYears, differenceInDays, differenceInMonths, isAfter, isBefore, format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Device, WarrantyStatus } from '../types'

export function getWarrantyEndDate(device: Device): Date {
  const purchaseDate = parseISO(device.purchaseDate)
  return addYears(purchaseDate, device.warrantyYears)
}

export function getWarrantyStatus(device: Device): WarrantyStatus {
  const endDate = getWarrantyEndDate(device)
  const now = new Date()
  const daysLeft = differenceInDays(endDate, now)

  if (isBefore(endDate, now)) {
    return 'expired'
  }
  if (daysLeft <= 90) {
    return 'expiring-soon'
  }
  return 'in-warranty'
}

export function getDaysLeft(device: Device): number {
  const endDate = getWarrantyEndDate(device)
  return differenceInDays(endDate, new Date())
}

export function getMonthsLeft(device: Device): number {
  const endDate = getWarrantyEndDate(device)
  return differenceInMonths(endDate, new Date())
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy年MM月dd日', { locale: zhCN })
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MM/dd', { locale: zhCN })
}

export function isExpiringThisYear(device: Device): boolean {
  const endDate = getWarrantyEndDate(device)
  const now = new Date()
  const endOfYear = new Date(now.getFullYear(), 11, 31)
  return isAfter(endDate, now) && isBefore(endDate, endOfYear)
}

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
