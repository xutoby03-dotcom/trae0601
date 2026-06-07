export const MOOD_COLORS = [
  { name: '珊瑚红', value: '#FF6B6B' },
  { name: '薰衣草紫', value: '#9B59B6' },
  { name: '薄荷绿', value: '#2ECC71' },
  { name: '琥珀黄', value: '#F39C12' },
  { name: '天蓝', value: '#3498DB' },
  { name: '玫瑰粉', value: '#E91E63' },
]

export const THEME_COLORS = {
  gold: '#D4A574',
  darkBrown: '#2C1810',
  cream: '#FFF8F0',
  warmBrown: '#4A3228',
  lightGold: '#E8C99B',
  paperTexture: '#F5E6D3',
  sealRed: '#8B2500',
}

export function getMoodColorName(value: string): string {
  return MOOD_COLORS.find((c) => c.value === value)?.name ?? '自定义'
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

export function formatCountdown(openDate: string): { days: number; hours: number; minutes: number; seconds: number; isPast: boolean } {
  const now = new Date().getTime()
  const target = new Date(openDate).getTime()
  const diff = target - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isPast: false,
  }
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function downloadJson(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
