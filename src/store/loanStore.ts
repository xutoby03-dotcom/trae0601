import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Loan, Repayment, LoanGroup, Stats } from '@/types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function isExpiringSoon(loan: Loan): boolean {
  if (loan.status === 'settled' || loan.isPaused) return false
  const dueDate = new Date(loan.dueDate)
  const now = new Date()
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= 3
}

function isOverdue(loan: Loan): boolean {
  if (loan.status === 'settled') return false
  const dueDate = new Date(loan.dueDate)
  const now = new Date()
  return dueDate < now
}

function recalcStatus(loan: Loan): Loan {
  if (loan.remainingAmount <= 0) {
    return { ...loan, status: 'settled', remainingAmount: 0 }
  }
  if (isOverdue(loan)) {
    return { ...loan, status: 'overdue' }
  }
  return { ...loan, status: 'active' }
}

interface LoanStore {
  loans: Loan[]
  repayments: Repayment[]
  addLoan: (loan: Omit<Loan, 'id' | 'status' | 'remainingAmount' | 'createdAt' | 'updatedAt'>) => void
  updateLoan: (id: string, data: Partial<Loan>) => void
  deleteLoan: (id: string) => void
  addRepayment: (repayment: Omit<Repayment, 'id' | 'createdAt'>) => void
  deleteRepayment: (id: string) => void
  getRepaymentsByLoanId: (loanId: string) => Repayment[]
  getLoansByGroup: () => LoanGroup
  getStats: () => Stats
}

export const useLoanStore = create<LoanStore>()(
  persist(
    (set, get) => ({
      loans: [],
      repayments: [],

      addLoan: (loanData) => {
        const now = new Date().toISOString()
        const loan: Loan = {
          ...loanData,
          id: generateId(),
          status: 'active',
          remainingAmount: loanData.totalAmount,
          createdAt: now,
          updatedAt: now,
        }
        const updated = recalcStatus(loan)
        set((state) => ({ loans: [...state.loans, updated] }))
      },

      updateLoan: (id, data) => {
        set((state) => ({
          loans: state.loans.map((loan) => {
            if (loan.id !== id) return loan
            const updated = { ...loan, ...data, updatedAt: new Date().toISOString() }
            return recalcStatus(updated)
          }),
        }))
      },

      deleteLoan: (id) => {
        set((state) => ({
          loans: state.loans.filter((loan) => loan.id !== id),
          repayments: state.repayments.filter((r) => r.loanId !== id),
        }))
      },

      addRepayment: (repaymentData) => {
        const now = new Date().toISOString()
        const repayment: Repayment = {
          ...repaymentData,
          id: generateId(),
          createdAt: now,
        }
        set((state) => {
          const loan = state.loans.find((l) => l.id === repaymentData.loanId)
          if (!loan) return { repayments: [...state.repayments, repayment] }

          const newRemaining = Math.max(0, loan.remainingAmount - repaymentData.amount)
          const updatedLoan = recalcStatus({
            ...loan,
            remainingAmount: newRemaining,
            updatedAt: now,
          })

          return {
            loans: state.loans.map((l) => (l.id === loan.id ? updatedLoan : l)),
            repayments: [...state.repayments, repayment],
          }
        })
      },

      deleteRepayment: (id) => {
        set((state) => {
          const repayment = state.repayments.find((r) => r.id === id)
          if (!repayment) return state

          const loan = state.loans.find((l) => l.id === repayment.loanId)
          if (!loan) return { repayments: state.repayments.filter((r) => r.id !== id) }

          const newRemaining = loan.remainingAmount + repayment.amount
          const updatedLoan = recalcStatus({
            ...loan,
            remainingAmount: Math.min(newRemaining, loan.totalAmount),
            updatedAt: new Date().toISOString(),
          })

          return {
            loans: state.loans.map((l) => (l.id === loan.id ? updatedLoan : l)),
            repayments: state.repayments.filter((r) => r.id !== id),
          }
        })
      },

      getRepaymentsByLoanId: (loanId) => {
        return get().repayments
          .filter((r) => r.loanId === loanId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      },

      getLoansByGroup: () => {
        const loans = get().loans
        const expiringSoon: Loan[] = []
        const overdue: Loan[] = []
        const paused: Loan[] = []
        const settled: Loan[] = []

        const activeLoans = loans
          .filter((l) => l.status !== 'settled')
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

        for (const loan of activeLoans) {
          if (loan.isPaused) {
            paused.push(loan)
          } else if (isOverdue(loan)) {
            overdue.push(loan)
          } else if (isExpiringSoon(loan)) {
            expiringSoon.push(loan)
          } else {
            overdue.length === 0 && expiringSoon.length === 0
            if (overdue.length > 0 || expiringSoon.length > 0) {
              expiringSoon.push(loan)
            } else {
              expiringSoon.push(loan)
            }
          }
        }

        const settledLoans = loans
          .filter((l) => l.status === 'settled')
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

        settled.push(...settledLoans)

        return { expiringSoon, overdue, paused, settled }
      },

      getStats: () => {
        const loans = get().loans
        const repayments = get().repayments

        const totalLent = loans.reduce((sum, l) => sum + l.totalAmount, 0)
        const totalRecovered = repayments.reduce((sum, r) => sum + r.amount, 0)
        const totalOverdue = loans
          .filter((l) => l.status === 'overdue')
          .reduce((sum, l) => sum + l.remainingAmount, 0)

        let maxOverdueDays = 0
        const now = new Date()
        for (const loan of loans) {
          if (loan.status === 'overdue') {
            const dueDate = new Date(loan.dueDate)
            const days = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
            if (days > maxOverdueDays) maxOverdueDays = days
          }
        }

        return { totalLent, totalOverdue, totalRecovered, maxOverdueDays }
      },
    }),
    {
      name: 'loan-memo-storage',
    }
  )
)
