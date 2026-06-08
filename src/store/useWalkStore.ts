import { create } from 'zustand'
import type { Place, WalkRoute, RouteStats } from '@/types'
import { places as allPlaces } from '@/data/places'
import { moodModes } from '@/data/moods'

interface WalkStore {
  places: Place[]
  routePlaces: Place[]
  selectedPlaceId: string | null
  activeMoodId: string | null
  savedRoutes: WalkRoute[]
  routeName: string
  startTime: string

  setRouteName: (name: string) => void
  setStartTime: (time: string) => void
  addToRoute: (placeId: string) => void
  removeFromRoute: (placeId: string) => void
  reorderRoute: (oldIndex: number, newIndex: number) => void
  setSelectedPlace: (placeId: string | null) => void
  activateMood: (moodId: string) => void
  clearMood: () => void
  clearRoute: () => void
  saveRoute: () => void
  loadRoute: (routeId: string) => void
  deleteRoute: (routeId: string) => void
  getStats: () => RouteStats
}

function loadSavedRoutes(): WalkRoute[] {
  try {
    const data = localStorage.getItem('walk-routes')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function persistRoutes(routes: WalkRoute[]) {
  localStorage.setItem('walk-routes', JSON.stringify(routes))
}

function computeStats(routePlaces: Place[], startTime: string): RouteStats {
  let totalMinutes = 0
  let totalDistance = 0
  let totalBudget = 0
  const warnings: string[] = []

  let currentTime = parseTime(startTime)

  for (let i = 0; i < routePlaces.length; i++) {
    const place = routePlaces[i]

    if (i > 0) {
      const walkMinutes = Math.round(place.walkDistance * 15)
      totalMinutes += walkMinutes
      totalDistance += place.walkDistance
      currentTime += walkMinutes
    }

    totalMinutes += place.stayMinutes
    totalBudget += place.budget
    currentTime += place.stayMinutes

    const arrivalTime = currentTime - place.stayMinutes
    const departureTime = currentTime

    const openMinutes = parseTime(place.openTime)
    const closeMinutes = parseTime(place.closeTime)

    if (arrivalTime < openMinutes) {
      warnings.push(`${place.name} 还没开门（${place.openTime} 才开）`)
    }

    let effectiveClose = closeMinutes
    if (closeMinutes < openMinutes) {
      effectiveClose = closeMinutes + 24 * 60
    }

    if (departureTime > effectiveClose) {
      warnings.push(`${place.name} 会在 ${place.closeTime} 关门，可能赶不上`)
    }
  }

  return { totalMinutes, totalDistance, totalBudget, warnings }
}

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export const useWalkStore = create<WalkStore>((set, get) => ({
  places: allPlaces,
  routePlaces: [],
  selectedPlaceId: null,
  activeMoodId: null,
  savedRoutes: loadSavedRoutes(),
  routeName: '',
  startTime: '10:00',

  setRouteName: (name) => set({ routeName: name }),
  setStartTime: (time) => set({ startTime: time }),

  addToRoute: (placeId) => {
    const { places, routePlaces } = get()
    const place = places.find((p) => p.id === placeId)
    if (place && !routePlaces.find((p) => p.id === placeId)) {
      set({ routePlaces: [...routePlaces, place] })
    }
  },

  removeFromRoute: (placeId) => {
    const { routePlaces } = get()
    set({ routePlaces: routePlaces.filter((p) => p.id !== placeId) })
  },

  reorderRoute: (oldIndex, newIndex) => {
    const { routePlaces } = get()
    const updated = [...routePlaces]
    const [moved] = updated.splice(oldIndex, 1)
    updated.splice(newIndex, 0, moved)
    set({ routePlaces: updated })
  },

  setSelectedPlace: (placeId) => set({ selectedPlaceId: placeId }),

  activateMood: (moodId) => {
    const { places, activeMoodId } = get()
    if (activeMoodId === moodId) {
      set({ activeMoodId: null })
      return
    }
    const mood = moodModes.find((m) => m.id === moodId)
    if (!mood) return

    const recommended = places.filter((p) =>
      mood.tagFilters.some((tag) => p.tags.includes(tag))
    )

    const shuffled = [...recommended].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(5, shuffled.length))

    set({ activeMoodId: moodId, routePlaces: selected })
  },

  clearMood: () => set({ activeMoodId: null }),

  clearRoute: () => set({ routePlaces: [], activeMoodId: null }),

  saveRoute: () => {
    const { routePlaces, routeName, savedRoutes } = get()
    if (routePlaces.length === 0) return

    const name = routeName.trim() || `散步路线 ${savedRoutes.length + 1}`
    const newRoute: WalkRoute = {
      id: `route-${Date.now()}`,
      name,
      placeIds: routePlaces.map((p) => p.id),
      createdAt: new Date().toLocaleString('zh-CN'),
    }

    const updated = [...savedRoutes, newRoute]
    persistRoutes(updated)
    set({ savedRoutes: updated, routeName: '' })
  },

  loadRoute: (routeId) => {
    const { savedRoutes, places } = get()
    const route = savedRoutes.find((r) => r.id === routeId)
    if (!route) return

    const routePlaces = route.placeIds
      .map((id) => places.find((p) => p.id === id))
      .filter((p): p is Place => p !== undefined)

    set({ routePlaces, activeMoodId: null, routeName: route.name })
  },

  deleteRoute: (routeId) => {
    const { savedRoutes } = get()
    const updated = savedRoutes.filter((r) => r.id !== routeId)
    persistRoutes(updated)
    set({ savedRoutes: updated })
  },

  getStats: () => {
    const { routePlaces, startTime } = get()
    return computeStats(routePlaces, startTime)
  },
}))
