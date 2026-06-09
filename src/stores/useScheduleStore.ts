import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GarbageRoomSchedule } from '../types'

interface ScheduleState {
  schedules: GarbageRoomSchedule[]
  addSchedule: (schedule: GarbageRoomSchedule) => void
  removeSchedule: (id: string) => void
  updateSchedule: (id: string, data: Partial<GarbageRoomSchedule>) => void
  toggleSchedule: (id: string) => void
}

const defaultSchedules: GarbageRoomSchedule[] = [
  { id: '1', dayOfWeek: 1, openTime: '07:00', closeTime: '09:00', category: 'kitchen', enabled: true },
  { id: '2', dayOfWeek: 1, openTime: '18:00', closeTime: '20:00', category: 'kitchen', enabled: true },
  { id: '3', dayOfWeek: 2, openTime: '07:00', closeTime: '09:00', category: 'kitchen', enabled: true },
  { id: '4', dayOfWeek: 2, openTime: '18:00', closeTime: '20:00', category: 'kitchen', enabled: true },
  { id: '5', dayOfWeek: 3, openTime: '07:00', closeTime: '09:00', category: 'kitchen', enabled: true },
  { id: '6', dayOfWeek: 3, openTime: '18:00', closeTime: '20:00', category: 'kitchen', enabled: true },
  { id: '7', dayOfWeek: 4, openTime: '07:00', closeTime: '09:00', category: 'kitchen', enabled: true },
  { id: '8', dayOfWeek: 4, openTime: '18:00', closeTime: '20:00', category: 'kitchen', enabled: true },
  { id: '9', dayOfWeek: 5, openTime: '07:00', closeTime: '09:00', category: 'kitchen', enabled: true },
  { id: '10', dayOfWeek: 5, openTime: '18:00', closeTime: '20:00', category: 'kitchen', enabled: true },
  { id: '11', dayOfWeek: 6, openTime: '07:00', closeTime: '09:00', category: 'recyclable', enabled: true },
  { id: '12', dayOfWeek: 6, openTime: '18:00', closeTime: '20:00', category: 'kitchen', enabled: true },
  { id: '13', dayOfWeek: 0, openTime: '07:00', closeTime: '09:00', category: 'hazardous', enabled: true },
  { id: '14', dayOfWeek: 0, openTime: '18:00', closeTime: '20:00', category: 'kitchen', enabled: true },
]

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      schedules: defaultSchedules,
      addSchedule: (schedule) =>
        set((state) => ({ schedules: [...state.schedules, schedule] })),
      removeSchedule: (id) =>
        set((state) => ({ schedules: state.schedules.filter((s) => s.id !== id) })),
      updateSchedule: (id, data) =>
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),
      toggleSchedule: (id) =>
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
          ),
        })),
    }),
    { name: 'schedule-store' }
  )
)
