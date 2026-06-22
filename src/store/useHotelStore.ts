import { create } from 'zustand'
import type {
  Cell,
  Observation,
  MaterialAlert,
  TrendDataPoint,
  MaterialStat,
  CellMaterial,
  OccupancyStatus,
} from '../types'
import {
  MATERIAL_NAMES,
  STATUS_NAMES,
} from '../types'
import {
  loadCells,
  saveCells,
  loadObservations,
  saveObservations,
  isInitialized,
  markInitialized,
} from '../utils/storage'
import { generateMockCells, generateMockObservations, generateMaterialSuggestion } from '../utils/mockData'
import { getToday, daysAgo, getDateRange, getDateDaysAgo } from '../utils/dateUtils'

interface HotelState {
  cells: Cell[]
  observations: Observation[]
  selectedCellId: string | null
  isLoading: boolean

  init: () => void
  addCell: (cell: Omit<Cell, 'id' | 'status' | 'registeredAt' | 'lastObservedAt'>) => void
  updateCell: (id: string, updates: Partial<Cell>) => void
  deleteCell: (id: string) => void
  addObservation: (observation: Omit<Observation, 'id'>) => void
  selectCell: (id: string | null) => void

  getCellObservations: (cellId: string) => Observation[]
  getStatusStats: () => { occupied: number; underObservation: number; empty: number }
  getMaterialAlerts: () => MaterialAlert[]
  getTrendData: () => TrendDataPoint[]
  getMaterialStats: () => MaterialStat[]
  updateCellStatus: (cellId: string) => void
}

function determineStatus(observations: Observation[]): OccupancyStatus {
  if (observations.length === 0) return 'empty'

  const sorted = [...observations].sort(
    (a, b) => new Date(b.observationDate).getTime() - new Date(a.observationDate).getTime()
  )

  const recentObservations = sorted.slice(0, 7)
  const hasAnySign = recentObservations.some(
    (obs) => obs.hasSeal || obs.hasBiteMarks || obs.hasEmergenceHole || obs.visitorTypes.length > 0
  )

  if (!hasAnySign) return 'empty'

  const hasEmergenceHole = recentObservations.some((obs) => obs.hasEmergenceHole)
  const hasVisitor3Days = recentObservations.slice(0, 3).every((obs) => obs.visitorTypes.length > 0)

  if (hasEmergenceHole || hasVisitor3Days) return 'occupied'

  return 'underObservation'
}

export const useHotelStore = create<HotelState>((set, get) => ({
  cells: [],
  observations: [],
  selectedCellId: null,
  isLoading: true,

  init: () => {
    let cells: Cell[]
    let observations: Observation[]

    if (isInitialized()) {
      cells = loadCells<Cell[]>([])
      observations = loadObservations<Observation[]>([])
    } else {
      cells = generateMockCells()
      observations = generateMockObservations(cells)

      cells = cells.map((cell) => ({
        ...cell,
        status: determineStatus(observations.filter((o) => o.cellId === cell.id)),
      }))

      saveCells(cells)
      saveObservations(observations)
      markInitialized()
    }

    set({ cells, observations, isLoading: false })
  },

  addCell: (cellData) => {
    const newCell: Cell = {
      ...cellData,
      id: Math.random().toString(36).substring(2, 11),
      status: 'empty',
      registeredAt: getToday(),
      lastObservedAt: null,
    }

    const newCells = [...get().cells, newCell]
    set({ cells: newCells })
    saveCells(newCells)
  },

  updateCell: (id, updates) => {
    const newCells = get().cells.map((cell) =>
      cell.id === id ? { ...cell, ...updates } : cell
    )
    set({ cells: newCells })
    saveCells(newCells)
  },

  deleteCell: (id) => {
    const newCells = get().cells.filter((cell) => cell.id !== id)
    const newObservations = get().observations.filter((obs) => obs.cellId !== id)
    set({ cells: newCells, observations: newObservations })
    saveCells(newCells)
    saveObservations(newObservations)
  },

  addObservation: (obsData) => {
    const newObs: Observation = {
      ...obsData,
      id: Math.random().toString(36).substring(2, 11),
    }

    const newObservations = [newObs, ...get().observations]
    set({ observations: newObservations })
    saveObservations(newObservations)

    const { updateCellStatus } = get()
    updateCellStatus(obsData.cellId)

    const { updateCell } = get()
    updateCell(obsData.cellId, { lastObservedAt: obsData.observationDate })
  },

  selectCell: (id) => {
    set({ selectedCellId: id })
  },

  getCellObservations: (cellId) => {
    return get()
      .observations.filter((obs) => obs.cellId === cellId)
      .sort((a, b) => new Date(b.observationDate).getTime() - new Date(a.observationDate).getTime())
  },

  getStatusStats: () => {
    const { cells } = get()
    return {
      occupied: cells.filter((c) => c.status === 'occupied').length,
      underObservation: cells.filter((c) => c.status === 'underObservation').length,
      empty: cells.filter((c) => c.status === 'empty').length,
    }
  },

  getMaterialAlerts: () => {
    const { cells, observations } = get()
    const today = getToday()
    const alerts: Map<CellMaterial, { cellIds: string[]; lastObserved: string }> = new Map()

    cells.forEach((cell) => {
      const cellObs = observations.filter((obs) => obs.cellId === cell.id)
      const lastObservation = cellObs.sort(
        (a, b) => new Date(b.observationDate).getTime() - new Date(a.observationDate).getTime()
      )[0]

      const lastObservedDate = lastObservation?.observationDate || cell.registeredAt
      const hasRecentActivity = lastObservation && (
        lastObservation.hasSeal ||
        lastObservation.hasBiteMarks ||
        lastObservation.hasEmergenceHole ||
        lastObservation.visitorTypes.length > 0
      )

      const daysUnused = daysAgo(lastObservedDate)

      if (!hasRecentActivity && daysUnused >= 14 && cell.status === 'empty') {
        const existing = alerts.get(cell.material)
        if (existing) {
          existing.cellIds.push(cell.id)
          if (new Date(lastObservedDate) < new Date(existing.lastObserved)) {
            existing.lastObserved = lastObservedDate
          }
        } else {
          alerts.set(cell.material, {
            cellIds: [cell.id],
            lastObserved: lastObservedDate,
          })
        }
      }
    })

    const result: MaterialAlert[] = []
    alerts.forEach((data, material) => {
      result.push({
        material,
        materialName: MATERIAL_NAMES[material],
        unusedDays: daysAgo(data.lastObserved),
        cellCount: data.cellIds.length,
        suggestion: generateMaterialSuggestion(material),
      })
    })

    return result.sort((a, b) => b.unusedDays - a.unusedDays)
  },

  getTrendData: () => {
    const { cells, observations } = get()
    const startDate = getDateDaysAgo(29)
    const endDate = getToday()
    const dates = getDateRange(startDate, endDate)

    return dates.map((date) => {
      let occupied = 0
      let underObservation = 0
      let empty = 0

      cells.forEach((cell) => {
        const cellObs = observations
          .filter((obs) => obs.cellId === cell.id && obs.observationDate <= date)
          .sort((a, b) => new Date(b.observationDate).getTime() - new Date(a.observationDate).getTime())

        const status = determineStatus(cellObs)
        if (status === 'occupied') occupied++
        else if (status === 'underObservation') underObservation++
        else empty++
      })

      return { date, occupied, underObservation, empty }
    })
  },

  getMaterialStats: () => {
    const { cells } = get()
    const materialMap = new Map<CellMaterial, { total: number; occupied: number }>()

    cells.forEach((cell) => {
      const existing = materialMap.get(cell.material) || { total: 0, occupied: 0 }
      existing.total++
      if (cell.status === 'occupied') existing.occupied++
      materialMap.set(cell.material, existing)
    })

    const result: MaterialStat[] = []
    materialMap.forEach((data, material) => {
      result.push({
        material,
        materialName: MATERIAL_NAMES[material],
        totalCells: data.total,
        occupiedCells: data.occupied,
        occupancyRate: data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0,
      })
    })

    return result.sort((a, b) => b.occupancyRate - a.occupancyRate)
  },

  updateCellStatus: (cellId) => {
    const { observations, updateCell } = get()
    const cellObs = observations.filter((obs) => obs.cellId === cellId)
    const newStatus = determineStatus(cellObs)
    updateCell(cellId, { status: newStatus })
  },
}))
