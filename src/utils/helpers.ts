export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${min}`
}

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}分钟`
  if (hours < 24) return `${Math.round(hours * 10) / 10}小时`
  const days = Math.floor(hours / 24)
  const remainHours = Math.round((hours % 24) * 10) / 10
  return remainHours > 0 ? `${days}天${remainHours}小时` : `${days}天`
}

export function isOverdue(expectedReturnTime: string): boolean {
  return new Date(expectedReturnTime) < new Date()
}

export function generateUmbrellaCode(): string {
  const num = Math.floor(Math.random() * 9000) + 1000
  return `UM-${num}`
}
