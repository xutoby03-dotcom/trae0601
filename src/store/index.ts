import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Phone, PlatformQuote, Transaction } from '@/types'
import { calculateValuation } from '@/utils/valuation'

interface PhoneStore {
  phones: Phone[]
  quotes: PlatformQuote[]
  transactions: Transaction[]
  addPhone: (phone: Omit<Phone, 'id' | 'group' | 'estimatedMin' | 'estimatedMax' | 'createdAt' | 'updatedAt'>) => string
  updatePhone: (id: string, data: Partial<Phone>) => void
  deletePhone: (id: string) => void
  addQuote: (quote: Omit<PlatformQuote, 'id' | 'createdAt'>) => void
  deleteQuote: (id: string) => void
  addTransaction: (tx: Omit<Transaction, 'id' | 'transactedAt'>) => void
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const usePhoneStore = create<PhoneStore>()(
  persist(
    (set) => ({
      phones: [],
      quotes: [],
      transactions: [],

      addPhone(phoneData) {
        const id = genId()
        const now = Date.now()
        const result = calculateValuation(phoneData)
        const phone: Phone = {
          ...phoneData,
          id,
          group: result.group,
          estimatedMin: result.estimatedMin,
          estimatedMax: result.estimatedMax,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ phones: [...s.phones, phone] }))
        return id
      },

      updatePhone(id, data) {
        set((s) => ({
          phones: s.phones.map((p) => {
            if (p.id !== id) return p
            const merged = { ...p, ...data, updatedAt: Date.now() }
            const result = calculateValuation(merged)
            return { ...merged, group: result.group, estimatedMin: result.estimatedMin, estimatedMax: result.estimatedMax }
          }),
        }))
      },

      deletePhone(id) {
        set((s) => ({
          phones: s.phones.filter((p) => p.id !== id),
          quotes: s.quotes.filter((q) => q.phoneId !== id),
          transactions: s.transactions.filter((t) => t.phoneId !== id),
        }))
      },

      addQuote(quoteData) {
        const id = genId()
        const quote: PlatformQuote = { ...quoteData, id, createdAt: Date.now() }
        set((s) => ({ quotes: [...s.quotes, quote] }))
      },

      deleteQuote(id) {
        set((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) }))
      },

      addTransaction(txData) {
        const id = genId()
        const tx: Transaction = { ...txData, id, transactedAt: Date.now() }
        set((s) => ({ transactions: [...s.transactions, tx] }))
      },
    }),
    { name: 'phone-recycle-store' }
  )
)
