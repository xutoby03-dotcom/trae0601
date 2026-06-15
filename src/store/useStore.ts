import { create } from "zustand"
import type { Device, BorrowRecord, AlertItem, ReturnCheck } from "@/types"
import { mockDevices, mockBorrowRecords, mockAlerts } from "@/data/mockData"

interface AppState {
  devices: Device[]
  borrowRecords: BorrowRecord[]
  alerts: AlertItem[]

  addDevice: (device: Device) => void
  updateDevice: (id: string, data: Partial<Device>) => void

  addBorrowRecord: (record: BorrowRecord) => void
  returnDevice: (recordId: string, check: ReturnCheck) => void

  resolveAlert: (id: string) => void
  generateAlerts: () => void
}

const STORAGE_KEY = "device-tracker-data"

function loadFromStorage(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveToStorage(state: Pick<AppState, "devices" | "borrowRecords" | "alerts">) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        devices: state.devices,
        borrowRecords: state.borrowRecords,
        alerts: state.alerts,
      })
    )
  } catch {}
}

const saved = loadFromStorage()

export const useStore = create<AppState>((set, get) => ({
  devices: saved?.devices ?? mockDevices,
  borrowRecords: saved?.borrowRecords ?? mockBorrowRecords,
  alerts: saved?.alerts ?? mockAlerts,

  addDevice: (device) => {
    set((s) => {
      const devices = [...s.devices, device]
      const next = { ...s, devices }
      saveToStorage(next)
      return next
    })
  },

  updateDevice: (id, data) => {
    set((s) => {
      const devices = s.devices.map((d) => (d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d))
      const next = { ...s, devices }
      saveToStorage(next)
      return next
    })
  },

  addBorrowRecord: (record) => {
    set((s) => {
      const borrowRecords = [...s.borrowRecords, record]
      const devices = s.devices.map((d) =>
        d.id === record.deviceId ? { ...d, status: "borrowed" as const, updatedAt: new Date().toISOString() } : d
      )
      const next = { ...s, borrowRecords, devices }
      saveToStorage(next)
      return next
    })
  },

  returnDevice: (recordId, check) => {
    set((s) => {
      const record = s.borrowRecords.find((r) => r.id === recordId)
      if (!record) return s

      const borrowRecords = s.borrowRecords.map((r) =>
        r.id === recordId
          ? {
              ...r,
              actualReturnDate: new Date().toISOString(),
              status: "returned" as const,
              returnCheck: check,
            }
          : r
      )

      const deviceUpdate: Partial<Device> = {
        status: "idle" as const,
        updatedAt: new Date().toISOString(),
      }
      if (check.firmwareRolledBack) {
        const device = s.devices.find((d) => d.id === record.deviceId)
        if (device) deviceUpdate.firmwareVersion = device.standardFirmware
      }

      const devices = s.devices.map((d) =>
        d.id === record.deviceId ? { ...d, ...deviceUpdate } : d
      )

      const next = { ...s, borrowRecords, devices }
      saveToStorage(next)
      return next
    })
  },

  resolveAlert: (id) => {
    set((s) => {
      const alerts = s.alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a))
      const next = { ...s, alerts }
      saveToStorage(next)
      return next
    })
  },

  generateAlerts: () => {
    set((s) => {
      const now = new Date()
      const newAlerts: AlertItem[] = [...s.alerts.filter((a) => !a.resolved)]

      for (const record of s.borrowRecords) {
        if (record.status !== "borrowed") continue

        const isOverdue = new Date(record.expectedReturnDate) < now
        if (isOverdue) {
          const devices = s.devices.find((d) => d.id === record.deviceId)
          const existing = newAlerts.find(
            (a) => a.type === "overdue" && a.borrowRecordId === record.id
          )
          if (!existing) {
            newAlerts.push({
              id: `alt-${Date.now()}-${record.id}`,
              type: "overdue",
              deviceId: record.deviceId,
              borrowRecordId: record.id,
              message: `样机 ${devices?.code ?? ""} 已逾期未归还，借用人：${record.borrower}`,
              severity: "high",
              createdAt: new Date().toISOString(),
              resolved: false,
            })
          }

          const dev = s.devices.find((d) => d.id === record.deviceId)
          if (dev) {
            const updatedDevices = s.devices.map((d) =>
              d.id === record.deviceId ? { ...d, status: "overdue" as const } : d
            )
            const next = { ...s, alerts: newAlerts, devices: updatedDevices }
            saveToStorage(next)
            return next
          }
        }
      }

      const next = { ...s, alerts: newAlerts }
      saveToStorage(next)
      return next
    })
  },
}))
