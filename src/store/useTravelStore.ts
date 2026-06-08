import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Trip, Day, Photo, TagName, StoryStyle } from '@/types'

interface TravelState {
  trips: Trip[]
  days: Day[]
  photos: Photo[]
  currentTripId: string | null
  selectedStyle: StoryStyle

  setCurrentTripId: (id: string | null) => void
  setSelectedStyle: (style: StoryStyle) => void

  addTrip: (trip: Trip) => void
  updateTrip: (id: string, data: Partial<Trip>) => void
  deleteTrip: (id: string) => void

  addDay: (day: Day) => void
  updateDay: (id: string, data: Partial<Day>) => void
  deleteDay: (id: string) => void

  addPhoto: (photo: Photo) => void
  updatePhoto: (id: string, data: Partial<Photo>) => void
  deletePhoto: (id: string) => void
  togglePhotoTag: (photoId: string, tag: TagName) => void

  getTripDays: (tripId: string) => Day[]
  getDayPhotos: (dayId: string) => Photo[]
  getTripPhotos: (tripId: string) => Photo[]
  getTripTotalCost: (tripId: string) => number
  getDayCost: (dayId: string) => number
  getTagCost: (tripId: string, tag: TagName) => number
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set, get) => ({
      trips: [],
      days: [],
      photos: [],
      currentTripId: null,
      selectedStyle: '轻松',

      setCurrentTripId: (id) => set({ currentTripId: id }),
      setSelectedStyle: (style) => set({ selectedStyle: style }),

      addTrip: (trip) => set((s) => ({ trips: [...s.trips, trip] })),
      updateTrip: (id, data) =>
        set((s) => ({
          trips: s.trips.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),
      deleteTrip: (id) =>
        set((s) => {
          const dayIds = s.days.filter((d) => d.tripId === id).map((d) => d.id)
          return {
            trips: s.trips.filter((t) => t.id !== id),
            days: s.days.filter((d) => d.tripId !== id),
            photos: s.photos.filter((p) => !dayIds.includes(p.dayId)),
            currentTripId: s.currentTripId === id ? null : s.currentTripId,
          }
        }),

      addDay: (day) => set((s) => ({ days: [...s.days, day] })),
      updateDay: (id, data) =>
        set((s) => ({
          days: s.days.map((d) => (d.id === id ? { ...d, ...data } : d)),
        })),
      deleteDay: (id) =>
        set((s) => ({
          days: s.days.filter((d) => d.id !== id),
          photos: s.photos.filter((p) => p.dayId !== id),
        })),

      addPhoto: (photo) => set((s) => ({ photos: [...s.photos, photo] })),
      updatePhoto: (id, data) =>
        set((s) => ({
          photos: s.photos.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deletePhoto: (id) =>
        set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),

      togglePhotoTag: (photoId, tag) =>
        set((s) => ({
          photos: s.photos.map((p) => {
            if (p.id !== photoId) return p
            const tags = p.tags.includes(tag)
              ? p.tags.filter((t) => t !== tag)
              : [...p.tags, tag]
            return { ...p, tags }
          }),
        })),

      getTripDays: (tripId) => {
        const state = get()
        return state.days
          .filter((d) => d.tripId === tripId)
          .sort((a, b) => a.date.localeCompare(b.date))
      },

      getDayPhotos: (dayId) => {
        const state = get()
        return state.photos.filter((p) => p.dayId === dayId)
      },

      getTripPhotos: (tripId) => {
        const state = get()
        const dayIds = state.days
          .filter((d) => d.tripId === tripId)
          .map((d) => d.id)
        return state.photos.filter((p) => dayIds.includes(p.dayId))
      },

      getTripTotalCost: (tripId) => {
        const state = get()
        const dayIds = state.days
          .filter((d) => d.tripId === tripId)
          .map((d) => d.id)
        return state.photos
          .filter((p) => dayIds.includes(p.dayId))
          .reduce((sum, p) => sum + p.cost, 0)
      },

      getDayCost: (dayId) => {
        const state = get()
        return state.photos
          .filter((p) => p.dayId === dayId)
          .reduce((sum, p) => sum + p.cost, 0)
      },

      getTagCost: (tripId, tag) => {
        const state = get()
        const dayIds = state.days
          .filter((d) => d.tripId === tripId)
          .map((d) => d.id)
        return state.photos
          .filter((p) => dayIds.includes(p.dayId) && p.tags.includes(tag))
          .reduce((sum, p) => sum + p.cost, 0)
      },
    }),
    {
      name: 'travel-story-map-storage',
    }
  )
)
