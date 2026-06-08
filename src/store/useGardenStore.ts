import { create } from 'zustand'
import type { Plant, Observation, Harvest } from '@/types'
import { generateId } from '@/types'

interface GardenState {
  plants: Plant[]
  observations: Observation[]
  harvests: Harvest[]

  addPlant: (plant: Omit<Plant, 'id' | 'createdAt'>) => Plant
  updatePlant: (id: string, updates: Partial<Plant>) => void
  deletePlant: (id: string) => void
  getPlant: (id: string) => Plant | undefined

  addObservation: (obs: Omit<Observation, 'id' | 'createdAt'>) => Observation
  deleteObservation: (id: string) => void
  getObservationsByPlant: (plantId: string) => Observation[]

  addHarvest: (harvest: Omit<Harvest, 'id' | 'createdAt'>) => Harvest
  deleteHarvest: (id: string) => void
  getHarvestsByPlant: (plantId: string) => Harvest[]

  waterPlant: (id: string) => void
}

const STORAGE_KEY_PLANTS = 'garden-plants'
const STORAGE_KEY_OBS = 'garden-observations'
const STORAGE_KEY_HARVESTS = 'garden-harvests'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save to localStorage', e)
  }
}

export const useGardenStore = create<GardenState>((set, get) => ({
  plants: loadFromStorage<Plant[]>(STORAGE_KEY_PLANTS, []),
  observations: loadFromStorage<Observation[]>(STORAGE_KEY_OBS, []),
  harvests: loadFromStorage<Harvest[]>(STORAGE_KEY_HARVESTS, []),

  addPlant: (plantData) => {
    const plant: Plant = {
      ...plantData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    set((state) => {
      const plants = [...state.plants, plant]
      saveToStorage(STORAGE_KEY_PLANTS, plants)
      return { plants }
    })
    return plant
  },

  updatePlant: (id, updates) => {
    set((state) => {
      const plants = state.plants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )
      saveToStorage(STORAGE_KEY_PLANTS, plants)
      return { plants }
    })
  },

  deletePlant: (id) => {
    set((state) => {
      const plants = state.plants.filter((p) => p.id !== id)
      const observations = state.observations.filter((o) => o.plantId !== id)
      const harvests = state.harvests.filter((h) => h.plantId !== id)
      saveToStorage(STORAGE_KEY_PLANTS, plants)
      saveToStorage(STORAGE_KEY_OBS, observations)
      saveToStorage(STORAGE_KEY_HARVESTS, harvests)
      return { plants, observations, harvests }
    })
  },

  getPlant: (id) => {
    return get().plants.find((p) => p.id === id)
  },

  addObservation: (obsData) => {
    const observation: Observation = {
      ...obsData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    set((state) => {
      const observations = [...state.observations, observation]
      saveToStorage(STORAGE_KEY_OBS, observations)
      return { observations }
    })
    return observation
  },

  deleteObservation: (id) => {
    set((state) => {
      const observations = state.observations.filter((o) => o.id !== id)
      saveToStorage(STORAGE_KEY_OBS, observations)
      return { observations }
    })
  },

  getObservationsByPlant: (plantId) => {
    return get()
      .observations.filter((o) => o.plantId === plantId)
      .sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime())
  },

  addHarvest: (harvestData) => {
    const harvest: Harvest = {
      ...harvestData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    set((state) => {
      const harvests = [...state.harvests, harvest]
      saveToStorage(STORAGE_KEY_HARVESTS, harvests)
      return { harvests }
    })
    return harvest
  },

  deleteHarvest: (id) => {
    set((state) => {
      const harvests = state.harvests.filter((h) => h.id !== id)
      saveToStorage(STORAGE_KEY_HARVESTS, harvests)
      return { harvests }
    })
  },

  getHarvestsByPlant: (plantId) => {
    return get()
      .harvests.filter((h) => h.plantId === plantId)
      .sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime())
  },

  waterPlant: (id) => {
    set((state) => {
      const plants = state.plants.map((p) =>
        p.id === id ? { ...p, lastWatered: new Date().toISOString() } : p
      )
      saveToStorage(STORAGE_KEY_PLANTS, plants)
      return { plants }
    })
  },
}))
