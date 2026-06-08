import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Carpool, CarpoolStatus, Passenger, Message, FrequentRoute } from '@/types'
import { MOCK_CARPOOLS } from '@/data/mock'
import { isDeparted } from '@/utils/time'

interface CarpoolStore {
  carpools: Carpool[]
  currentUserId: string
  currentUserName: string

  addCarpool: (carpool: Omit<Carpool, 'id' | 'passengers' | 'messages' | 'createdAt' | 'status'>) => string
  joinCarpool: (carpoolId: string) => void
  leaveCarpool: (carpoolId: string) => void
  updateStatus: (carpoolId: string, status: CarpoolStatus) => void
  addMessage: (carpoolId: string, content: string) => void
  getCarpool: (carpoolId: string) => Carpool | undefined
  getActiveCarpools: () => Carpool[]
  getHistoricalCarpools: () => Carpool[]
  getFrequentRoutes: () => FrequentRoute[]
  republishRoute: (departure: string, destination: string, cost: number) => string
  initMockData: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 10)

export const useCarpoolStore = create<CarpoolStore>()(
  persist(
    (set, get) => ({
      carpools: [],
      currentUserId: 'me',
      currentUserName: '我',

      addCarpool: (carpoolData) => {
        const id = generateId()
        const newCarpool: Carpool = {
          ...carpoolData,
          id,
          passengers: [{ id: carpoolData.publisherId, name: carpoolData.publisherName, joinedAt: new Date().toISOString() }],
          messages: [],
          createdAt: new Date().toISOString(),
          status: 'recruiting',
        }
        set((state) => ({ carpools: [newCarpool, ...state.carpools] }))
        return id
      },

      joinCarpool: (carpoolId) => {
        set((state) => ({
          carpools: state.carpools.map((c) => {
            if (c.id !== carpoolId) return c
            if (c.status !== 'recruiting' && c.status !== 'full') return c
            if (c.passengers.some((p) => p.id === state.currentUserId)) return c
            const remaining = c.totalSeats - c.passengers.length
            if (remaining <= 0) return c
            const newPassengers = [...c.passengers, { id: state.currentUserId, name: state.currentUserName, joinedAt: new Date().toISOString() }]
            const newStatus: CarpoolStatus = newPassengers.length >= c.totalSeats ? 'full' : c.status
            return { ...c, passengers: newPassengers, status: newStatus }
          }),
        }))
      },

      leaveCarpool: (carpoolId) => {
        set((state) => ({
          carpools: state.carpools.map((c) => {
            if (c.id !== carpoolId) return c
            if (c.status !== 'recruiting' && c.status !== 'full') return c
            const newPassengers = c.passengers.filter((p) => p.id !== state.currentUserId)
            const newStatus: CarpoolStatus = c.status === 'full' && newPassengers.length < c.totalSeats ? 'recruiting' : c.status
            return { ...c, passengers: newPassengers, status: newStatus }
          }),
        }))
      },

      updateStatus: (carpoolId, status) => {
        set((state) => ({
          carpools: state.carpools.map((c) =>
            c.id === carpoolId ? { ...c, status } : c
          ),
        }))
      },

      addMessage: (carpoolId, content) => {
        const state = get()
        const msg: Message = {
          id: generateId(),
          authorId: state.currentUserId,
          authorName: state.currentUserName,
          content,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          carpools: state.carpools.map((c) =>
            c.id === carpoolId ? { ...c, messages: [...c.messages, msg] } : c
          ),
        }))
      },

      getCarpool: (carpoolId) => {
        return get().carpools.find((c) => c.id === carpoolId)
      },

      getActiveCarpools: () => {
        return get().carpools.filter((c) => c.status === 'recruiting' || c.status === 'full')
      },

      getHistoricalCarpools: () => {
        return get().carpools.filter((c) => c.status === 'departed' || c.status === 'cancelled')
      },

      getFrequentRoutes: () => {
        const all = get().carpools
        const routeMap = new Map<string, FrequentRoute>()
        all.forEach((c) => {
          const key = `${c.departure}→${c.destination}`
          const existing = routeMap.get(key)
          if (existing) {
            existing.count++
            if (c.createdAt > existing.lastUsed) existing.lastUsed = c.createdAt
          } else {
            routeMap.set(key, {
              id: generateId(),
              departure: c.departure,
              destination: c.destination,
              count: 1,
              lastUsed: c.createdAt,
            })
          }
        })
        return Array.from(routeMap.values())
          .filter((r) => r.count >= 2)
          .sort((a, b) => b.count - a.count)
      },

      republishRoute: (departure, destination, cost) => {
        const state = get()
        return state.addCarpool({
          departure,
          destination,
          departureTime: new Date(Date.now() + 3600000).toISOString(),
          totalSeats: 4,
          totalCost: cost,
          allowLuggage: true,
          contact: '',
          publisherId: state.currentUserId,
          publisherName: state.currentUserName,
        })
      },

      initMockData: () => {
        const state = get()
        if (state.carpools.length === 0) {
          const updated = MOCK_CARPOOLS.map((c) => {
            if (isDeparted(c.departureTime) && c.status === 'recruiting') {
              return { ...c, status: 'departed' as CarpoolStatus }
            }
            return c
          })
          set({ carpools: updated })
        }
      },
    }),
    {
      name: 'carpool-storage',
    }
  )
)
