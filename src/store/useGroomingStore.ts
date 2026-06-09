import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Pet, Appointment, GroomingRecord, Reminder } from '@/types'

interface GroomingStore {
  pets: Pet[]
  appointments: Appointment[]
  groomingRecords: GroomingRecord[]
  reminders: Reminder[]

  addPet: (pet: Pet) => void
  updatePet: (id: string, data: Partial<Pet>) => void
  deletePet: (id: string) => void

  addAppointment: (appointment: Appointment) => void
  updateAppointment: (id: string, data: Partial<Appointment>) => void
  deleteAppointment: (id: string) => void

  addGroomingRecord: (record: GroomingRecord) => void
  updateGroomingRecord: (id: string, data: Partial<GroomingRecord>) => void

  addReminder: (reminder: Reminder) => void
  updateReminder: (id: string, data: Partial<Reminder>) => void
  deleteReminder: (id: string) => void
  completeReminder: (id: string) => void
}

export const useGroomingStore = create<GroomingStore>()(
  persist(
    (set) => ({
      pets: [],
      appointments: [],
      groomingRecords: [],
      reminders: [],

      addPet: (pet) => set((s) => ({ pets: [...s.pets, pet] })),
      updatePet: (id, data) => set((s) => ({ pets: s.pets.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
      deletePet: (id) => set((s) => ({
        pets: s.pets.filter((p) => p.id !== id),
        appointments: s.appointments.filter((a) => a.petId !== id),
        reminders: s.reminders.filter((r) => r.petId !== id),
      })),

      addAppointment: (appointment) => set((s) => ({ appointments: [...s.appointments, appointment] })),
      updateAppointment: (id, data) => set((s) => ({ appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...data } : a)) })),
      deleteAppointment: (id) => set((s) => ({
        appointments: s.appointments.filter((a) => a.id !== id),
        groomingRecords: s.groomingRecords.filter((r) => r.appointmentId !== id),
      })),

      addGroomingRecord: (record) => set((s) => ({ groomingRecords: [...s.groomingRecords, record] })),
      updateGroomingRecord: (id, data) => set((s) => ({ groomingRecords: s.groomingRecords.map((r) => (r.id === id ? { ...r, ...data } : r)) })),

      addReminder: (reminder) => set((s) => ({ reminders: [...s.reminders, reminder] })),
      updateReminder: (id, data) => set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, ...data } : r)) })),
      deleteReminder: (id) => set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
      completeReminder: (id) => set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, isCompleted: true } : r)) })),
    }),
    { name: 'pet-grooming-store' }
  )
)
