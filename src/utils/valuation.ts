import type { Phone, ValuationResult, DeductionItem, PhoneGroup } from '@/types'

const BRAND_BASE_PRICES: Record<string, [number, number]> = {
  Apple: [200, 4500],
  Samsung: [100, 3000],
  Huawei: [80, 2500],
  Xiaomi: [50, 1800],
  OPPO: [50, 1500],
  vivo: [50, 1500],
  其他: [30, 800],
}

const CAPACITY_MULTIPLIER: Record<string, number> = {
  '16GB': 0.6,
  '32GB': 0.7,
  '64GB': 0.8,
  '128GB': 1.0,
  '256GB': 1.15,
  '512GB': 1.3,
  '1TB': 1.45,
}

const ACCESSORY_VALUES: Record<string, [number, number]> = {
  原装充电器: [20, 50],
  原装数据线: [10, 30],
  原装盒: [30, 80],
  原装耳机: [20, 60],
  贴膜: [5, 15],
  手机壳: [5, 20],
}

function getAgeMultiplier(purchaseYear: number): number {
  const currentYear = new Date().getFullYear()
  const age = currentYear - purchaseYear
  if (age <= 1) return 1.0
  if (age <= 2) return 0.75
  if (age <= 3) return 0.55
  if (age <= 4) return 0.4
  if (age <= 5) return 0.25
  return 0.12
}

export function calculateValuation(phone: Partial<Phone>): ValuationResult {
  const brand = phone.brand || '其他'
  const [rawMin, rawMax] = BRAND_BASE_PRICES[brand] || BRAND_BASE_PRICES['其他']
  const capMul = CAPACITY_MULTIPLIER[phone.capacity ?? ''] || 1.0
  const ageMul = phone.purchaseYear != null ? getAgeMultiplier(phone.purchaseYear) : 0.12

  let baseMin = Math.round(rawMin * capMul * ageMul)
  let baseMax = Math.round(rawMax * capMul * ageMul)

  const deductions: DeductionItem[] = []

  if (phone.screenCondition === 'scratched') {
    const pct = 0.12
    deductions.push({ label: '屏幕划痕', percentage: pct, amount: Math.round(baseMax * pct) })
  } else if (phone.screenCondition === 'cracked') {
    const pct = 0.4
    deductions.push({ label: '屏幕碎裂', percentage: pct, amount: Math.round(baseMax * pct) })
  }

  if (phone.batteryHealth != null && phone.batteryHealth < 80) {
    const pct = phone.batteryHealth < 60 ? 0.28 : 0.15
    const label = phone.batteryHealth < 60 ? '电池严重衰减' : '电池健康度低'
    deductions.push({ label, percentage: pct, amount: Math.round(baseMax * pct) })
  }

  if (phone.waterDamage) {
    const pct = 0.5
    deductions.push({ label: '进水损伤', percentage: pct, amount: Math.round(baseMax * pct) })
  }

  if (phone.accountLocked) {
    const pct = 0.2
    deductions.push({ label: '账号未退出', percentage: pct, amount: Math.round(baseMax * pct) })
  }

  const totalDeductionPct = deductions.reduce((sum, d) => sum + d.percentage, 0)
  const dedMul = Math.max(0.05, 1 - totalDeductionPct)

  const additions: { label: string; amount: number }[] = []
  if (phone.accessories) {
    for (const acc of phone.accessories) {
      const [addMin, addMax] = ACCESSORY_VALUES[acc] || [0, 0]
      const avg = Math.round((addMin + addMax) / 2)
      additions.push({ label: acc, amount: avg })
    }
  }

  const totalAddition = additions.reduce((sum, a) => sum + a.amount, 0)
  const estimatedMin = Math.max(0, Math.round(baseMin * dedMul) + totalAddition)
  const estimatedMax = Math.max(0, Math.round(baseMax * dedMul) + totalAddition)

  const group: PhoneGroup = determineGroup(estimatedMin, phone.waterDamage || false, phone.screenCondition || 'intact')

  return { baseMin, baseMax, deductions, additions, estimatedMin, estimatedMax, group }
}

function determineGroup(minPrice: number, waterDamage: boolean, screenCondition: string): PhoneGroup {
  if (minPrice <= 30 || (waterDamage && screenCondition === 'cracked')) return 'parts'
  if (minPrice < 100) return 'backup'
  return 'recyclable'
}

export const GROUP_LABELS: Record<PhoneGroup, string> = {
  recyclable: '可回收',
  backup: '建议自用备机',
  parts: '只适合拆件',
}

export const GROUP_COLORS: Record<PhoneGroup, string> = {
  recyclable: '#52B788',
  backup: '#F77F00',
  parts: '#E63946',
}
