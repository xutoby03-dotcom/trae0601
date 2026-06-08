import type { Plan, CostResult } from '@/types'

function getMonthsAtDiscountedRate(plan: Plan): number {
  if (!plan.discountEndDate || plan.discountedFee <= 0) return 0
  const end = new Date(plan.discountEndDate)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  if (diffMs <= 0) return 0
  return Math.min(Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30)), plan.contractMonths)
}

export function calculateCost(plan: Plan, months: number): CostResult {
  const discountedMonths = getMonthsAtDiscountedRate(plan)
  const normalMonths = months - discountedMonths

  const monthlyTotal =
    discountedMonths * plan.discountedFee + normalMonths * plan.monthlyFee

  const installFee = plan.installFee
  const routerFee = plan.routerFee

  const fullPriceMonthly = months * plan.monthlyFee
  const discountSaving = fullPriceMonthly - monthlyTotal

  const total = monthlyTotal + installFee + routerFee

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
  const discountedMonths = getMonthsAtDiscountedRate(plan)
  const normalMonths = months - discountedMonths

  const monthlyTotal =
    discountedMonths * plan.discountedFee + normalMonths * plan.monthlyFee

  return monthlyTotal + plan.installFee + plan.routerFee
}

export function getMonthlyAvg(plan: Plan, months: number): number {
  const total = calculateTotalForMonths(plan, months)
  return Math.round((total / months) * 100) / 100
}
