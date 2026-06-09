import type { GarbageCategory } from '../types'

export const categoryConfig: Record<GarbageCategory, { label: string; emoji: string; color: string; bgColor: string; borderColor: string }> = {
  kitchen: {
    label: '厨余垃圾',
    emoji: '🥬',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
  },
  recyclable: {
    label: '可回收物',
    emoji: '♻️',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-300',
  },
  hazardous: {
    label: '有害垃圾',
    emoji: '☠️',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
  },
  other: {
    label: '其他垃圾',
    emoji: '🗑️',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
  },
}

export const categoryList: GarbageCategory[] = ['kitchen', 'recyclable', 'hazardous', 'other']
