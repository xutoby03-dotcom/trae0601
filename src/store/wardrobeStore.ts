import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Clothing, OutfitRecord, WashStatus, IdleAction } from '@/types'

interface WardrobeState {
  clothing: Clothing[]
  outfitRecords: OutfitRecord[]

  addClothing: (item: Clothing) => void
  updateClothing: (id: string, updates: Partial<Clothing>) => void
  deleteClothing: (id: string) => void

  addOutfitRecord: (record: OutfitRecord) => void

  markWashStatus: (id: string, status: WashStatus) => void
  markIdleAction: (id: string, action: IdleAction) => void
}

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set) => ({
      clothing: [],
      outfitRecords: [],

      addClothing: (item) =>
        set((state) => ({ clothing: [...state.clothing, item] })),

      updateClothing: (id, updates) =>
        set((state) => ({
          clothing: state.clothing.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteClothing: (id) =>
        set((state) => ({
          clothing: state.clothing.filter((c) => c.id !== id),
        })),

      addOutfitRecord: (record) =>
        set((state) => {
          const updatedClothing = state.clothing.map((c) => {
            if (
              c.id === record.topId ||
              c.id === record.bottomId ||
              c.id === record.outerwearId ||
              c.id === record.shoesId
            ) {
              return { ...c, lastWornDate: record.date }
            }
            return c
          })
          return {
            outfitRecords: [...state.outfitRecords, record],
            clothing: updatedClothing,
          }
        }),

      markWashStatus: (id, status) =>
        set((state) => ({
          clothing: state.clothing.map((c) =>
            c.id === id ? { ...c, washStatus: status } : c
          ),
        })),

      markIdleAction: (id, action) =>
        set((state) => ({
          clothing: state.clothing.map((c) => {
            if (c.id !== id) return c
            switch (action) {
              case 'wash':
                return { ...c, washStatus: 'washing' as WashStatus }
              case 'store':
                return { ...c, lastWornDate: new Date().toISOString().slice(0, 10) }
              case 'discard':
                return null
              default:
                return c
            }
          }).filter(Boolean) as Clothing[],
        })),
    }),
    {
      name: 'wardrobe-storage',
    }
  )
)

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export function getDaysSince(dateStr: string, fallbackDate?: string): number {
  const target = dateStr || fallbackDate
  if (!target) return 0
  const then = new Date(target)
  const now = new Date()
  const diff = now.getTime() - then.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}
