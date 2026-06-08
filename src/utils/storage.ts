import { Plant, GrowthRecord, CareTask, PlantStatus, LightPreference } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { differenceInDays, isAfter, isBefore, parseISO, addDays } from 'date-fns'

const PLANTS_KEY = 'plantcare_plants'
const GROWTH_KEY = 'plantcare_growth'
const TASKS_KEY = 'plantcare_tasks'

export function loadPlants(): Plant[] {
  const data = localStorage.getItem(PLANTS_KEY)
  return data ? JSON.parse(data) : []
}

export function savePlants(plants: Plant[]): void {
  localStorage.setItem(PLANTS_KEY, JSON.stringify(plants))
}

export function loadGrowthRecords(): GrowthRecord[] {
  const data = localStorage.getItem(GROWTH_KEY)
  return data ? JSON.parse(data) : []
}

export function saveGrowthRecords(records: GrowthRecord[]): void {
  localStorage.setItem(GROWTH_KEY, JSON.stringify(records))
}

export function loadCareTasks(): CareTask[] {
  const data = localStorage.getItem(TASKS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveCareTasks(tasks: CareTask[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

export function createPlant(data: Omit<Plant, 'id' | 'createdAt' | 'lastWateredDate' | 'lastFertilizedDate'>): Plant {
  const plant: Plant = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    lastWateredDate: new Date().toISOString(),
    lastFertilizedDate: new Date().toISOString(),
  }
  const plants = loadPlants()
  plants.push(plant)
  savePlants(plants)
  generateTasksForPlant(plant)
  return plant
}

export function updatePlant(id: string, data: Partial<Plant>): Plant | null {
  const plants = loadPlants()
  const index = plants.findIndex(p => p.id === id)
  if (index === -1) return null
  plants[index] = { ...plants[index], ...data }
  savePlants(plants)
  return plants[index]
}

export function deletePlant(id: string): void {
  const plants = loadPlants().filter(p => p.id !== id)
  savePlants(plants)
  const tasks = loadCareTasks().filter(t => t.plantId !== id)
  saveCareTasks(tasks)
  const records = loadGrowthRecords().filter(r => r.plantId !== id)
  saveGrowthRecords(records)
}

export function addGrowthRecord(plantId: string, photo: string, note: string): GrowthRecord {
  const record: GrowthRecord = {
    id: uuidv4(),
    plantId,
    date: new Date().toISOString(),
    photo,
    note,
  }
  const records = loadGrowthRecords()
  records.push(record)
  saveGrowthRecords(records)
  return record
}

export function deleteGrowthRecord(recordId: string): void {
  const records = loadGrowthRecords().filter(r => r.id !== recordId)
  saveGrowthRecords(records)
}

export function generateTasksForPlant(plant: Plant): void {
  const tasks = loadCareTasks()
  const today = new Date()

  const lastWatered = parseISO(plant.lastWateredDate)
  const nextWaterDate = addDays(lastWatered, plant.waterCycleDays)

  const lastFertilized = parseISO(plant.lastFertilizedDate)
  const nextFertilizeDate = addDays(lastFertilized, plant.fertilizeCycleDays)

  const existingWaterTask = tasks.find(
    t => t.plantId === plant.id && t.type === 'water' && !t.completed
  )
  if (!existingWaterTask) {
    tasks.push({
      id: uuidv4(),
      plantId: plant.id,
      plantName: plant.name,
      plantPhoto: plant.photo,
      type: 'water',
      scheduledDate: nextWaterDate.toISOString(),
      completedDate: null,
      completed: false,
    })
  }

  const existingFertilizeTask = tasks.find(
    t => t.plantId === plant.id && t.type === 'fertilize' && !t.completed
  )
  if (!existingFertilizeTask) {
    tasks.push({
      id: uuidv4(),
      plantId: plant.id,
      plantName: plant.name,
      plantPhoto: plant.photo,
      type: 'fertilize',
      scheduledDate: nextFertilizeDate.toISOString(),
      completedDate: null,
      completed: false,
    })
  }

  if (plant.repotDate) {
    const repotDate = parseISO(plant.repotDate)
    if (isAfter(repotDate, today)) {
      const existingRepotTask = tasks.find(
        t => t.plantId === plant.id && t.type === 'repot' && !t.completed
      )
      if (!existingRepotTask) {
        tasks.push({
          id: uuidv4(),
          plantId: plant.id,
          plantName: plant.name,
          plantPhoto: plant.photo,
          type: 'repot',
          scheduledDate: repotDate.toISOString(),
          completedDate: null,
          completed: false,
        })
      }
    }
  }

  saveCareTasks(tasks)
}

export function completeTask(taskId: string): void {
  const tasks = loadCareTasks()
  const task = tasks.find(t => t.id === taskId)
  if (!task) return

  task.completed = true
  task.completedDate = new Date().toISOString()
  saveCareTasks(tasks)

  if (task.type === 'water') {
    updatePlant(task.plantId, { lastWateredDate: new Date().toISOString() })
    const plant = loadPlants().find(p => p.id === task.plantId)
    if (plant) {
      const tasks2 = loadCareTasks()
      tasks2.push({
        id: uuidv4(),
        plantId: plant.id,
        plantName: plant.name,
        plantPhoto: plant.photo,
        type: 'water',
        scheduledDate: addDays(new Date(), plant.waterCycleDays).toISOString(),
        completedDate: null,
        completed: false,
      })
      saveCareTasks(tasks2)
    }
  }

  if (task.type === 'fertilize') {
    updatePlant(task.plantId, { lastFertilizedDate: new Date().toISOString() })
    const plant = loadPlants().find(p => p.id === task.plantId)
    if (plant) {
      const tasks2 = loadCareTasks()
      tasks2.push({
        id: uuidv4(),
        plantId: plant.id,
        plantName: plant.name,
        plantPhoto: plant.photo,
        type: 'fertilize',
        scheduledDate: addDays(new Date(), plant.fertilizeCycleDays).toISOString(),
        completedDate: null,
        completed: false,
      })
      saveCareTasks(tasks2)
    }
  }
}

export function getPlantStatus(plant: Plant): PlantStatus[] {
  const statuses: PlantStatus[] = []
  const today = new Date()

  const lastWatered = parseISO(plant.lastWateredDate)
  const daysSinceWater = differenceInDays(today, lastWatered)
  if (daysSinceWater >= plant.waterCycleDays) {
    statuses.push('needs_water')
  }

  const lastFertilized = parseISO(plant.lastFertilizedDate)
  const daysSinceFertilize = differenceInDays(today, lastFertilized)
  if (daysSinceFertilize >= plant.fertilizeCycleDays) {
    statuses.push('needs_fertilizer')
  }

  if (plant.repotDate) {
    const repotDate = parseISO(plant.repotDate)
    if (differenceInDays(repotDate, today) <= 3 && !isBefore(repotDate, today)) {
      statuses.push('needs_repot')
    }
  }

  if (statuses.length === 0) {
    statuses.push('healthy')
  }

  return statuses
}

const LOCATION_LIGHT_MAP: Record<string, LightPreference> = {
  '南阳台': 'full_sun',
  '东阳台': 'bright_indirect',
  '西阳台': 'bright_indirect',
  '北阳台': 'low_light',
  '卫生间': 'low_light',
  '客厅': 'medium_indirect',
  '卧室': 'medium_indirect',
  '书房': 'low_light',
}

export function checkLightMismatch(plant: Plant): boolean {
  const locationLight = LOCATION_LIGHT_MAP[plant.location]
  if (!locationLight) return false

  const lightLevels: LightPreference[] = ['low_light', 'medium_indirect', 'bright_indirect', 'full_sun']
  const plantIndex = lightLevels.indexOf(plant.lightPreference)
  const locationIndex = lightLevels.indexOf(locationLight)

  return locationIndex < plantIndex
}

export function exportAllData(): string {
  const data = {
    plants: loadPlants(),
    growthRecords: loadGrowthRecords(),
    careTasks: loadCareTasks(),
    exportDate: new Date().toISOString(),
    version: '1.0',
  }
  return JSON.stringify(data, null, 2)
}

export function importAllData(json: string): boolean {
  try {
    const data = JSON.parse(json)
    if (data.plants) savePlants(data.plants)
    if (data.growthRecords) saveGrowthRecords(data.growthRecords)
    if (data.careTasks) saveCareTasks(data.careTasks)
    return true
  } catch {
    return false
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
