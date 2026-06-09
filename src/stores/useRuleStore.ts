import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RuleCard } from '../types'
import { defaultRules } from '../data/defaultRules'

interface RuleState {
  rules: RuleCard[]
  toggleFavorite: (id: string) => void
}

export const useRuleStore = create<RuleState>()(
  persist(
    (set) => ({
      rules: defaultRules,
      toggleFavorite: (id) =>
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id ? { ...r, isFavorited: !r.isFavorited } : r
          ),
        })),
    }),
    { name: 'rule-store' }
  )
)
