export function calculateCostPerPerson(totalCost: number, personCount: number): number {
  if (personCount <= 0) return 0
  return Math.round((totalCost / personCount) * 100) / 100
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`
}
