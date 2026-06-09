import type { Sentiment, Loan } from '@/types'

export function formatMoney(amount: number): string {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function daysOverdue(dateStr: string): number {
  return -daysUntil(dateStr)
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function generateReminderText(loan: Loan): string {
  const amount = formatMoney(loan.remainingAmount)
  const isOd = daysOverdue(loan.dueDate) > 0
  const sentiment: Sentiment = loan.sentiment

  if (isOd) {
    const overdueDays = daysOverdue(loan.dueDate)
    const templates: Record<Sentiment, string> = {
      close: `嗨~上次借你的 ¥${amount} 已经超了 ${overdueDays} 天啦，最近手头有点紧，方便的话尽快处理一下呗~`,
      normal: `你好，上次借你的 ¥${amount} 已经过期 ${overdueDays} 天了，最近如果方便的话麻烦安排一下还款吧，谢谢~`,
      distant: `你好，之前借你的款项 ¥${amount} 已超期 ${overdueDays} 天，请尽快安排还款，谢谢。`,
    }
    return templates[sentiment]
  }

  const days = daysUntil(loan.dueDate)
  if (days <= 3) {
    const templates: Record<Sentiment, string> = {
      close: `嘿~上次借你的 ¥${amount} 还有 ${days} 天就到期啦，记得安排一下哦~`,
      normal: `你好，上次借你的 ¥${amount} 还有 ${days} 天到期，如果方便的话麻烦提前安排一下还款~`,
      distant: `你好，之前借你的款项 ¥${amount} 将于 ${days} 天后到期，请按时安排还款，谢谢。`,
    }
    return templates[sentiment]
  }

  const templates: Record<Sentiment, string> = {
    close: `嗨~上次借你的那笔 ¥${amount}，方便的时候还一下就行，不急~`,
    normal: `你好，上次借你的 ¥${amount}，最近如果方便的话可以转我一下吗？`,
    distant: `你好，之前借你的款项 ¥${amount}，麻烦在方便时安排一下还款，谢谢。`,
  }
  return templates[sentiment]
}

export function getSentimentLabel(s: Sentiment): string {
  return { close: '挚友', normal: '普通', distant: '疏远' }[s]
}

export function getSentimentEmoji(s: Sentiment): string {
  return { close: '❤️', normal: '💛', distant: '🤍' }[s]
}
