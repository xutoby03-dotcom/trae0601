import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Pet, Foster, DailyCheckin, Message } from '@/types'

interface AppState {
  pets: Pet[]
  fosters: Foster[]
  checkins: DailyCheckin[]
  messages: Message[]

  addPet: (pet: Pet) => void
  updatePet: (id: string, pet: Partial<Pet>) => void
  deletePet: (id: string) => void

  addFoster: (foster: Foster) => void
  updateFoster: (id: string, foster: Partial<Foster>) => void
  deleteFoster: (id: string) => void

  addCheckin: (checkin: DailyCheckin) => void
  updateCheckin: (id: string, checkin: Partial<DailyCheckin>) => void

  addMessage: (message: Message) => void
  deleteMessage: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      pets: [],
      fosters: [],
      checkins: [],
      messages: [],

      addPet: (pet) =>
        set((state) => ({ pets: [...state.pets, pet] })),

      updatePet: (id, updates) =>
        set((state) => ({
          pets: state.pets.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      deletePet: (id) =>
        set((state) => ({
          pets: state.pets.filter((p) => p.id !== id),
          fosters: state.fosters.filter((f) => f.petId !== id),
        })),

      addFoster: (foster) =>
        set((state) => ({ fosters: [...state.fosters, foster] })),

      updateFoster: (id, updates) =>
        set((state) => ({
          fosters: state.fosters.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        })),

      deleteFoster: (id) =>
        set((state) => ({
          fosters: state.fosters.filter((f) => f.id !== id),
          checkins: state.checkins.filter((c) => c.fosterId !== id),
          messages: state.messages.filter((m) => m.fosterId !== id),
        })),

      addCheckin: (checkin) =>
        set((state) => ({ checkins: [...state.checkins, checkin] })),

      updateCheckin: (id, updates) =>
        set((state) => ({
          checkins: state.checkins.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      deleteMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        })),
    }),
    {
      name: 'pet-foster-storage',
    }
  )
)
