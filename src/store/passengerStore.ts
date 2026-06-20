import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Passenger, PassengerStatus } from "@/types"

interface PassengerStore {
  passengers: Passenger[]
  currentIndex: number
  isPlaying: boolean
  isNightMode: boolean
  isLocked: boolean
  carouselInterval: number

  addPassenger: (p: Omit<Passenger, "id" | "createdAt">) => void
  updatePassenger: (id: string, p: Partial<Passenger>) => void
  removePassenger: (id: string) => void
  setStatus: (id: string, status: PassengerStatus) => void
  markPickedUp: (id: string) => void

  setCurrentIndex: (i: number) => void
  nextCard: () => void
  prevCard: () => void
  setIsPlaying: (v: boolean) => void
  toggleNightMode: () => void
  toggleLock: () => void
  setCarouselInterval: (ms: number) => void

  getActivePassengers: () => Passenger[]
  getSortedActivePassengers: () => Passenger[]
}

export const usePassengerStore = create<PassengerStore>()(
  persist(
    (set, get) => ({
      passengers: [],
      currentIndex: 0,
      isPlaying: true,
      isNightMode: false,
      isLocked: false,
      carouselInterval: 10000,

      addPassenger: (p) => {
        const newP: Passenger = {
          ...p,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ passengers: [...s.passengers, newP] }))
      },

      updatePassenger: (id, updates) => {
        set((s) => ({
          passengers: s.passengers.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }))
      },

      removePassenger: (id) => {
        set((s) => ({
          passengers: s.passengers.filter((p) => p.id !== id),
          currentIndex: Math.min(s.currentIndex, Math.max(0, s.passengers.filter((p) => p.id !== id && p.status !== "picked_up").length - 1)),
        }))
      },

      setStatus: (id, status) => {
        set((s) => ({
          passengers: s.passengers.map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        }))
      },

      markPickedUp: (id) => {
        set((s) => {
          const updated = s.passengers.map((p) =>
            p.id === id ? { ...p, status: "picked_up" as PassengerStatus } : p
          )
          const active = updated.filter((p) => p.status !== "picked_up")
          return {
            passengers: updated,
            currentIndex: Math.min(s.currentIndex, Math.max(0, active.length - 1)),
          }
        })
      },

      setCurrentIndex: (i) => set({ currentIndex: i }),

      nextCard: () => {
        const active = get().getSortedActivePassengers()
        if (active.length === 0) return
        set((s) => ({
          currentIndex: (s.currentIndex + 1) % active.length,
        }))
      },

      prevCard: () => {
        const active = get().getSortedActivePassengers()
        if (active.length === 0) return
        set((s) => ({
          currentIndex: (s.currentIndex - 1 + active.length) % active.length,
        }))
      },

      setIsPlaying: (v) => set({ isPlaying: v }),

      toggleNightMode: () => set((s) => ({ isNightMode: !s.isNightMode })),

      toggleLock: () => set((s) => ({ isLocked: !s.isLocked })),

      setCarouselInterval: (ms) => set({ carouselInterval: ms }),

      getActivePassengers: () => {
        return get().passengers.filter((p) => p.status !== "picked_up")
      },

      getSortedActivePassengers: () => {
        return get()
          .passengers.filter((p) => p.status !== "picked_up")
          .sort((a, b) => {
            if (a.status === "delayed" && b.status !== "delayed") return 1
            if (a.status !== "delayed" && b.status === "delayed") return -1
            return new Date(a.landingTime).getTime() - new Date(b.landingTime).getTime()
          })
      },
    }),
    {
      name: "pickup-carousel-storage",
    }
  )
)
