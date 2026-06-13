import { URGENT_THRESHOLD_HOURS } from './constants'

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const isToday = (dateStr: string): boolean => {
  const date = new Date(dateStr)
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

export const getHoursSince = (dateStr: string): number => {
  const now = new Date()
  const date = new Date(dateStr)
  return (now.getTime() - date.getTime()) / (1000 * 60 * 60)
}

export const getDaysSince = (dateStr: string): number => {
  return Math.floor(getHoursSince(dateStr) / 24)
}

export const isUrgent = (inTime: string): boolean => {
  return getHoursSince(inTime) >= URGENT_THRESHOLD_HOURS
}

export const formatDuration = (dateStr: string): string => {
  const hours = getHoursSince(dateStr)
  if (hours < 1) {
    const minutes = Math.floor(hours * 60)
    return `${minutes}分钟`
  }
  if (hours < 24) {
    return `${Math.floor(hours)}小时`
  }
  const days = Math.floor(hours / 24)
  const remainingHours = Math.floor(hours % 24)
  if (remainingHours === 0) {
    return `${days}天`
  }
  return `${days}天${remainingHours}小时`
}

export const generateId = (): string => {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export const validatePhoneLastFour = (value: string): boolean => {
  return /^\d{4}$/.test(value)
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
