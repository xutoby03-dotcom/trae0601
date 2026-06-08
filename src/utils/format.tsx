import { ROOMS } from '@/types'
import type { RoomId } from '@/types'
import { ChefHat, Bath, Bed, Sofa, Sun, DoorOpen, BookOpen, Home } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  ChefHat,
  Bath,
  Bed,
  Sofa,
  Sun,
  DoorOpen,
  BookOpen,
  Home,
}

export function getRoomIcon(roomId: RoomId, className = 'w-4 h-4') {
  const room = ROOMS.find((r) => r.id === roomId)
  if (!room) return <Home className={className} />
  const Icon = iconMap[room.icon] || Home
  return <Icon className={className} />
}

export function getRoomName(roomId: RoomId) {
  const room = ROOMS.find((r) => r.id === roomId)
  return room?.name || '其他'
}

export function formatCurrency(amount: number) {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}`
}

export function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function formatDateTime(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function formatRelativeTime(dateStr: string) {
  const now = new Date()
  const d = new Date(dateStr)
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${Math.floor(days / 30)}月前`
}

export function getDaysSince(dateStr: string) {
  const now = new Date()
  const d = new Date(dateStr)
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}
