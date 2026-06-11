import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Vehicle, CheckupRecord, DetectionEvent, EventRegistration, DegradationLevel } from './types'

interface AppState {
  currentUser: User | null
  users: User[]
  vehicles: Vehicle[]
  checkupRecords: CheckupRecord[]
  detectionEvents: DetectionEvent[]
  eventRegistrations: EventRegistration[]

  setCurrentUser: (user: User | null) => void
  loginAsOwner: () => void
  loginAsAdmin: () => void
  logout: () => void

  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'degradationLevel' | 'lastCheckupDate'>) => void
  updateVehicle: (id: string, data: Partial<Vehicle>) => void
  deleteVehicle: (id: string) => void

  addCheckupRecord: (record: Omit<CheckupRecord, 'id'>) => void
  getVehicleCheckups: (vehicleId: string) => CheckupRecord[]

  addDetectionEvent: (event: Omit<DetectionEvent, 'id'>) => void
  deleteDetectionEvent: (id: string) => void
  registerForEvent: (eventId: string, vehicleId: string) => EventRegistration | null
  getEventRegistrations: (eventId: string) => EventRegistration[]
  getUserRegistrations: (userId: string) => EventRegistration[]
}

const uid = () => Math.random().toString(36).slice(2, 10)

const seedUsers: User[] = [
  { id: 'u1', name: '张明', phone: '13800001001', role: 'owner', building: '1栋' },
  { id: 'u2', name: '李芳', phone: '13800001002', role: 'owner', building: '2栋' },
  { id: 'u3', name: '王强', phone: '13800001003', role: 'owner', building: '3栋' },
  { id: 'u4', name: '赵丽', phone: '13800001004', role: 'owner', building: '1栋' },
  { id: 'u5', name: '陈物业', phone: '13800000001', role: 'admin', building: '物业中心' },
]

const seedVehicles: Vehicle[] = [
  { id: 'v1', userId: 'u1', brand: '雅迪DE3', batteryModel: '天能48V20Ah', purchaseDate: '2024-03-15', nominalRange: 60, chargeHabit: 'daily', heatAnomaly: 'none', building: '1栋', degradationLevel: 'A', lastCheckupDate: '2026-05-20' },
  { id: 'v2', userId: 'u1', brand: '小牛MQi+', batteryModel: '博世48V24Ah', purchaseDate: '2023-06-10', nominalRange: 70, chargeHabit: 'every2days', heatAnomaly: 'occasional', building: '1栋', degradationLevel: 'C', lastCheckupDate: '2026-04-18' },
  { id: 'v3', userId: 'u2', brand: '爱玛礼想N380', batteryModel: '超威48V20Ah', purchaseDate: '2022-11-20', nominalRange: 55, chargeHabit: 'daily', heatAnomaly: 'yes', building: '2栋', degradationLevel: 'E', lastCheckupDate: '2026-03-10' },
  { id: 'v4', userId: 'u3', brand: '台铃标兵', batteryModel: '天能60V20Ah', purchaseDate: '2024-08-01', nominalRange: 80, chargeHabit: 'every2days', heatAnomaly: 'none', building: '3栋', degradationLevel: 'A', lastCheckupDate: '2026-05-28' },
  { id: 'v5', userId: 'u3', brand: '绿源S30', batteryModel: '星恒48V24Ah', purchaseDate: '2023-01-15', nominalRange: 65, chargeHabit: 'every3days', heatAnomaly: 'occasional', building: '3栋', degradationLevel: 'B', lastCheckupDate: '2026-05-01' },
  { id: 'v6', userId: 'u4', brand: '九号N90C', batteryModel: ' ATL48V28Ah', purchaseDate: '2024-05-20', nominalRange: 75, chargeHabit: 'daily', heatAnomaly: 'none', building: '1栋', degradationLevel: 'A', lastCheckupDate: '2026-05-25' },
  { id: 'v7', userId: 'u4', brand: '新日XC3', batteryModel: '超威48V12Ah', purchaseDate: '2021-09-10', nominalRange: 40, chargeHabit: 'daily', heatAnomaly: 'yes', building: '1栋', degradationLevel: 'D', lastCheckupDate: '2026-02-14' },
]

const seedCheckupRecords: CheckupRecord[] = [
  { id: 'c1', vehicleId: 'v1', date: '2026-05-20', voltage: 48.2, fullChargeHours: 4.0, actualRange: 56, photos: [], degradationLevel: 'A', degradationScore: 92, suggestion: '电池状态良好，建议保持现有充电习惯，定期体检。' },
  { id: 'c2', vehicleId: 'v2', date: '2026-04-18', voltage: 45.8, fullChargeHours: 7.5, actualRange: 42, photos: [], degradationLevel: 'C', degradationScore: 52, suggestion: '电池明显衰减，建议前往专业门店检测，考虑更换电池，避免长时间骑行。' },
  { id: 'c3', vehicleId: 'v3', date: '2026-03-10', voltage: 40.1, fullChargeHours: 9.0, actualRange: 18, photos: [], degradationLevel: 'E', degradationScore: 15, suggestion: '⚠️ 电池状态危险！存在安全隐患，请立即停止使用并更换电池，联系物业报备。' },
  { id: 'c4', vehicleId: 'v4', date: '2026-05-28', voltage: 60.3, fullChargeHours: 6.0, actualRange: 74, photos: [], degradationLevel: 'A', degradationScore: 95, suggestion: '电池状态良好，建议保持现有充电习惯，定期体检。' },
  { id: 'c5', vehicleId: 'v5', date: '2026-05-01', voltage: 47.5, fullChargeHours: 8.5, actualRange: 48, photos: [], degradationLevel: 'B', degradationScore: 72, suggestion: '电池轻微衰减，建议减少快充频率，避免过充过放，3个月内复查。' },
  { id: 'c6', vehicleId: 'v6', date: '2026-05-25', voltage: 48.1, fullChargeHours: 4.2, actualRange: 70, photos: [], degradationLevel: 'A', degradationScore: 93, suggestion: '电池状态良好，建议保持现有充电习惯，定期体检。' },
  { id: 'c7', vehicleId: 'v7', date: '2026-02-14', voltage: 43.5, fullChargeHours: 8.0, actualRange: 15, photos: [], degradationLevel: 'D', degradationScore: 38, suggestion: '电池严重衰减，续航大幅下降，强烈建议尽快更换电池，注意充电安全。' },
]

const seedEvents: DetectionEvent[] = [
  { id: 'e1', date: '2026-06-15', timeSlot: '09:00-12:00', location: '小区北门广场', maxSlots: 30, createdBy: 'u5' },
  { id: 'e2', date: '2026-06-22', timeSlot: '14:00-17:00', location: '小区南门车棚', maxSlots: 25, createdBy: 'u5' },
  { id: 'e3', date: '2026-07-05', timeSlot: '09:00-12:00', location: '小区北门广场', maxSlots: 30, createdBy: 'u5' },
]

const seedRegistrations: EventRegistration[] = [
  { id: 'r1', eventId: 'e1', vehicleId: 'v1', userId: 'u1', queueNumber: 1 },
  { id: 'r2', eventId: 'e1', vehicleId: 'v2', userId: 'u1', queueNumber: 2 },
  { id: 'r3', eventId: 'e1', vehicleId: 'v3', userId: 'u2', queueNumber: 3 },
  { id: 'r4', eventId: 'e2', vehicleId: 'v4', userId: 'u3', queueNumber: 1 },
]

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: seedUsers,
      vehicles: seedVehicles,
      checkupRecords: seedCheckupRecords,
      detectionEvents: seedEvents,
      eventRegistrations: seedRegistrations,

      setCurrentUser: (user) => set({ currentUser: user }),

      loginAsOwner: () => {
        const ownerUsers = get().users.filter((u) => u.role === 'owner')
        if (ownerUsers.length > 0) {
          set({ currentUser: ownerUsers[0] })
        }
      },

      loginAsAdmin: () => {
        const admins = get().users.filter((u) => u.role === 'admin')
        if (admins.length > 0) {
          set({ currentUser: admins[0] })
        }
      },

      logout: () => set({ currentUser: null }),

      addVehicle: (vehicleData) => {
        const newVehicle: Vehicle = {
          ...vehicleData,
          id: 'v' + uid(),
          degradationLevel: 'A',
          lastCheckupDate: '',
        }
        set((state) => ({ vehicles: [...state.vehicles, newVehicle] }))
      },

      updateVehicle: (id, data) => {
        set((state) => ({
          vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...data } : v)),
        }))
      },

      deleteVehicle: (id) => {
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
          checkupRecords: state.checkupRecords.filter((c) => c.vehicleId !== id),
          eventRegistrations: state.eventRegistrations.filter((r) => r.vehicleId !== id),
        }))
      },

      addCheckupRecord: (record) => {
        const newRecord: CheckupRecord = { ...record, id: 'c' + uid() }
        set((state) => {
          const vehicle = state.vehicles.find((v) => v.id === record.vehicleId)
          const updatedVehicles = vehicle
            ? state.vehicles.map((v) =>
                v.id === record.vehicleId
                  ? { ...v, degradationLevel: record.degradationLevel, lastCheckupDate: record.date }
                  : v
              )
            : state.vehicles
          return {
            checkupRecords: [...state.checkupRecords, newRecord],
            vehicles: updatedVehicles,
          }
        })
      },

      getVehicleCheckups: (vehicleId) => {
        return get().checkupRecords.filter((c) => c.vehicleId === vehicleId).sort((a, b) => b.date.localeCompare(a.date))
      },

      addDetectionEvent: (event) => {
        const newEvent: DetectionEvent = { ...event, id: 'e' + uid() }
        set((state) => ({ detectionEvents: [...state.detectionEvents, newEvent] }))
      },

      deleteDetectionEvent: (id) => {
        set((state) => ({
          detectionEvents: state.detectionEvents.filter((e) => e.id !== id),
          eventRegistrations: state.eventRegistrations.filter((r) => r.eventId !== id),
        }))
      },

      registerForEvent: (eventId, vehicleId) => {
        const state = get()
        const existing = state.eventRegistrations.filter((r) => r.eventId === eventId)
        const event = state.detectionEvents.find((e) => e.id === eventId)
        if (!event || existing.length >= event.maxSlots) return null

        const alreadyRegistered = existing.some((r) => r.vehicleId === vehicleId)
        if (alreadyRegistered) return null

        const user = state.currentUser
        if (!user) return null

        const registration: EventRegistration = {
          id: 'r' + uid(),
          eventId,
          vehicleId,
          userId: user.id,
          queueNumber: existing.length + 1,
        }
        set((s) => ({ eventRegistrations: [...s.eventRegistrations, registration] }))
        return registration
      },

      getEventRegistrations: (eventId) => {
        return get().eventRegistrations.filter((r) => r.eventId === eventId)
      },

      getUserRegistrations: (userId) => {
        return get().eventRegistrations.filter((r) => r.userId === userId)
      },
    }),
    { name: 'battery-checkup-store' }
  )
)
