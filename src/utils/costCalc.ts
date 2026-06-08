import type { Plan, CostResult } from '@/types'

function getMonthsAtDiscountedRate(plan: Plan, months: number): number {
  if (!plan.discountEndDate || plan.discountedFee <= 0) return 0
  const end = new Date(plan.discountEndDate)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  if (diffMs <= 0) return 0
  const raw = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30))
  return Math.min(raw, plan.contractMonths, months)
}

export function calculateCost(plan: Plan, months: number): CostResult {
  const discountedMonths = getMonthsAtDiscountedRate(plan, months)
  const normalMonths = Math.max(0, months - discountedMonths)

  const monthlyTotal =
    discountedMonths * plan.discountedFee + normalMonths * plan.monthlyFee

  const installFee = plan.installFee
  const routerFee = plan.routerFee

  const fullPriceMonthly = months * plan.monthlyFee
  const discountSaving = fullPriceMonthly - monthlyTotal

  return {
    months12: calculateTotalForMonths(plan, 12),
    months24: calculateTotalForMonths(plan, 24),
    breakdown: {
      monthlyTotal,
      installFee,
      routerFee,
      discountSaving,
    },
  }
}

function calculateTotalForMonths(plan: Plan, months: number): number {
  const discountedMonths = getMonthsAtDiscountedRate(plan, months)
  const normalMonths = Math.max(0, months - discountedMonths)

  const monthlyTotal =
    discountedMonths * plan.discountedFee + normalMonths * plan.monthlyFee

  return monthlyTotal + plan.installFee + plan.routerFee
}

export function getMonthlyAvg(plan: Plan, months: number): number {
  const total = calculateTotalForMonths(plan, months)
  return Math.round((total / months) * 100) / 100
}
