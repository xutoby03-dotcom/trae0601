import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HearingAid, DailyRecord, Reminder, MaintenanceRecord } from '@/types'

interface AppState {
  hearingAids: HearingAid[]
  dailyRecords: DailyRecord[]
  reminders: Reminder[]
  maintenanceRecords: MaintenanceRecord[]

  addHearingAid: (aid: HearingAid) => void
  updateHearingAid: (id: string, aid: Partial<HearingAid>) => void
  deleteHearingAid: (id: string) => void

  addDailyRecord: (record: DailyRecord) => void
  updateDailyRecord: (id: string, record: Partial<DailyRecord>) => void
  deleteDailyRecord: (id: string) => void

  addReminder: (reminder: Reminder) => void
  updateReminder: (id: string, reminder: Partial<Reminder>) => void
  deleteReminder: (id: string) => void
  toggleReminder: (id: string) => void

  addMaintenanceRecord: (record: MaintenanceRecord) => void
  updateMaintenanceRecord: (id: string, record: Partial<MaintenanceRecord>) => void
  deleteMaintenanceRecord: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      hearingAids: [],
      dailyRecords: [],
      reminders: [],
      maintenanceRecords: [],

      addHearingAid: (aid) =>
        set((state) => ({ hearingAids: [...state.hearingAids, aid] })),
      updateHearingAid: (id, aid) =>
        set((state) => ({
          hearingAids: state.hearingAids.map((a) =>
            a.id === id ? { ...a, ...aid } : a
          ),
        })),
      deleteHearingAid: (id) =>
        set((state) => ({
          hearingAids: state.hearingAids.filter((a) => a.id !== id),
          dailyRecords: state.dailyRecords.filter((r) => r.aidId !== id),
          maintenanceRecords: state.maintenanceRecords.filter((r) => r.aidId !== id),
        })),

      addDailyRecord: (record) =>
        set((state) => ({ dailyRecords: [...state.dailyRecords, record] })),
      updateDailyRecord: (id, record) =>
        set((state) => ({
          dailyRecords: state.dailyRecords.map((r) =>
            r.id === id ? { ...r, ...record } : r
          ),
        })),
      deleteDailyRecord: (id) =>
        set((state) => ({
          dailyRecords: state.dailyRecords.filter((r) => r.id !== id),
        })),

      addReminder: (reminder) =>
        set((state) => ({ reminders: [...state.reminders, reminder] })),
      updateReminder: (id, reminder) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, ...reminder } : r
          ),
        })),
      deleteReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        })),
      toggleReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
          ),
        })),

      addMaintenanceRecord: (record) =>
        set((state) => ({
          maintenanceRecords: [...state.maintenanceRecords, record],
        })),
      updateMaintenanceRecord: (id, record) =>
        set((state) => ({
          maintenanceRecords: state.maintenanceRecords.map((r) =>
            r.id === id ? { ...r, ...record } : r
          ),
        })),
      deleteMaintenanceRecord: (id) =>
        set((state) => ({
          maintenanceRecords: state.maintenanceRecords.filter((r) => r.id !== id),
        })),
    }),
    {
      name: 'hearing-aid-reminder',
    }
  )
)
