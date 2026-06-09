import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Reservation, ReservationStatus } from '@/types'
import { mockReservations } from '@/utils/mockData'

interface ReservationStore {
  reservations: Reservation[]
  addReservation: (data: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => string
  cancelReservation: (id: string, minutesBeforeDeparture: number) => { creditCost: number; type: 'free' | 'late' | 'no_show' }
  updateStatus: (id: string, status: ReservationStatus) => void
  getReservationsByRoute: (routeId: string) => Reservation[]
  getWaitlistByRoute: (routeId: string) => Reservation[]
  getConfirmedByRoute: (routeId: string) => Reservation[]
  getReservationsByEmployee: (employeeId: string) => Reservation[]
  getRemainingSeats: (routeId: string, totalSeats: number) => number
}

let resCounter = 20

export const useReservationStore = create<ReservationStore>()(
  persist(
    (set, get) => ({
      reservations: mockReservations,

      addReservation: (data) => {
        const id = `res${++resCounter}_${Date.now()}`
        const isWaitlisted = data.isWaitlisted
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

      cancelReservation: (id, minutesBeforeDeparture) => {
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

        set((s) => ({
          reservations: s.reservations.map((r) =>
            r.id === id
              ? { ...r, status: 'cancelled' as ReservationStatus, cancelledAt: new Date().toISOString() }
              : r
          ),
        }))

        const cancelled = get().reservations.find((r) => r.id === id)
        if (cancelled && cancelled.isWaitlisted) {
          const waitlist = get()
            .getWaitlistByRoute(cancelled.routeId)
            .filter((r) => r.id !== id)
          if (waitlist.length > 0) {
            const promoted = waitlist[0]
            set((s) => ({
              reservations: s.reservations.map((r) =>
                r.id === promoted.id
                  ? { ...r, isWaitlisted: false, waitlistPosition: 0 }
                  : r
              ),
            }))
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

      getRemainingSeats: (routeId, totalSeats) => {
        const confirmed = get().getConfirmedByRoute(routeId)
        return Math.max(0, totalSeats - confirmed.length)
      },
    }),
    { name: 'shuttle-reservations' }
  )
)
