import type { Medicine, UsageRecord, FamilyMember } from '@/types'
import { CATEGORY_CONFIG } from '@/types'
import { getDaysUntilExpiry, getExpiryStatus } from './expiry'

export function exportMedicineList(
  medicines: Medicine[],
  members: FamilyMember[],
  usageRecords: UsageRecord[]
): string {
  const lines: string[] = []
  lines.push('🏠 家庭药箱清单')
  lines.push(`生成时间：${new Date().toLocaleString('zh-CN')}`)
  lines.push('═'.repeat(40))

  const categories = Object.entries(CATEGORY_CONFIG) as [string, { label: string }][]
  for (const [key, config] of categories) {
    const items = medicines.filter(m => m.category === key)
    if (items.length === 0) continue
    lines.push('')
    lines.push(`【${config.label}】`)
    for (const item of items) {
      const status = getExpiryStatus(item.expiryDate)
      const days = getDaysUntilExpiry(item.expiryDate)
      const statusText = status === 'expired' ? '❌已过期' : status === 'expiring_soon' ? `⚠️${days}天后过期` : '✅正常'
      const memberNames = item.suitableFor.map(tag => {
        const member = members.find(m => m.tag === tag)
        return member ? member.name : tag
      }).join('、')
      lines.push(`  ${item.name} - ${item.purpose}`)
      lines.push(`    数量：${item.quantity}${item.unit} | 状态：${statusText} | 适用：${memberNames || '所有人'}`)
      if (item.expiryDate) lines.push(`    有效期至：${item.expiryDate}`)
    }
  }

  const expiredItems = medicines.filter(m => getExpiryStatus(m.expiryDate) === 'expired')
  if (expiredItems.length > 0) {
    lines.push('')
    lines.push('═'.repeat(40))
    lines.push(`⚠️ 待处理过期药品（${expiredItems.length}项）`)
    for (const item of expiredItems) {
      lines.push(`  ${item.name} - 已于${item.expiryDate}过期`)
    }
  }

  return lines.join('\n')
}
