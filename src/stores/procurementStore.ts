import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Procurement, ProcurementStatus } from '@/types'
import { mockProcurements } from '@/data/mockData'
import { useConsumableStore } from '@/stores/consumableStore'
import { setPrinterStatusIfHigher, findPrintersByConsumableName, recalculatePrinterStatus } from '@/utils/statusSync'

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
      addProcurement: (procurement) => {
        set((state) => ({
          procurements: [...state.procurements, procurement],
        }))
        const consumable = useConsumableStore.getState().consumables.find(
          (c) => c.id === procurement.consumableId
        )
        if (consumable) {
          const printerIds = findPrintersByConsumableName(consumable.name)
          printerIds.forEach((pid) => setPrinterStatusIfHigher(pid, 'procurement'))
        }
      },
      updateProcurementStatus: (id, status) =>
        set((state) => {
          const procurement = state.procurements.find((p) => p.id === id)
          const updated = state.procurements.map((p) => {
            if (p.id !== id) return p
            const updates: Partial<Procurement> = { status }
            if (status === 'arrived') updates.arrivedAt = new Date().toISOString()
            if (status === 'installed') updates.installedAt = new Date().toISOString()
            return { ...p, ...updates }
          })
          if (procurement) {
            const consumable = useConsumableStore.getState().consumables.find(
              (c) => c.id === procurement.consumableId
            )
            if (consumable) {
              if (status === 'installed') {
                const printerIds = findPrintersByConsumableName(consumable.name)
                printerIds.forEach((pid) => {
                  setTimeout(() => recalculatePrinterStatus(pid), 0)
                })
              } else {
                const printerIds = findPrintersByConsumableName(consumable.name)
                printerIds.forEach((pid) => setPrinterStatusIfHigher(pid, 'procurement'))
              }
            }
          }
          return { procurements: updated }
        }),
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
