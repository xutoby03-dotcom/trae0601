import { formatDate } from './date'

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function getWeekDates(date: Date): string[] {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday)
    dd.setDate(monday.getDate() + i)
    dates.push(formatDate(dd))
  }
  return dates
}

export function getLast14Days(): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(formatDate(d))
  }
  return dates
}

export function calcCorrelation(
  xValues: number[],
  yValues: number[]
): number {
  const n = Math.min(xValues.length, yValues.length)
  if (n < 3) return 0
  const x = xValues.slice(0, n)
  const y = yValues.slice(0, n)
  const meanX = x.reduce((a, b) => a + b, 0) / n
  const meanY = y.reduce((a, b) => a + b, 0) / n
  let num = 0
  let denX = 0
  let denY = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }
  const den = Math.sqrt(denX * denY)
  if (den === 0) return 0
  return num / den
}

export function generateInsight(
  completionRate: number,
  avgEnergyAfter: number,
  avgEnergyOverall: number,
  correlation: number,
  habitName: string
): string {
  if (completionRate < 0.3) {
    return `${habitName}完成率仅${Math.round(completionRate * 100)}%，目标可能定得太高，试试降低频率？`
  }
  if (correlation > 0.4) {
    return `${habitName}和精力状态明显正相关（r=${correlation.toFixed(2)}），值得坚持！`
  }
  if (correlation < -0.4) {
    return `${habitName}和精力呈负相关，可能消耗过大，考虑调整强度。`
  }
  if (avgEnergyAfter > avgEnergyOverall + 0.5) {
    return `做${habitName}的日子精力普遍更好，平均高出${(avgEnergyAfter - avgEnergyOverall).toFixed(1)}分。`
  }
  if (avgEnergyAfter < avgEnergyOverall - 0.5) {
    return `做${habitName}后精力反而下降，可能需要减少投入或调整时间。`
  }
  return `${habitName}和精力关系暂不显著，继续观察更多数据。`
}
