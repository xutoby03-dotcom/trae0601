import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Procurement, ProcurementStatus } from '@/types'
import { mockProcurements } from '@/data/mockData'

interface ProcurementStore {
  procurements: Procurement[]
  addProcurement: (procurement: Procurement) => void
  updateProcurementStatus: (id: string, status: ProcurementStatus) => void
  updateProcurement: (id: string, data: Partial<Procurement>) => void
  deleteProcurement: (id: string) => void
}

export const useProcurementStore = create<ProcurementStore>()(
  persist(
    (set) => ({
      procurements: mockProcurements,
      addProcurement: (procurement) =>
        set((state) => ({
          procurements: [...state.procurements, procurement],
        })),
      updateProcurementStatus: (id, status) =>
        set((state) => ({
          procurements: state.procurements.map((p) => {
            if (p.id !== id) return p
            const updates: Partial<Procurement> = { status }
            if (status === 'arrived') updates.arrivedAt = new Date().toISOString()
            if (status === 'installed') updates.installedAt = new Date().toISOString()
            return { ...p, ...updates }
          }),
        })),
      updateProcurement: (id, data) =>
        set((state) => ({
          procurements: state.procurements.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),
      deleteProcurement: (id) =>
        set((state) => ({
          procurements: state.procurements.filter((p) => p.id !== id),
        })),
    }),
    { name: 'procurement-store' }
  )
)
