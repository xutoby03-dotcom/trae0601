import { create } from 'zustand'
import type { Route } from '@/types'
import { mockRoutes } from '@/data/mockData'

interface RouteState {
  routes: Route[]
  getRoute: (id: string) => Route | undefined
}

export const useRouteStore = create<RouteState>((set, get) => ({
  routes: mockRoutes,
  getRoute: (id: string) => get().routes.find(r => r.id === id),
}))
