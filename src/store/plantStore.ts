import { create } from 'zustand'
import { format, differenceInDays, parseISO, isWithinInterval } from 'date-fns'
import type { Plant, Adoption, ObservationLog, PlantAlert, PlantStatus } from '@/types'
import { MOCK_PLANTS, MOCK_ADOPTIONS, MOCK_OBSERVATIONS, MOCK_ALERTS } from '@/data/mockData'

export function getActiveAdoption(adoptions: Adoption[], plantId: string): Adoption | undefined {
  const plantAdoptions = adoptions.filter((a) => a.plantId === plantId)
  const today = new Date()
  const activeTemp = plantAdoptions.find((a) => {
    if (!a.isTemporary || !a.endDate) return false
    try {
      return isWithinInterval(today, { start: parseISO(a.startDate), end: parseISO(a.endDate) })
    } catch {
      return false
    }
  })
  if (activeTemp) return activeTemp
  return plantAdoptions.find((a) => !a.isTemporary && !a.endDate)
}

export function getOriginalAdoption(adoptions: Adoption[], plantId: string): Adoption | undefined {
  return adoptions.find((a) => a.plantId === plantId && !a.isTemporary && !a.endDate)
}

export function isActiveAdoptionForUser(adoptions: Adoption[], userId: string, a: Adoption): boolean {
  if (a.userId !== userId) return false
  if (!a.isTemporary && !a.endDate) return true
  if (a.isTemporary && a.endDate) {
    try {
      return isWithinInterval(new Date(), { start: parseISO(a.startDate), end: parseISO(a.endDate) })
    } catch {
      return false
    }
  }
  return false
}

export function hasActiveAdoption(adoptions: Adoption[], plantId: string): boolean {
  return getActiveAdoption(adoptions, plantId) !== undefined
}

interface PlantStore {
  plants: Plant[]
  adoptions: Adoption[]
  observations: ObservationLog[]
  alerts: PlantAlert[]

  addPlant: (plant: Omit<Plant, 'id' | 'status' | 'createdAt' | 'lastWateredAt' | 'isDead'>) => void
  updatePlant: (id: string, updates: Partial<Plant>) => void
  deletePlant: (id: string) => void

  adoptPlant: (adoption: Omit<Adoption, 'id'>) => void
  removeAdoption: (id: string) => void
  requestTempCare: (adoption: Omit<Adoption, 'id'>) => void

  addObservation: (obs: Omit<ObservationLog, 'id'>) => void

  resolveAlert: (id: string) => void
  checkAlerts: () => void

  getPlantAdoption: (plantId: string) => Adoption | undefined
  getPlantObservations: (plantId: string) => ObservationLog[]
  getUnresolvedAlerts: () => PlantAlert[]
  getMyPlants: (userId: string) => Plant[]
  getOrphanPlants: () => Plant[]
}

export const usePlantStore = create<PlantStore>((set, get) => ({
  plants: MOCK_PLANTS,
  adoptions: MOCK_ADOPTIONS,
  observations: MOCK_OBSERVATIONS,
  alerts: MOCK_ALERTS,

  addPlant: (plantData) => {
    const newPlant: Plant = {
      ...plantData,
      id: `p${Date.now()}`,
      status: 'healthy',
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      lastWateredAt: format(new Date(), 'yyyy-MM-dd'),
      isDead: false,
    }
    set((state) => ({ plants: [...state.plants, newPlant] }))
  },

  updatePlant: (id, updates) => {
    set((state) => ({
      plants: state.plants.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }))
  },

  deletePlant: (id) => {
    set((state) => ({
      plants: state.plants.filter((p) => p.id !== id),
      adoptions: state.adoptions.filter((a) => a.plantId !== id),
      observations: state.observations.filter((o) => o.plantId !== id),
      alerts: state.alerts.filter((a) => a.plantId !== id),
    }))
  },

  adoptPlant: (adoptionData) => {
    const newAdoption: Adoption = {
      ...adoptionData,
      id: `a${Date.now()}`,
    }
    set((state) => ({ adoptions: [...state.adoptions, newAdoption] }))
  },

  removeAdoption: (id) => {
    set((state) => ({
      adoptions: state.adoptions.filter((a) => a.id !== id),
    }))
  },

  requestTempCare: (adoptionData) => {
    const newAdoption: Adoption = {
      ...adoptionData,
      id: `a${Date.now()}`,
      isTemporary: true,
    }
    set((state) => ({ adoptions: [...state.adoptions, newAdoption] }))
  },

  addObservation: (obsData) => {
    const newObs: ObservationLog = {
      ...obsData,
      id: `o${Date.now()}`,
    }

    set((state) => {
      const plant = state.plants.find((p) => p.id === obsData.plantId)
      let statusUpdate: Partial<Plant> = {}

      if (obsData.type === 'water' && plant) {
        statusUpdate = { lastWateredAt: obsData.date }
        if (plant.status === 'thirsty') {
          statusUpdate.status = 'healthy' as PlantStatus
        }

        const lastWateringObs = state.observations
          .filter((o) => o.plantId === obsData.plantId && o.type === 'water')
          .sort((a, b) => b.date.localeCompare(a.date))

        if (lastWateringObs.length > 0) {
          const daysSinceLastWater = differenceInDays(new Date(obsData.date), new Date(lastWateringObs[0].date))
          if (daysSinceLastWater < 1) {
            const existingOverwatering = state.alerts.find(
              (a) => a.plantId === obsData.plantId && a.type === 'overwatering' && !a.resolved
            )
            if (!existingOverwatering) {
              state = {
                ...state,
                alerts: [
                  ...state.alerts,
                  {
                    id: `al${Date.now()}`,
                    plantId: obsData.plantId,
                    plantName: plant.name,
                    type: 'overwatering',
                    message: `${plant.name}可能浇水过于频繁，建议减少浇水`,
                    createdAt: obsData.date,
                    resolved: false,
                  },
                ],
              }
            }
          }
        }
      }

      if (obsData.type === 'leafChange' && obsData.content.includes('黄')) {
        statusUpdate = { ...statusUpdate, status: 'yellowLeaf' }
      }

      if (obsData.type === 'pest') {
        statusUpdate = { ...statusUpdate, status: 'yellowLeaf' }
      }

      if (obsData.type === 'fertilize') {
        const plant2 = state.plants.find((p) => p.id === obsData.plantId)
        if (plant2?.status === 'needsNutrients') {
          statusUpdate = { ...statusUpdate, status: 'healthy' as PlantStatus }
        }
      }

      return {
        observations: [...state.observations, newObs],
        plants: state.plants.map((p) =>
          p.id === obsData.plantId ? { ...p, ...statusUpdate } : p
        ),
      }
    })
  },

  resolveAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)),
    }))
  },

  checkAlerts: () => {
    const today = new Date()
    const { plants, adoptions, alerts } = get()
    const newAlerts: PlantAlert[] = []

    plants.forEach((plant) => {
      if (plant.isDead) return

      const daysSinceWater = differenceInDays(today, new Date(plant.lastWateredAt))
      if (daysSinceWater > plant.wateringFrequencyDays + 3) {
        const existing = alerts.find(
          (a) => a.plantId === plant.id && a.type === 'neglected' && !a.resolved
        )
        if (!existing) {
          newAlerts.push({
            id: `al${Date.now()}_${plant.id}_neglected`,
            plantId: plant.id,
            plantName: plant.name,
            type: 'neglected',
            message: `${plant.name}已超过${daysSinceWater}天未浇水，急需关注！`,
            createdAt: format(today, 'yyyy-MM-dd'),
            resolved: false,
          })
        }
      }

      const active = getActiveAdoption(adoptions, plant.id)
      if (!active) {
        const existing = alerts.find(
          (a) => a.plantId === plant.id && a.type === 'neglected' && !a.resolved
        )
        if (!existing) {
          newAlerts.push({
            id: `al${Date.now()}_${plant.id}_no_adopt`,
            plantId: plant.id,
            plantName: plant.name,
            type: 'neglected',
            message: `${plant.name}当前无人负责，请考虑领养！`,
            createdAt: format(today, 'yyyy-MM-dd'),
            resolved: false,
          })
        }
      }
    })

    if (newAlerts.length > 0) {
      set((state) => ({ alerts: [...state.alerts, ...newAlerts] }))
    }
  },

  getPlantAdoption: (plantId) => {
    return getActiveAdoption(get().adoptions, plantId)
  },

  getPlantObservations: (plantId) => {
    return get()
      .observations.filter((o) => o.plantId === plantId)
      .sort((a, b) => b.date.localeCompare(a.date))
  },

  getUnresolvedAlerts: () => {
    return get().alerts.filter((a) => !a.resolved)
  },

  getMyPlants: (userId) => {
    const { adoptions, plants } = get()
    const myPlantIds = adoptions
      .filter((a) => isActiveAdoptionForUser(adoptions, userId, a))
      .map((a) => a.plantId)
    return plants.filter((p) => myPlantIds.includes(p.id))
  },

  getOrphanPlants: () => {
    const { adoptions, plants } = get()
    const adoptedIds = new Set(
      adoptions
        .filter((a) => hasActiveAdoption(adoptions, a.plantId))
        .map((a) => a.plantId)
    )
    return plants.filter((p) => !adoptedIds.has(p.id) && !p.isDead)
  },
}))
