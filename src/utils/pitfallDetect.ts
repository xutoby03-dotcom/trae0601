import type { Plan, Pitfall } from '@/types'

export function detectPitfalls(plans: Plan[]): Pitfall[] {
  const pitfalls: Pitfall[] = []

  for (const plan of plans) {
    if (plan.discountedFee > 0 && plan.discountedFee < plan.monthlyFee) {
      const increase = plan.monthlyFee - plan.discountedFee
      const increasePercent = Math.round((increase / plan.discountedFee) * 100)
      if (increasePercent >= 20) {
        pitfalls.push({
          type: 'danger',
          title: '首年优惠次年涨价',
          description: `「${plan.name}」优惠期月租 ${plan.discountedFee}元，优惠结束后涨至 ${plan.monthlyFee}元，涨幅达 ${increasePercent}%`,
          planName: plan.name,
        })
      } else if (increasePercent >= 10) {
        pitfalls.push({
          type: 'warning',
          title: '优惠后月费上涨',
          description: `「${plan.name}」优惠期月租 ${plan.discountedFee}元，优惠结束后 ${plan.monthlyFee}元，涨幅 ${increasePercent}%`,
          planName: plan.name,
        })
      }
    }

    if (plan.contractMonths >= 36) {
      pitfalls.push({
        type: 'danger',
        title: '合约期过长',
        description: `「${plan.name}」合约期长达 ${plan.contractMonths} 个月（${Math.round(plan.contractMonths / 12)}年），提前解约需付 ${plan.earlyTerminationFee}元`,
        planName: plan.name,
      })
    } else if (plan.contractMonths >= 24) {
      pitfalls.push({
        type: 'warning',
        title: '合约期偏长',
        description: `「${plan.name}」合约期 ${plan.contractMonths} 个月，提前解约需付 ${plan.earlyTerminationFee}元`,
        planName: plan.name,
      })
    }

    if (plan.earlyTerminationFee >= 500) {
      pitfalls.push({
        type: 'danger',
        title: '解约费过高',
        description: `「${plan.name}」提前解约费高达 ${plan.earlyTerminationFee}元，换套餐成本极大`,
        planName: plan.name,
      })
    }

    if (plan.speed >= 200 && !plan.uploadSpeed) {
      pitfalls.push({
        type: 'warning',
        title: '上传速率未标注',
        description: `「${plan.name}」下行 ${plan.speed}Mbps 但未标注上传速率，大户型和远程办公需关注实际上传带宽`,
        planName: plan.name,
      })
    }

    if (plan.discountEndDate) {
      const endDate = new Date(plan.discountEndDate)
      const now = new Date()
      const daysLeft = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysLeft <= 30 && daysLeft > 0) {
        pitfalls.push({
          type: 'warning',
          title: '优惠即将到期',
          description: `「${plan.name}」优惠还剩 ${daysLeft} 天到期，到期后月费将变为 ${plan.monthlyFee}元`,
          planName: plan.name,
        })
      } else if (daysLeft <= 0) {
        pitfalls.push({
          type: 'danger',
          title: '优惠已过期',
          description: `「${plan.name}」优惠已于 ${plan.discountEndDate} 到期，当前月费应为 ${plan.monthlyFee}元`,
          planName: plan.name,
        })
      }
    }

    if (plan.installFee > 200) {
      pitfalls.push({
        type: 'warning',
        title: '安装费偏高',
        description: `「${plan.name}」安装费 ${plan.installFee}元，注意有些运营商可协商免除`,
        planName: plan.name,
      })
    }

    if (plan.routerFee > 200) {
      pitfalls.push({
        type: 'warning',
        title: '路由器费用偏高',
        description: `「${plan.name}」路由器费 ${plan.routerFee}元，自行购买可能更划算`,
        planName: plan.name,
      })
    }
  }

  return pitfalls
}
