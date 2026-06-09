export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export function getDaysBetween(start: string, end: string): string[] {
  const days: string[] = []
  const current = new Date(start)
  const endDate = new Date(end)
  while (current <= endDate) {
    days.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  return days
}

export function getPetAvatar(pet: { type: 'cat' | 'dog'; name: string }): string {
  if (pet.type === 'cat') {
    return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20cat%20face%20avatar%20warm%20soft%20colors%20simple%20illustration&image_size=square`
  }
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20dog%20face%20avatar%20warm%20soft%20colors%20simple%20illustration&image_size=square`
}

export const appetiteLabels: Record<string, string> = {
  good: '胃口好',
  normal: '正常',
  poor: '胃口差',
}

export const stoolLabels: Record<string, string> = {
  normal: '正常',
  soft: '偏软',
  abnormal: '异常',
}

export const moodLabels: Record<string, string> = {
  energetic: '精力充沛',
  calm: '安静平稳',
  lethargic: '精神不佳',
}

export const categoryLabels: Record<string, string> = {
  feeding: '喂食',
  cleaning: '清洁',
  walking: '外出',
  health: '健康',
}

export const priorityLabels: Record<string, string> = {
  normal: '普通',
  important: '重要',
}
