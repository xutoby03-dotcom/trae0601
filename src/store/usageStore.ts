import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UsageRecord } from '@/types'

interface UsageStore {
  records: UsageRecord[]
  addRecord: (record: UsageRecord) => void
  deleteRecord: (id: string) => void
  getRecordsByGearId: (gearId: string) => UsageRecord[]
}

export const useUsageStore = create<UsageStore>()(
  persist(
    (set, get) => ({
      records: [],
      addRecord: (record) =>
        set((state) => ({ records: [...state.records, record] })),
      deleteRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),
      getRecordsByGearId: (gearId) =>
        get().records.filter((r) => r.gearId === gearId),
    }),
    { name: 'gearcare-usage' }
  )
)
