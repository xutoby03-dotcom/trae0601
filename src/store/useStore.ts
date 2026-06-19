import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Device, DryingRecord, CleaningRecord } from '@/types'

interface AppState {
  devices: Device[]
  dryingRecords: DryingRecord[]
  cleaningRecords: CleaningRecord[]
  nextDeepCleanDate: string

  addDevice: (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateDevice: (id: string, data: Partial<Device>) => void
  deleteDevice: (id: string) => void

  addDryingRecord: (record: Omit<DryingRecord, 'id' | 'createdAt'>) => void
  deleteDryingRecord: (id: string) => void

  addCleaningRecord: (record: Omit<CleaningRecord, 'id' | 'createdAt'>) => void
  deleteCleaningRecord: (id: string) => void

  setNextDeepCleanDate: (date: string) => void

  getConsecutiveUncleaned: (deviceId: string) => number
  getAverageDuration: (deviceId: string) => number
  isDurationAbnormal: (record: DryingRecord) => boolean
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      devices: [],
      dryingRecords: [],
      cleaningRecords: [],
      nextDeepCleanDate: '',

      addDevice: (device) => {
        const now = new Date().toISOString()
        const newDevice: Device = {
          ...device,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ devices: [...state.devices, newDevice] }))
      },

      updateDevice: (id, data) => {
        set((state) => ({
          devices: state.devices.map((d) =>
            d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d
          ),
        }))
      },

      deleteDevice: (id) => {
        set((state) => ({
          devices: state.devices.filter((d) => d.id !== id),
          dryingRecords: state.dryingRecords.filter((r) => r.deviceId !== id),
          cleaningRecords: state.cleaningRecords.filter(
            (c) => c.deviceId !== id
          ),
        }))
      },

      addDryingRecord: (record) => {
        const newRecord: DryingRecord = {
          ...record,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          dryingRecords: [...state.dryingRecords, newRecord],
        }))
      },

      deleteDryingRecord: (id) => {
        set((state) => ({
          dryingRecords: state.dryingRecords.filter((r) => r.id !== id),
          cleaningRecords: state.cleaningRecords.filter(
            (c) => c.dryingRecordId !== id
          ),
        }))
      },

      addCleaningRecord: (record) => {
        const newRecord: CleaningRecord = {
          ...record,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set((state) => {
          const updatedDryingRecords = record.dryingRecordId
            ? state.dryingRecords.map((r) =>
                r.id === record.dryingRecordId ? { ...r, filterCleaned: true } : r
              )
            : state.dryingRecords

          let updatedNextDeepCleanDate = state.nextDeepCleanDate
          if (state.nextDeepCleanDate) {
            const currentDate = new Date(state.nextDeepCleanDate)
            currentDate.setDate(currentDate.getDate() + 90)
            updatedNextDeepCleanDate = currentDate.toISOString().slice(0, 10)
          }

          return {
            cleaningRecords: [...state.cleaningRecords, newRecord],
            dryingRecords: updatedDryingRecords,
            nextDeepCleanDate: updatedNextDeepCleanDate,
          }
        })
      },

      deleteCleaningRecord: (id) => {
        set((state) => ({
          cleaningRecords: state.cleaningRecords.filter((c) => c.id !== id),
        }))
      },

      setNextDeepCleanDate: (date) => {
        set({ nextDeepCleanDate: date })
      },

      getConsecutiveUncleaned: (deviceId) => {
        const records = get()
          .dryingRecords.filter((r) => r.deviceId === deviceId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        let count = 0
        for (const r of records) {
          if (!r.filterCleaned) {
            count++
          } else {
            break
          }
        }
        return count
      },

      getAverageDuration: (deviceId) => {
        const records = get().dryingRecords.filter(
          (r) => r.deviceId === deviceId && r.filterCleaned
        )
        if (records.length === 0) return 0
        const sum = records.reduce((acc, r) => acc + r.duration, 0)
        return sum / records.length
      },

      isDurationAbnormal: (record) => {
        const avg = get().getAverageDuration(record.deviceId)
        if (avg === 0) return false
        return record.duration > avg * 1.3
      },
    }),
    {
      name: 'lint-guard-storage',
    }
  )
)
