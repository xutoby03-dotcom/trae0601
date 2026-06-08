import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Plan, FamilyNeeds } from '@/types'

interface PlanStore {
  plans: Plan[]
  familyNeeds: FamilyNeeds
  addPlan: (plan: Plan) => void
  updatePlan: (id: string, plan: Partial<Plan>) => void
  removePlan: (id: string) => void
  setFamilyNeeds: (needs: Partial<FamilyNeeds>) => void
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      plans: [],
      familyNeeds: {
        gaming: false,
        remoteWork: false,
        elderlyTV: false,
        multiVideo: false,
      },
      addPlan: (plan) =>
        set((state) => ({ plans: [...state.plans, plan] })),
      updatePlan: (id, updates) =>
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removePlan: (id) =>
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
        })),
      setFamilyNeeds: (needs) =>
        set((state) => ({
          familyNeeds: { ...state.familyNeeds, ...needs },
        })),
    }),
    {
      name: 'broadband-compare-storage',
    }
  )
)
