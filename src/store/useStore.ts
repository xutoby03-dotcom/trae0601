import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Device,
  CheckRecord,
  CleanRecord,
  MaintenanceAlert,
  UsageRecord,
  DeviceStatus,
} from '@/types'

const BATH_CHAIR_IMG = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=white%20medical%20bath%20chair%20with%20armrests%20and%20anti-slip%20feet%20on%20white%20background%2C%20product%20photo%2C%20clean%20minimal&image_size=square'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

interface AppState {
  devices: Device[]
  checkRecords: CheckRecord[]
  cleanRecords: CleanRecord[]
  maintenanceAlerts: MaintenanceAlert[]
  usageRecords: UsageRecord[]

  addDevice: (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateDevice: (id: string, data: Partial<Device>) => void
  deleteDevice: (id: string) => void

  startUsage: (deviceId: string, checkRecordId: string) => string
  completeUsage: (usageId: string, cleanRecordId: string) => void

  addCheckRecord: (record: Omit<CheckRecord, 'id'>) => string
  addCleanRecord: (record: Omit<CleanRecord, 'id'>) => string

  addMaintenanceAlert: (alert: Omit<MaintenanceAlert, 'id'>) => string
  resolveMaintenanceAlert: (alertId: string, resolvedBy: string, resolvedNotes: string) => void
  resolveAlertAndRestoreDevice: (alertId: string, resolvedBy: string, resolvedNotes: string) => void

  getWeeklyUsageCount: () => number
  getDeviceCheckRecords: (deviceId: string) => CheckRecord[]
  getDeviceCleanRecords: (deviceId: string) => CleanRecord[]
  getDeviceAlerts: (deviceId: string) => MaintenanceAlert[]
  getActiveUsageForDevice: (deviceId: string) => UsageRecord | undefined
}

const now = () => new Date().toISOString()
const weekAgo = () => {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString()
}

const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev-001',
    code: 'ZY-001',
    weightCapacity: 150,
    armrestType: 'fixed',
    footPadStatus: 'good',
    purchaseDate: '2024-03-15',
    photo: BATH_CHAIR_IMG,
    status: 'available',
    createdAt: '2024-03-15T08:00:00.000Z',
    updatedAt: '2024-03-15T08:00:00.000Z',
  },
  {
    id: 'dev-002',
    code: 'ZY-002',
    weightCapacity: 120,
    armrestType: 'removable',
    footPadStatus: 'worn',
    purchaseDate: '2023-11-20',
    photo: BATH_CHAIR_IMG,
    status: 'in_use',
    createdAt: '2023-11-20T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dev-003',
    code: 'ZY-003',
    weightCapacity: 130,
    armrestType: 'none',
    footPadStatus: 'cracked',
    purchaseDate: '2023-06-10',
    photo: BATH_CHAIR_IMG,
    status: 'pending_maintenance',
    createdAt: '2023-06-10T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
]

const INITIAL_ALERTS: MaintenanceAlert[] = [
  {
    id: 'alert-001',
    deviceId: 'dev-003',
    reason: '防滑脚垫开裂，存在滑倒风险',
    triggerSource: 'pre_check',
    status: 'pending',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedBy: null,
    resolvedNotes: null,
  },
]

const INITIAL_USAGE: UsageRecord[] = [
  {
    id: 'usage-001',
    deviceId: 'dev-002',
    checkRecordId: 'chk-init',
    cleanRecordId: null,
    startTime: new Date().toISOString(),
    endTime: null,
    status: 'in_progress',
  },
]

const INITIAL_CHECKS: CheckRecord[] = [
  {
    id: 'chk-init',
    deviceId: 'dev-002',
    seatOk: true,
    backrestOk: true,
    footPadOk: true,
    screwsOk: true,
    drainHoleOk: true,
    allPassed: true,
    checkedAt: new Date().toISOString(),
    checkedBy: '李阿姨',
  },
]

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      devices: INITIAL_DEVICES,
      checkRecords: INITIAL_CHECKS,
      cleanRecords: [],
      maintenanceAlerts: INITIAL_ALERTS,
      usageRecords: INITIAL_USAGE,

      addDevice: (deviceData) => {
        const id = generateId()
        const timestamp = now()
        const device: Device = {
          ...deviceData,
          id,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        set((s) => ({ devices: [...s.devices, device] }))
        return id
      },

      updateDevice: (id, data) => {
        set((s) => ({
          devices: s.devices.map((d) =>
            d.id === id ? { ...d, ...data, updatedAt: now() } : d
          ),
        }))
      },

      deleteDevice: (id) => {
        set((s) => ({
          devices: s.devices.filter((d) => d.id !== id),
          checkRecords: s.checkRecords.filter((r) => r.deviceId !== id),
          cleanRecords: s.cleanRecords.filter((r) => r.deviceId !== id),
          maintenanceAlerts: s.maintenanceAlerts.filter((a) => a.deviceId !== id),
          usageRecords: s.usageRecords.filter((u) => u.deviceId !== id),
        }))
      },

      startUsage: (deviceId, checkRecordId) => {
        const id = generateId()
        const usage: UsageRecord = {
          id,
          deviceId,
          checkRecordId,
          cleanRecordId: null,
          startTime: now(),
          endTime: null,
          status: 'in_progress',
        }
        set((s) => ({
          devices: s.devices.map((d) =>
            d.id === deviceId ? { ...d, status: 'in_use' as DeviceStatus, updatedAt: now() } : d
          ),
          usageRecords: [...s.usageRecords, usage],
        }))
        return id
      },

      completeUsage: (usageId, cleanRecordId) => {
        set((s) => ({
          usageRecords: s.usageRecords.map((u) =>
            u.id === usageId
              ? { ...u, cleanRecordId, endTime: now(), status: 'completed' as const }
              : u
          ),
        }))
      },

      addCheckRecord: (recordData) => {
        const id = generateId()
        const record: CheckRecord = { ...recordData, id }
        set((s) => ({ checkRecords: [...s.checkRecords, record] }))
        return id
      },

      addCleanRecord: (recordData) => {
        const id = generateId()
        const record: CleanRecord = { ...recordData, id }
        set((s) => ({ cleanRecords: [...s.cleanRecords, record] }))
        return id
      },

      addMaintenanceAlert: (alertData) => {
        const id = generateId()
        const alert: MaintenanceAlert = { ...alertData, id }
        set((s) => ({
          maintenanceAlerts: [...s.maintenanceAlerts, alert],
        }))
        return id
      },

      resolveMaintenanceAlert: (alertId, resolvedBy, resolvedNotes) => {
        set((s) => ({
          maintenanceAlerts: s.maintenanceAlerts.map((a) =>
            a.id === alertId
              ? { ...a, status: 'resolved' as const, resolvedAt: now(), resolvedBy, resolvedNotes }
              : a
          ),
        }))
      },

      resolveAlertAndRestoreDevice: (alertId, resolvedBy, resolvedNotes) => {
        const alert = get().maintenanceAlerts.find((a) => a.id === alertId)
        if (!alert) return
        set((s) => ({
          maintenanceAlerts: s.maintenanceAlerts.map((a) =>
            a.id === alertId
              ? { ...a, status: 'resolved' as const, resolvedAt: now(), resolvedBy, resolvedNotes }
              : a
          ),
          devices: s.devices.map((d) =>
            d.id === alert.deviceId
              ? { ...d, status: 'pending_clean' as DeviceStatus, updatedAt: now() }
              : d
          ),
        }))
      },

      getWeeklyUsageCount: () => {
        const cutoff = weekAgo()
        return get().usageRecords.filter((u) => u.startTime >= cutoff).length
      },

      getDeviceCheckRecords: (deviceId) => {
        return get().checkRecords.filter((r) => r.deviceId === deviceId)
      },

      getDeviceCleanRecords: (deviceId) => {
        return get().cleanRecords.filter((r) => r.deviceId === deviceId)
      },

      getDeviceAlerts: (deviceId) => {
        return get().maintenanceAlerts.filter((a) => a.deviceId === deviceId)
      },

      getActiveUsageForDevice: (deviceId) => {
        return get().usageRecords.find(
          (u) => u.deviceId === deviceId && u.status === 'in_progress'
        )
      },
    }),
    {
      name: 'bath-chair-storage',
    }
  )
)
