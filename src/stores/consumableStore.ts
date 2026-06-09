import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Consumable, StockRecord } from '@/types'
import { mockConsumables, mockStockRecords } from '@/data/mockData'

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
    (set) => ({
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
      adjustStock: (consumableId, type, quantity, reason) =>
        set((state) => {
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
              c.id === consumableId
                ? {
                    ...c,
                    quantity:
                      type === 'in'
                        ? c.quantity + quantity
                        : Math.max(0, c.quantity - quantity),
                  }
                : c
            ),
            stockRecords: [...state.stockRecords, record],
          }
        }),
      deleteConsumable: (id) =>
        set((state) => ({
          consumables: state.consumables.filter((c) => c.id !== id),
        })),
    }),
    { name: 'consumable-store' }
  )
)
