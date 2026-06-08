import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Gear } from '@/types'

interface GearStore {
  gears: Gear[]
  addGear: (gear: Gear) => void
  updateGear: (id: string, gear: Partial<Gear>) => void
  deleteGear: (id: string) => void
  getGearById: (id: string) => Gear | undefined
}

export const useGearStore = create<GearStore>()(
  persist(
    (set, get) => ({
      gears: [],
      addGear: (gear) =>
        set((state) => ({ gears: [...state.gears, gear] })),
      updateGear: (id, updates) =>
        set((state) => ({
          gears: state.gears.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),
      deleteGear: (id) =>
        set((state) => ({
          gears: state.gears.filter((g) => g.id !== id),
        })),
      getGearById: (id) => get().gears.find((g) => g.id === id),
    }),
    { name: 'gearcare-gears' }
  )
)
