import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Expense, CoolItem, BudgetConfig } from '@/types'
import { DEFAULT_BUDGETS } from '@/types'

interface AppState {
  expenses: Expense[]
  coolItems: CoolItem[]
  budgets: BudgetConfig[]

  addExpense: (expense: Expense) => void
  updateExpense: (id: string, updates: Partial<Expense>) => void
  deleteExpense: (id: string) => void

  addCoolItem: (item: CoolItem) => void
  updateCoolItem: (id: string, updates: Partial<CoolItem>) => void
  deleteCoolItem: (id: string) => void

  updateBudget: (category: string, limit: number) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      expenses: [],
      coolItems: [],
      budgets: DEFAULT_BUDGETS,

      addExpense: (expense) =>
        set((state) => ({ expenses: [expense, ...state.expenses] })),

      updateExpense: (id, updates) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addCoolItem: (item) =>
        set((state) => ({ coolItems: [item, ...state.coolItems] })),

      updateCoolItem: (id, updates) =>
        set((state) => ({
          coolItems: state.coolItems.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),

      deleteCoolItem: (id) =>
        set((state) => ({
          coolItems: state.coolItems.filter((i) => i.id !== id),
        })),

      updateBudget: (category, limit) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.category === category ? { ...b, monthlyLimit: limit } : b
          ),
        })),
    }),
    {
      name: 'emotion-ledger-storage',
    }
  )
)
