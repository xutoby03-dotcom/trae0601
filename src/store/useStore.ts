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

function alertExists(alerts: AlertItem[], type: AlertItem["type"], borrowRecordId?: string, deviceId?: string) {
  return alerts.some((a) => {
    if (a.resolved) return false
    if (a.type !== type) return false
    if (borrowRecordId && a.borrowRecordId && a.borrowRecordId !== borrowRecordId) return false
    if (deviceId && a.deviceId !== deviceId) return false
    return true
  })
}

const saved = loadFromStorage()

export const useStore = create<AppState>((set, get) => ({
  devices: saved?.devices ?? mockDevices,
  borrowRecords: saved?.borrowRecords ?? mockBorrowRecords,
  alerts: saved?.alerts ?? mockAlerts,

  addDevice: (device) => {
    set((s) => {
      const devices = [...s.devices, device]
      const alerts = [...s.alerts]

      if (device.firmwareVersion !== device.standardFirmware) {
        if (!alertExists(alerts, "non_standard_firmware", undefined, device.id)) {
          alerts.push({
            id: `alt-${Date.now()}-${device.id}-fw`,
            type: "non_standard_firmware",
            deviceId: device.id,
            borrowRecordId: "",
            message: `样机 ${device.code} 固件版本 ${device.firmwareVersion} 与标准版 ${device.standardFirmware} 不一致`,
            severity: "low",
            createdAt: new Date().toISOString(),
            resolved: false,
          })
        }
      }

      const next = { ...s, devices, alerts }
      saveToStorage(next)
      return next
    })
  },

  updateDevice: (id, data) => {
    set((s) => {
      const devices = s.devices.map((d) => (d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d))
      const device = devices.find((d) => d.id === id)
      let alerts = [...s.alerts]

      if (device) {
        if (device.firmwareVersion !== device.standardFirmware) {
          if (!alertExists(alerts, "non_standard_firmware", undefined, device.id)) {
            alerts.push({
              id: `alt-${Date.now()}-${device.id}-fw`,
              type: "non_standard_firmware",
              deviceId: device.id,
              borrowRecordId: "",
              message: `样机 ${device.code} 固件版本 ${device.firmwareVersion} 与标准版 ${device.standardFirmware} 不一致`,
              severity: "medium",
              createdAt: new Date().toISOString(),
              resolved: false,
            })
          }
        } else {
          alerts = alerts.map((a) =>
            a.type === "non_standard_firmware" && a.deviceId === device.id && a.resolved === false
              ? { ...a, resolved: true }
              : a
          )
        }
      }

      const next = { ...s, devices, alerts }
      saveToStorage(next)
      return next
    })
  },

  addBorrowRecord: (record) => {
    set((s) => {
      const now = new Date()
      const device = s.devices.find((d) => d.id === record.deviceId)

      const isOverdue = new Date(record.expectedReturnDate) < now
      const newStatus = isOverdue ? ("overdue" as const) : ("borrowed" as const)

      const correctedRecord: BorrowRecord = { ...record, status: newStatus }
      const borrowRecords = [...s.borrowRecords, correctedRecord]

      const devices = s.devices.map((d) =>
        d.id === record.deviceId ? { ...d, status: newStatus, updatedAt: new Date().toISOString() } : d
      )

      const newAlerts: AlertItem[] = [...s.alerts]

      if (record.hasSensitiveData) {
        if (!alertExists(newAlerts, "sensitive_data", record.id, record.deviceId)) {
          newAlerts.push({
            id: `alt-${Date.now()}-${record.id}-sd`,
            type: "sensitive_data",
            deviceId: record.deviceId,
            borrowRecordId: record.id,
            message: `样机 ${device?.code ?? ""} 外借含客户敏感数据，借用人：${record.borrower}（${record.customer}），归还时需确认数据已清空`,
            severity: "high",
            createdAt: new Date().toISOString(),
            resolved: false,
          })
        }
      }

      if (device && device.firmwareVersion !== device.standardFirmware) {
        if (!alertExists(newAlerts, "non_standard_firmware", undefined, record.deviceId)) {
          newAlerts.push({
            id: `alt-${Date.now()}-${record.id}-fw`,
            type: "non_standard_firmware",
            deviceId: record.deviceId,
            borrowRecordId: record.id,
            message: `样机 ${device.code} 借出时固件版本 ${device.firmwareVersion} 与标准版 ${device.standardFirmware} 不一致`,
            severity: "medium",
            createdAt: new Date().toISOString(),
            resolved: false,
          })
        }
      }

      if (isOverdue) {
        if (!alertExists(newAlerts, "overdue", record.id, record.deviceId)) {
          newAlerts.push({
            id: `alt-${Date.now()}-${record.id}-ov`,
            type: "overdue",
            deviceId: record.deviceId,
            borrowRecordId: record.id,
            message: `样机 ${device?.code ?? ""} 已逾期未归还，借用人：${record.borrower}`,
            severity: "high",
            createdAt: new Date().toISOString(),
            resolved: false,
          })
        }
      }

      const next = { ...s, borrowRecords, devices, alerts: newAlerts }
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
      const device = devices.find((d) => d.id === record.deviceId)

      let newAlerts: AlertItem[] = [...s.alerts]

      // 归还时：解决该外借的逾期预警
      newAlerts = newAlerts.map((a) =>
        a.type === "overdue" && a.borrowRecordId === record.id
          ? { ...a, resolved: true }
          : a
      )

      // 归还时：如果数据清空通过，解决该外借的敏感数据预警
      if (check.dataCleared && record.hasSensitiveData) {
        newAlerts = newAlerts.map((a) =>
          a.type === "sensitive_data" && a.borrowRecordId === record.id
            ? { ...a, resolved: true }
            : a
        )
      }

      // 归还时：如果固件回滚通过，解决该设备的固件预警
      if (check.firmwareRolledBack) {
        newAlerts = newAlerts.map((a) =>
          a.type === "non_standard_firmware" && a.deviceId === record.deviceId
            ? { ...a, resolved: true }
            : a
        )
      }

      // 归还检查不通过：新增预警
      if (!check.passed) {
        if (!check.accessoriesComplete) {
          newAlerts.push({
            id: `alt-${Date.now()}-${record.id}-acc`,
            type: "non_standard_firmware",
            deviceId: record.deviceId,
            borrowRecordId: record.id,
            message: `样机 ${device?.code ?? ""} 归还配件不全：${check.accessoriesNote || "无详细描述"}`,
            severity: "medium",
            createdAt: new Date().toISOString(),
            resolved: false,
          })
        }
        if (!check.noNewScratches) {
          newAlerts.push({
            id: `alt-${Date.now()}-${record.id}-sc`,
            type: "non_standard_firmware",
            deviceId: record.deviceId,
            borrowRecordId: record.id,
            message: `样机 ${device?.code ?? ""} 归还发现新增划痕：${check.scratchesNote || "无详细描述"}`,
            severity: "medium",
            createdAt: new Date().toISOString(),
            resolved: false,
          })
        }
        if (!check.dataCleared) {
          newAlerts.push({
            id: `alt-${Date.now()}-${record.id}-dc`,
            type: "sensitive_data",
            deviceId: record.deviceId,
            borrowRecordId: record.id,
            message: `样机 ${device?.code ?? ""} 归还时客户数据未清空：${check.dataClearNote || "无详细描述"}`,
            severity: "high",
            createdAt: new Date().toISOString(),
            resolved: false,
          })
        }
        if (!check.firmwareRolledBack) {
          newAlerts.push({
            id: `alt-${Date.now()}-${record.id}-fr`,
            type: "non_standard_firmware",
            deviceId: record.deviceId,
            borrowRecordId: record.id,
            message: `样机 ${device?.code ?? ""} 归还时固件未回滚至标准版：${check.firmwareNote || "无详细描述"}`,
            severity: "medium",
            createdAt: new Date().toISOString(),
            resolved: false,
          })
        }
      }

      // 如果归还后设备固件仍不是标准版，重新生成固件预警
      if (device && device.firmwareVersion !== device.standardFirmware) {
        if (!alertExists(newAlerts, "non_standard_firmware", undefined, device.id)) {
          newAlerts.push({
            id: `alt-${Date.now()}-${device.id}-fw-fallback`,
            type: "non_standard_firmware",
            deviceId: device.id,
            borrowRecordId: record.id,
            message: `样机 ${device.code} 固件版本 ${device.firmwareVersion} 与标准版 ${device.standardFirmware} 不一致`,
            severity: "medium",
            createdAt: new Date().toISOString(),
            resolved: false,
          })
        }
      }

      const next = { ...s, borrowRecords, devices, alerts: newAlerts }
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
      let updatedDevices = [...s.devices]
      let updatedRecords = [...s.borrowRecords]

      for (let i = 0; i < updatedRecords.length; i++) {
        const record = updatedRecords[i]
        if (record.status === "returned") continue

        const isOverdue = new Date(record.expectedReturnDate) < now
        if (isOverdue && record.status !== "overdue") {
          updatedRecords[i] = { ...record, status: "overdue" as const }
          const device = updatedDevices.find((d) => d.id === record.deviceId)
          if (device) {
            updatedDevices = updatedDevices.map((d) =>
              d.id === device.id ? { ...d, status: "overdue" as const } : d
            )
          }
          if (!alertExists(newAlerts, "overdue", record.id, record.deviceId)) {
            newAlerts.push({
              id: `alt-auto-${Date.now()}-${record.id}`,
              type: "overdue",
              deviceId: record.deviceId,
              borrowRecordId: record.id,
              message: `样机 ${device?.code ?? ""} 已逾期未归还，借用人：${record.borrower}`,
              severity: "high",
              createdAt: new Date().toISOString(),
              resolved: false,
            })
          }
        }
      }

      const next = { ...s, alerts: newAlerts, devices: updatedDevices, borrowRecords: updatedRecords }
      saveToStorage(next)
      return next
    })
  },
}))
