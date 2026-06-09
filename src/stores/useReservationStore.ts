import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Reservation, ReservationStatus } from '@/types'
import { mockReservations } from '@/utils/mockData'

interface ReservationStore {
  reservations: Reservation[]
  addReservation: (data: Omit<Reservation, 'id' | 'createdAt' | 'status'>, totalSeats: number) => string
  cancelReservation: (id: string, minutesBeforeDeparture: number, totalSeats: number) => { creditCost: number; type: 'free' | 'late' | 'no_show' }
  updateStatus: (id: string, status: ReservationStatus) => void
  getReservationsByRoute: (routeId: string) => Reservation[]
  getWaitlistByRoute: (routeId: string) => Reservation[]
  getConfirmedByRoute: (routeId: string) => Reservation[]
  getReservationsByEmployee: (employeeId: string) => Reservation[]
  getOccupiedSeats: (routeId: string) => number
  getRemainingSeats: (routeId: string, totalSeats: number) => number
  renumberWaitlist: (routeId: string) => void
}

let resCounter = 20

export const useReservationStore = create<ReservationStore>()(
  persist(
    (set, get) => ({
      reservations: mockReservations,

      addReservation: (data, totalSeats) => {
        const id = `res${++resCounter}_${Date.now()}`
        const occupied = get().getOccupiedSeats(data.routeId)
        const needed = 1 + data.companions
        const isWaitlisted = data.isWaitlisted || (occupied + needed > totalSeats)

        const waitlistPosition = isWaitlisted
          ? get().getWaitlistByRoute(data.routeId).length + 1
          : 0

        const reservation: Reservation = {
          ...data,
          id,
          status: 'reserved',
          createdAt: new Date().toISOString(),
          isWaitlisted,
          waitlistPosition,
        }
        set((s) => ({ reservations: [...s.reservations, reservation] }))
        return id
      },

      cancelReservation: (id, minutesBeforeDeparture, totalSeats) => {
        let creditCost = 0
        let type: 'free' | 'late' | 'no_show' = 'free'

        if (minutesBeforeDeparture >= 30) {
          creditCost = 0
          type = 'free'
        } else if (minutesBeforeDeparture > 0) {
          creditCost = 1
          type = 'late'
        } else {
          creditCost = 3
          type = 'no_show'
        }

        const target = get().reservations.find((r) => r.id === id)
        if (!target) return { creditCost, type }

        const wasWaitlisted = target.isWaitlisted
        const routeId = target.routeId

        set((s) => ({
          reservations: s.reservations.map((r) =>
            r.id === id
              ? { ...r, status: 'cancelled' as ReservationStatus, cancelledAt: new Date().toISOString() }
              : r
          ),
        }))

        if (wasWaitlisted) {
          get().renumberWaitlist(routeId)
        } else {
          const occupied = get().getOccupiedSeats(routeId)
          const waitlist = get().getWaitlistByRoute(routeId)
          let seatsAvailable = totalSeats - occupied

          const toPromote: string[] = []
          for (const wl of waitlist) {
            const needed = 1 + wl.companions
            if (seatsAvailable >= needed) {
              toPromote.push(wl.id)
              seatsAvailable -= needed
            } else {
              break
            }
          }

          if (toPromote.length > 0) {
            set((s) => ({
              reservations: s.reservations.map((r) => {
                if (toPromote.includes(r.id)) {
                  return { ...r, isWaitlisted: false, waitlistPosition: 0 }
                }
                return r
              }),
            }))
            get().renumberWaitlist(routeId)
          }
        }

        return { creditCost, type }
      },

      updateStatus: (id, status) => {
        set((s) => ({
          reservations: s.reservations.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        }))
      },

      getReservationsByRoute: (routeId) =>
        get().reservations.filter((r) => r.routeId === routeId && r.status !== 'cancelled'),

      getWaitlistByRoute: (routeId) =>
        get()
          .reservations.filter((r) => r.routeId === routeId && r.isWaitlisted && r.status !== 'cancelled')
          .sort((a, b) => a.waitlistPosition - b.waitlistPosition),

      getConfirmedByRoute: (routeId) =>
        get().reservations.filter(
          (r) => r.routeId === routeId && !r.isWaitlisted && r.status !== 'cancelled'
        ),

      getReservationsByEmployee: (employeeId) =>
        get().reservations.filter((r) => r.employeeId === employeeId),

      getOccupiedSeats: (routeId) => {
        const confirmed = get().getConfirmedByRoute(routeId)
        return confirmed.reduce((sum, r) => sum + 1 + r.companions, 0)
      },

      getRemainingSeats: (routeId, totalSeats) => {
        const occupied = get().getOccupiedSeats(routeId)
        return Math.max(0, totalSeats - occupied)
      },

      renumberWaitlist: (routeId) => {
        const waitlist = get()
          .reservations.filter((r) => r.routeId === routeId && r.isWaitlisted && r.status !== 'cancelled')
          .sort((a, b) => a.waitlistPosition - b.waitlistPosition)

        if (waitlist.length === 0) return

        const positionMap = new Map<string, number>()
        waitlist.forEach((r, i) => positionMap.set(r.id, i + 1))

        set((s) => ({
          reservations: s.reservations.map((r) => {
            if (positionMap.has(r.id)) {
              return { ...r, waitlistPosition: positionMap.get(r.id)! }
            }
            return r
          }),
        }))
      },
    }),
    { name: 'shuttle-reservations' }
  )
)
