export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    voting: '投票中',
    funding: '筹款中',
    purchased: '已购买',
    delivered: '已到货',
    completed: '已完成',
  }
  return map[status] ?? status
}

export function getPackagingStatusLabel(status: string): string {
  const map: Record<string, string> = {
    none: '未包装',
    packing: '包装中',
    packed: '已包装',
  }
  return map[status] ?? status
}
