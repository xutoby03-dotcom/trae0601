import type { Trip, Settlement } from '../types'
import { CATEGORY_CONFIG } from '../types'
import { calculateSettlements, calculatePersonExpenses, calculateBudgetUsage, calculateSharedFundBalance } from './settlement'

export function exportSettlementReport(trip: Trip): string {
  const settlements = calculateSettlements(trip)
  const budgetUsage = calculateBudgetUsage(trip)
  const sharedFund = calculateSharedFundBalance(trip)
  const now = new Date().toLocaleString('zh-CN')

  let report = `═══════════════════════════════════════\n`
  report += `  🧳 旅行分摊结算单\n`
  report += `═══════════════════════════════════════\n\n`
  report += `📍 目的地：${trip.destination}\n`
  report += `📅 日期：${trip.startDate} ~ ${trip.endDate}\n`
  report += `👥 参与人数：${trip.participants.filter(p => p.isActive).length}人\n`
  report += `💰 总预算：¥${trip.budget.toFixed(2)}\n\n`

  report += `───────────────────────────────────────\n`
  report += `  💵 预算使用情况\n`
  report += `───────────────────────────────────────\n`
  report += `  总支出：¥${budgetUsage.totalSpent.toFixed(2)}\n`
  report += `  剩余预算：¥${budgetUsage.remaining.toFixed(2)}\n`
  report += `  使用比例：${budgetUsage.percentage.toFixed(1)}%\n\n`

  report += `  分类支出：\n`
  for (const [category, amount] of Object.entries(budgetUsage.categorySpent)) {
    const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
    report += `    ${config.icon} ${config.label}：¥${amount.toFixed(2)}\n`
  }
  report += `\n`

  report += `───────────────────────────────────────\n`
  report += `  🏦 共同基金\n`
  report += `───────────────────────────────────────\n`
  report += `  总充值：¥${sharedFund.totalContributed.toFixed(2)}\n`
  report += `  已使用：¥${sharedFund.totalUsed.toFixed(2)}\n`
  report += `  余额：¥${sharedFund.remaining.toFixed(2)}\n\n`

  if (trip.sharedFund.length > 0) {
    report += `  充值明细：\n`
    for (const c of trip.sharedFund) {
      const p = trip.participants.find(pp => pp.id === c.participantId)
      report += `    ${p?.name || '未知'}：¥${c.amount.toFixed(2)}\n`
    }
    report += `\n`
  }

  report += `───────────────────────────────────────\n`
  report += `  👤 个人花费明细\n`
  report += `───────────────────────────────────────\n`
  for (const participant of trip.participants.filter(p => p.isActive)) {
    const personExpenses = calculatePersonExpenses(trip, participant.id)
    report += `  ${participant.name}：\n`
    report += `    垫付总额：¥${personExpenses.totalPaid.toFixed(2)}\n`
    report += `    分摊总额：¥${personExpenses.totalShare.toFixed(2)}\n`
    report += `    净余额：¥${personExpenses.netBalance.toFixed(2)}`
    report += personExpenses.netBalance > 0 ? ' (应收)\n' : personExpenses.netBalance < 0 ? ' (应付)\n' : ' (已结清)\n'

    for (const [category, breakdown] of Object.entries(personExpenses.categoryBreakdown)) {
      if (breakdown.paid > 0 || breakdown.share > 0) {
        const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
        report += `      ${config.icon} ${config.label}：垫付¥${breakdown.paid.toFixed(2)} / 分摊¥${breakdown.share.toFixed(2)}\n`
      }
    }
    report += `\n`
  }

  if (settlements.length > 0) {
    report += `───────────────────────────────────────\n`
    report += `  💸 结算方案\n`
    report += `───────────────────────────────────────\n`
    for (const settlement of settlements) {
      const from = trip.participants.find(p => p.id === settlement.fromId)
      const to = trip.participants.find(p => p.id === settlement.toId)
      report += `  ${from?.name || '未知'} → ${to?.name || '未知'}：¥${settlement.amount.toFixed(2)}\n`
    }
    report += `\n`
  } else {
    report += `───────────────────────────────────────\n`
    report += `  ✅ 所有费用已结清，无需转账！\n`
    report += `───────────────────────────────────────\n\n`
  }

  if (trip.participants.some(p => !p.isActive)) {
    report += `───────────────────────────────────────\n`
    report += `  🚪 已退团成员\n`
    report += `───────────────────────────────────────\n`
    for (const p of trip.participants.filter(p => !p.isActive)) {
      report += `  ${p.name}${p.leftDate ? `（退团日期：${p.leftDate}）` : ''}\n`
    }
    report += `\n`
  }

  report += `═══════════════════════════════════════\n`
  report += `  生成时间：${now}\n`
  report += `═══════════════════════════════════════\n`

  return report
}

export function downloadReport(trip: Trip) {
  const report = exportSettlementReport(trip)
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${trip.destination}-结算单.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
