import type { Settlement, Trip, Expense, Participant } from '../types'

function wasActiveAtDate(participant: Participant, date: string): boolean {
  if (participant.isActive) return true
  if (!participant.leftDate) return false
  return date <= participant.leftDate
}

function getEffectiveSplitMembers(expense: Expense, participants: Participant[]): string[] {
  return expense.splitAmong.filter(id => {
    const p = participants.find(pp => pp.id === id)
    return p && wasActiveAtDate(p, expense.date)
  })
}

export function calculateSettlements(trip: Trip): Settlement[] {
  if (trip.participants.length === 0) return []

  const confirmedExpenses = trip.expenses.filter(e => e.status === 'confirmed')
  const balances: Record<string, number> = {}
  trip.participants.forEach(p => { balances[p.id] = 0 })

  for (const expense of confirmedExpenses) {
    const payer = trip.participants.find(p => p.id === expense.payerId)
    if (!payer || !wasActiveAtDate(payer, expense.date)) continue

    if (expense.useSharedFund) {
      continue
    }

    const splitMembers = getEffectiveSplitMembers(expense, trip.participants)

    if (splitMembers.length === 0) continue

    const sharePerPerson = expense.amount / splitMembers.length
    balances[expense.payerId] = (balances[expense.payerId] || 0) + expense.amount

    for (const memberId of splitMembers) {
      balances[memberId] = (balances[memberId] || 0) - sharePerPerson
    }
  }

  const sharedFundBalance = calculateSharedFundBalance(trip)
  for (const p of trip.participants) {
    balances[p.id] = (balances[p.id] || 0) + (sharedFundBalance.netContributions[p.id] || 0)
  }

  return minimizeTransactions(balances)
}

function minimizeTransactions(balances: Record<string, number>): Settlement[] {
  const debtors: { id: string; amount: number }[] = []
  const creditors: { id: string; amount: number }[] = []

  for (const [id, balance] of Object.entries(balances)) {
    const rounded = Math.round(balance * 100) / 100
    if (rounded < -0.01) {
      debtors.push({ id, amount: -rounded })
    } else if (rounded > 0.01) {
      creditors.push({ id, amount: rounded })
    }
  }

  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  const settlements: Settlement[] = []
  let i = 0, j = 0

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount)
    if (amount > 0.01) {
      settlements.push({
        fromId: debtors[i].id,
        toId: creditors[j].id,
        amount: Math.round(amount * 100) / 100,
      })
    }
    debtors[i].amount -= amount
    creditors[j].amount -= amount

    if (debtors[i].amount < 0.01) i++
    if (creditors[j].amount < 0.01) j++
  }

  return settlements
}

export interface SharedFundBalance {
  totalContributed: number
  totalUsed: number
  remaining: number
  contributions: Record<string, number>
  netContributions: Record<string, number>
}

export function calculateSharedFundBalance(trip: Trip): SharedFundBalance & { netContributions: Record<string, number> } {
  const contributions: Record<string, number> = {}
  const usedPerPerson: Record<string, number> = {}
  let totalContributed = 0
  let totalUsed = 0

  for (const p of trip.participants) {
    contributions[p.id] = 0
    usedPerPerson[p.id] = 0
  }

  for (const c of trip.sharedFund) {
    contributions[c.participantId] = (contributions[c.participantId] || 0) + c.amount
    totalContributed += c.amount
  }

  const sharedFundExpenses = trip.expenses.filter(e => e.useSharedFund && e.status === 'confirmed')
  for (const expense of sharedFundExpenses) {
    const splitMembers = getEffectiveSplitMembers(expense, trip.participants)
    if (splitMembers.length === 0) continue

    totalUsed += expense.amount
    const sharePerPerson = expense.amount / splitMembers.length
    for (const memberId of splitMembers) {
      usedPerPerson[memberId] = (usedPerPerson[memberId] || 0) + sharePerPerson
    }
  }

  const netContributions: Record<string, number> = {}
  for (const p of trip.participants) {
    netContributions[p.id] = (contributions[p.id] || 0) - (usedPerPerson[p.id] || 0)
  }

  return {
    totalContributed,
    totalUsed,
    remaining: totalContributed - totalUsed,
    contributions,
    netContributions,
  }
}

export function calculatePersonExpenses(trip: Trip, participantId: string) {
  const confirmedExpenses = trip.expenses.filter(e => e.status === 'confirmed')
  let totalPaid = 0
  let totalShare = 0
  const categoryBreakdown: Record<string, { paid: number; share: number }> = {}

  for (const expense of confirmedExpenses) {
    const splitMembers = getEffectiveSplitMembers(expense, trip.participants)

    if (expense.payerId === participantId && !expense.useSharedFund) {
      totalPaid += expense.amount
    }

    if (splitMembers.includes(participantId)) {
      const share = expense.amount / splitMembers.length
      if (!expense.useSharedFund) {
        totalShare += share
      }
    }

    const cat = expense.category
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { paid: 0, share: 0 }
    }

    if (expense.payerId === participantId && !expense.useSharedFund) {
      categoryBreakdown[cat].paid += expense.amount
    }
    if (splitMembers.includes(participantId) && !expense.useSharedFund) {
      categoryBreakdown[cat].share += expense.amount / splitMembers.length
    }
  }

  const sharedFund = calculateSharedFundBalance(trip)
  const netSharedFund = sharedFund.netContributions[participantId] || 0

  return {
    totalPaid,
    totalShare,
    netBalance: totalPaid - totalShare + netSharedFund,
    categoryBreakdown,
  }
}

export function getActiveParticipantsForExpense(trip: Trip, expense: Expense): Participant[] {
  return expense.splitAmong
    .map(id => trip.participants.find(p => p.id === id))
    .filter((p): p is Participant => p !== undefined && wasActiveAtDate(p, expense.date))
}

export function calculateBudgetUsage(trip: Trip) {
  const confirmedExpenses = trip.expenses.filter(e => e.status === 'confirmed')
  const totalSpent = confirmedExpenses.reduce((sum, e) => sum + e.amount, 0)
  const categorySpent: Record<string, number> = {}

  for (const expense of confirmedExpenses) {
    categorySpent[expense.category] = (categorySpent[expense.category] || 0) + expense.amount
  }

  return {
    totalSpent,
    budget: trip.budget,
    remaining: trip.budget - totalSpent,
    percentage: trip.budget > 0 ? (totalSpent / trip.budget) * 100 : 0,
    categorySpent,
    overBudgetCategories: Object.entries(categorySpent)
      .filter(([, amount]) => amount > trip.budget * 0.3)
      .map(([category, amount]) => ({ category, amount })),
  }
}
