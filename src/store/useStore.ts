import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Appliance, ApplianceSchedule, Bill, TimeSlotType } from "@/types"
import { getTimeSlotForHour } from "@/types"

interface AppState {
  appliances: Appliance[]
  schedules: ApplianceSchedule[]
  bills: Bill[]
  dismissedAlerts: string[]

  addAppliance: (app: Omit<Appliance, "id">) => void
  updateAppliance: (id: string, app: Partial<Appliance>) => void
  removeAppliance: (id: string) => void

  moveSchedule: (applianceId: string, startHour: number) => void
  initSchedule: (applianceId: string, startHour: number) => void

  addBill: (bill: Omit<Bill, "id">) => void
  updateBill: (id: string, bill: Partial<Bill>) => void
  removeBill: (id: string) => void

  dismissAlert: (id: string) => void
  resetDismissedAlerts: () => void
}

let counter = 0
function uid() {
  counter++
  return `${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 8)}`
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      appliances: [],
      schedules: [],
      bills: [],
      dismissedAlerts: [],

      addAppliance: (app) => {
        const id = uid()
        const newApp: Appliance = { ...app, id }
        const startHour = app.mustDaytime ? 10 : 23
        set(state => ({
          appliances: [...state.appliances, newApp],
          schedules: [...state.schedules, {
            id: uid(),
            applianceId: id,
            startHour,
            timeSlot: getTimeSlotForHour(startHour),
          }],
        }))
      },

      updateAppliance: (id, updates) => {
        set(state => ({
          appliances: state.appliances.map(a => a.id === id ? { ...a, ...updates } : a),
        }))
      },

      removeAppliance: (id) => {
        set(state => ({
          appliances: state.appliances.filter(a => a.id !== id),
          schedules: state.schedules.filter(s => s.applianceId !== id),
        }))
      },

      moveSchedule: (applianceId, startHour) => {
        const timeSlot: TimeSlotType = getTimeSlotForHour(startHour)
        set(state => ({
          schedules: state.schedules.map(s =>
            s.applianceId === applianceId
              ? { ...s, startHour, timeSlot }
              : s
          ),
        }))
      },

      initSchedule: (applianceId, startHour) => {
        const existing = get().schedules.find(s => s.applianceId === applianceId)
        if (existing) return
        const timeSlot: TimeSlotType = getTimeSlotForHour(startHour)
        set(state => ({
          schedules: [...state.schedules, { id: uid(), applianceId, startHour, timeSlot }],
        }))
      },

      addBill: (bill) => {
        set(state => ({ bills: [...state.bills, { ...bill, id: uid() }] }))
      },

      updateBill: (id, updates) => {
        set(state => ({
          bills: state.bills.map(b => b.id === id ? { ...b, ...updates } : b),
        }))
      },

      removeBill: (id) => {
        set(state => ({ bills: state.bills.filter(b => b.id !== id) }))
      },

      dismissAlert: (id) => {
        set(state => ({
          dismissedAlerts: [...state.dismissedAlerts, id],
        }))
      },

      resetDismissedAlerts: () => {
        set({ dismissedAlerts: [] })
      },
    }),
    {
      name: "electricity-ledger",
    }
  )
)
