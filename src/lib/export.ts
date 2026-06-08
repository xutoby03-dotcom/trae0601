import type { Property } from '@/lib/types'

export function exportViewingRecords(properties: Property[]): string {
  const lines: string[] = []

  lines.push('# 🏠 租房看房记录')
  lines.push('')
  lines.push(`导出时间：${new Date().toLocaleString('zh-CN')}`)
  lines.push(`共 ${properties.length} 套房源`)
  lines.push('')
  lines.push('---')
  lines.push('')

  properties.forEach((p, idx) => {
    lines.push(`## ${idx + 1}. ${p.community}`)
    lines.push('')
    lines.push('| 项目 | 详情 |')
    lines.push('|------|------|')
    lines.push(`| 月租金 | ¥${p.rent}/月 |`)
    lines.push(`| 押付方式 | ${p.depositType} |`)
    lines.push(`| 面积 | ${p.area}㎡ |`)
    lines.push(`| 楼层 | ${p.floor} |`)
    lines.push(`| 朝向 | ${p.orientation} |`)
    lines.push(`| 通勤时间 | ${p.commuteMinutes}分钟 |`)
    lines.push(`| 中介费 | ¥${p.agencyFee} |`)
    lines.push(`| 可入住日期 | ${p.moveInDate || '未填写'} |`)
    lines.push('')

    if (p.riskTags.length > 0) {
      lines.push('**⚠️ 风险提醒：** ' + p.riskTags.map((t) => {
        const labels: Record<string, string> = {
          unclear_deposit: '押金规则不清',
          long_contract: '合同期太长',
          old_appliances: '家电老旧',
          downstairs_noise: '楼下噪音',
          no_gas: '没有燃气',
        }
        return labels[t] || t
      }).join('、'))
      lines.push('')
    }

    if (p.inspections.length > 0) {
      const categoryLabels: Record<string, string> = {
        water_pressure: '水压',
        lighting: '采光',
        noise: '噪音',
        wall: '墙面',
        ac: '空调',
        fridge: '冰箱',
        door_lock: '门锁',
        drain: '下水道',
        network: '网络',
      }
      lines.push('### 检查清单评分')
      lines.push('')
      lines.push('| 项目 | 评分 | 备注 |')
      lines.push('|------|------|------|')
      p.inspections.forEach((item) => {
        const stars = '★'.repeat(item.score) + '☆'.repeat(5 - item.score)
        lines.push(`| ${categoryLabels[item.category] || item.category} | ${stars} (${item.score}/5) | ${item.note || '-'} |`)
      })
      lines.push('')
    }

    const totalScore = p.inspections.length > 0
      ? (p.inspections.reduce((s, i) => s + i.score, 0) / p.inspections.length).toFixed(1)
      : '未评分'
    const depositMatch = p.depositType.match(/押(\d+)/)
    const deposit = depositMatch ? parseInt(depositMatch[1], 10) * p.rent : p.rent
    const annualCost = p.rent * 12 + deposit + p.agencyFee

    lines.push(`**综合评分：** ${totalScore}/5`)
    lines.push('')
    lines.push(`**一年总成本：** ¥${annualCost.toLocaleString()}（月租×12 + 押金¥${deposit.toLocaleString()} + 中介费¥${p.agencyFee.toLocaleString()}）`)
    lines.push('')
    lines.push('---')
    lines.push('')
  })

  return lines.join('\n')
}
