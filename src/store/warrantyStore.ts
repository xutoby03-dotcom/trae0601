import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Device, MaintenanceRecord } from '../types'

interface WarrantyState {
  devices: Device[]
  maintenanceRecords: MaintenanceRecord[]
  addDevice: (device: Omit<Device, 'id' | 'createdAt'>) => void
  updateDevice: (id: string, data: Partial<Device>) => void
  deleteDevice: (id: string) => void
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => void
  updateMaintenanceRecord: (id: string, data: Partial<MaintenanceRecord>) => void
  deleteMaintenanceRecord: (id: string) => void
  getDeviceRecords: (deviceId: string) => MaintenanceRecord[]
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const useWarrantyStore = create<WarrantyState>()(
  persist(
    (set, get) => ({
      devices: [],
      maintenanceRecords: [],

      addDevice: (device) => {
        set((state) => ({
          devices: [
            ...state.devices,
            { ...device, id: generateId(), createdAt: new Date().toISOString() },
          ],
        }))
      },

      updateDevice: (id, data) => {
        set((state) => ({
          devices: state.devices.map((d) => (d.id === id ? { ...d, ...data } : d)),
        }))
      },

      deleteDevice: (id) => {
        set((state) => ({
          devices: state.devices.filter((d) => d.id !== id),
          maintenanceRecords: state.maintenanceRecords.filter((r) => r.deviceId !== id),
        }))
      },

      addMaintenanceRecord: (record) => {
        set((state) => ({
          maintenanceRecords: [
            ...state.maintenanceRecords,
            { ...record, id: generateId(), createdAt: new Date().toISOString() },
          ],
        }))
      },

      updateMaintenanceRecord: (id, data) => {
        set((state) => ({
          maintenanceRecords: state.maintenanceRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        }))
      },

      deleteMaintenanceRecord: (id) => {
        set((state) => ({
          maintenanceRecords: state.maintenanceRecords.filter((r) => r.id !== id),
        }))
      },

      getDeviceRecords: (deviceId) => {
        return get()
          .maintenanceRecords.filter((r) => r.deviceId === deviceId)
          .sort((a, b) => b.date.localeCompare(a.date))
      },
    }),
    {
      name: 'warranty-card-book-storage',
    }
  )
)
