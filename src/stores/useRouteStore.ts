import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShuttleRoute, Stop } from '@/types'
import { mockRoutes } from '@/utils/mockData'

interface RouteStore {
  routes: ShuttleRoute[]
  addRoute: (route: Omit<ShuttleRoute, 'id'>) => string
  updateRoute: (id: string, data: Partial<ShuttleRoute>) => void
  deleteRoute: (id: string) => void
  addStop: (routeId: string, stop: Omit<Stop, 'id'>) => void
  removeStop: (routeId: string, stopId: string) => void
  toggleDelay: (routeId: string) => void
  getRouteById: (id: string) => ShuttleRoute | undefined
  getTodayRoutes: (date: string) => ShuttleRoute[]
}

let routeCounter = 10

export const useRouteStore = create<RouteStore>()(
  persist(
    (set, get) => ({
      routes: mockRoutes,

      addRoute: (routeData) => {
        const id = `r${++routeCounter}_${Date.now()}`
        const route: ShuttleRoute = { ...routeData, id, isDelayed: false }
        set((s) => ({ routes: [...s.routes, route] }))
        return id
      },

      updateRoute: (id, data) => {
        set((s) => ({
          routes: s.routes.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }))
      },

      deleteRoute: (id) => {
        set((s) => ({ routes: s.routes.filter((r) => r.id !== id) }))
      },

      addStop: (routeId, stopData) => {
        const stop: Stop = { ...stopData, id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }
        set((s) => ({
          routes: s.routes.map((r) =>
            r.id === routeId ? { ...r, stops: [...r.stops, stop] } : r
          ),
        }))
      },

      removeStop: (routeId, stopId) => {
        set((s) => ({
          routes: s.routes.map((r) =>
            r.id === routeId
              ? { ...r, stops: r.stops.filter((st) => st.id !== stopId) }
              : r
          ),
        }))
      },

      toggleDelay: (routeId) => {
        set((s) => ({
          routes: s.routes.map((r) =>
            r.id === routeId ? { ...r, isDelayed: !r.isDelayed } : r
          ),
        }))
      },

      getRouteById: (id) => get().routes.find((r) => r.id === id),

      getTodayRoutes: (date) => get().routes.filter((r) => r.date === date),
    }),
    { name: 'shuttle-routes' }
  )
)
