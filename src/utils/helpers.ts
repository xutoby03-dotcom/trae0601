import type { RoastLevel } from '@/types'
import { ROAST_COLORS } from './constants'

export function getRoastColor(roastLevel: RoastLevel) {
  return ROAST_COLORS[roastLevel]
}

export function getRoastLabel(roastLevel: RoastLevel): string {
  const labels: Record<RoastLevel, string> = {
    'light': '浅焙',
    'medium-light': '中浅焙',
    'medium': '中焙',
    'medium-dark': '中深焙',
    'dark': '深焙',
  }
  return labels[roastLevel]
}

export function getProcessLabel(method: string): string {
  const labels: Record<string, string> = {
    'washed': '水洗',
    'natural': '日晒',
    'honey': '蜜处理',
    'anaerobic': '厌氧',
    'other': '其他',
  }
  return labels[method] || method
}

export function getGrindLabel(grind: string): string {
  const labels: Record<string, string> = {
    'fine': '细',
    'medium-fine': '中细',
    'medium': '中',
    'medium-coarse': '中粗',
    'coarse': '粗',
  }
  return labels[grind] || grind
}

export function daysSinceOpen(openDate: string): number {
  const now = new Date()
  const opened = new Date(openDate)
  const diff = now.getTime() - opened.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function exportToJSON(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToCSV(data: object[], filename: string) {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => JSON.stringify((row as Record<string, unknown>)[h] ?? '')).join(','))
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function generateId(): string {
  return crypto.randomUUID()
}
