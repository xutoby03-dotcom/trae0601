import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MaintenanceRecord } from '@/types'

interface MaintenanceStore {
  records: MaintenanceRecord[]
  addRecord: (record: MaintenanceRecord) => void
  getRecordsByGearId: (gearId: string) => MaintenanceRecord[]
}

export const useMaintenanceStore = create<MaintenanceStore>()(
  persist(
    (set, get) => ({
      records: [],
      addRecord: (record) =>
        set((state) => ({ records: [...state.records, record] })),
      getRecordsByGearId: (gearId) =>
        get().records.filter((r) => r.gearId === gearId),
    }),
    { name: 'gearcare-maintenance' }
  )
)
