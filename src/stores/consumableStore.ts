import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Consumable, StockRecord } from '@/types'
import { mockConsumables, mockStockRecords } from '@/data/mockData'
import { setPrinterStatusIfHigher, findPrintersByConsumableName, recalculatePrinterStatus } from '@/utils/statusSync'

interface ConsumableStore {
  consumables: Consumable[]
  stockRecords: StockRecord[]
  addConsumable: (consumable: Consumable) => void
  updateConsumable: (id: string, data: Partial<Consumable>) => void
  adjustStock: (consumableId: string, type: 'in' | 'out', quantity: number, reason: string) => void
  deleteConsumable: (id: string) => void
}

export const useConsumableStore = create<ConsumableStore>()(
  persist(
    (set, get) => ({
      consumables: mockConsumables,
      stockRecords: mockStockRecords,
      addConsumable: (consumable) =>
        set((state) => ({ consumables: [...state.consumables, consumable] })),
      updateConsumable: (id, data) =>
        set((state) => ({
          consumables: state.consumables.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),
      adjustStock: (consumableId, type, quantity, reason) => {
        set((state) => {
          const consumable = state.consumables.find((c) => c.id === consumableId)
          if (!consumable) return state

          const newQuantity =
            type === 'in'
              ? consumable.quantity + quantity
              : Math.max(0, consumable.quantity - quantity)

          const wasBelowThreshold = consumable.quantity <= consumable.threshold
          const isBelowThreshold = newQuantity <= consumable.threshold

          if (type === 'out' && isBelowThreshold) {
            const printerIds = findPrintersByConsumableName(consumable.name)
            printerIds.forEach((pid) => setPrinterStatusIfHigher(pid, 'low_supply'))
          }

          if (type === 'in' && wasBelowThreshold && !isBelowThreshold) {
            const printerIds = findPrintersByConsumableName(consumable.name)
            printerIds.forEach((pid) => {
              setTimeout(() => recalculatePrinterStatus(pid), 0)
            })
          }

          const record: StockRecord = {
            id: `sr_${Date.now()}`,
            consumableId,
            type,
            quantity,
            reason,
            createdAt: new Date().toISOString(),
          }

          return {
            consumables: state.consumables.map((c) =>
              c.id === consumableId ? { ...c, quantity: newQuantity } : c
            ),
            stockRecords: [...state.stockRecords, record],
          }
        })
      },
      deleteConsumable: (id) =>
        set((state) => ({
          consumables: state.consumables.filter((c) => c.id !== id),
        })),
    }),
    { name: 'consumable-store' }
  )
)
