import type { DeviceStatus, ArmrestType, FootPadStatus, DisinfectMethod, DryingLocation } from '@/types'

export const DEVICE_STATUS_MAP: Record<DeviceStatus, { label: string; color: string; bg: string }> = {
  available: { label: '可用', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  in_use: { label: '使用中', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  pending_clean: { label: '待清洁', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  pending_maintenance: { label: '待维修', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  disabled: { label: '已停用', color: 'text-zinc-500', bg: 'bg-zinc-100 border-zinc-300' },
}

export const ARMREST_TYPE_MAP: Record<ArmrestType, string> = {
  fixed: '固定扶手',
  removable: '可拆卸扶手',
  none: '无扶手',
}

export const FOOT_PAD_STATUS_MAP: Record<FootPadStatus, { label: string; color: string }> = {
  good: { label: '完好', color: 'text-teal-600' },
  worn: { label: '磨损', color: 'text-amber-600' },
  cracked: { label: '开裂', color: 'text-red-600' },
}

export const DISINFECT_METHOD_MAP: Record<DisinfectMethod, string> = {
  alcohol: '酒精擦拭',
  chlorine: '含氯消毒',
  uv: '紫外线消毒',
  other: '其他',
}

export const DRYING_LOCATION_MAP: Record<DryingLocation, string> = {
  bathroom: '卫生间',
  balcony: '阳台',
  other: '其他',
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${min}`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
