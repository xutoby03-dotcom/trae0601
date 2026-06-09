export type Sentiment = 'close' | 'normal' | 'distant'
export type LoanStatus = 'active' | 'overdue' | 'settled'

export interface Loan {
  id: string
  borrowerName: string
  totalAmount: number
  lendDate: string
  dueDate: string
  purpose: string
  hasScreenshot: boolean
  note: string
  sentiment: Sentiment
  isPaused: boolean
  status: LoanStatus
  remainingAmount: number
  createdAt: string
  updatedAt: string
}

export interface Repayment {
  id: string
  loanId: string
  amount: number
  date: string
  proof: string
  note: string
  createdAt: string
}

export interface LoanGroup {
  expiringSoon: Loan[]
  overdue: Loan[]
  paused: Loan[]
  settled: Loan[]
}

export interface Stats {
  totalLent: number
  totalOverdue: number
  totalRecovered: number
  maxOverdueDays: number
}
