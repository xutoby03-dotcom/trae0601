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
  getLastActivityDate: (cellId: string) => string
  getCellUnusedDays: (cellId: string) => number
  getStatusStats: () => { occupied: number; underObservation: number; empty: number }
  getMaterialAlerts: () => MaterialAlert[]
  getMaterialsByUnusedDays: () => Array<{
    material: CellMaterial
    materialName: string
    totalCells: number
    emptyCells: number
    maxUnusedDays: number
    avgUnusedDays: number
  }>
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

    const hasActivity =
      obsData.hasSeal ||
      obsData.hasBiteMarks ||
      obsData.hasEmergenceHole ||
      obsData.visitorTypes.length > 0

    const newObservations = [newObs, ...get().observations]
    set({ observations: newObservations })
    saveObservations(newObservations)

    const { updateCellStatus, updateCell } = get()
    updateCellStatus(obsData.cellId)

    if (hasActivity) {
      updateCell(obsData.cellId, { lastObservedAt: obsData.observationDate })
    }
  },

  selectCell: (id) => {
    set({ selectedCellId: id })
  },

  getCellObservations: (cellId) => {
    return get()
      .observations.filter((obs) => obs.cellId === cellId)
      .sort((a, b) => new Date(b.observationDate).getTime() - new Date(a.observationDate).getTime())
  },

  getLastActivityDate: (cellId) => {
    const { observations, cells } = get()
    const cell = cells.find((c) => c.id === cellId)
    if (!cell) return ''

    const sortedObs = observations
      .filter((obs) => obs.cellId === cellId)
      .sort((a, b) => new Date(b.observationDate).getTime() - new Date(a.observationDate).getTime())

    const lastActivity = sortedObs.find(
      (obs) =>
        obs.hasSeal ||
        obs.hasBiteMarks ||
        obs.hasEmergenceHole ||
        obs.visitorTypes.length > 0
    )

    return lastActivity ? lastActivity.observationDate : cell.registeredAt
  },

  getCellUnusedDays: (cellId) => {
    const lastActivityDate = get().getLastActivityDate(cellId)
    if (!lastActivityDate) return 0
    return daysAgo(lastActivityDate)
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
    const { cells, getLastActivityDate, getCellUnusedDays } = get()
    const alerts: Map<CellMaterial, { cellIds: string[]; oldestActivityDate: string }> = new Map()

    cells.forEach((cell) => {
      if (cell.status !== 'empty') return

      const daysUnused = getCellUnusedDays(cell.id)
      if (daysUnused < 14) return

      const lastActivityDate = getLastActivityDate(cell.id)

      const existing = alerts.get(cell.material)
      if (existing) {
        existing.cellIds.push(cell.id)
        if (new Date(lastActivityDate) < new Date(existing.oldestActivityDate)) {
          existing.oldestActivityDate = lastActivityDate
        }
      } else {
        alerts.set(cell.material, {
          cellIds: [cell.id],
          oldestActivityDate: lastActivityDate,
        })
      }
    })

    const result: MaterialAlert[] = []
    alerts.forEach((data, material) => {
      result.push({
        material,
        materialName: MATERIAL_NAMES[material],
        unusedDays: daysAgo(data.oldestActivityDate),
        cellCount: data.cellIds.length,
        suggestion: generateMaterialSuggestion(material),
      })
    })

    return result.sort((a, b) => b.unusedDays - a.unusedDays)
  },

  getMaterialsByUnusedDays: () => {
    const { cells, getCellUnusedDays } = get()
    const materialMap = new Map<CellMaterial, {
      total: number
      empty: number
      totalUnusedDays: number
      maxUnusedDays: number
      count: number
    }>()

    cells.forEach((cell) => {
      const unusedDays = getCellUnusedDays(cell.id)
      const existing = materialMap.get(cell.material) || {
        total: 0,
        empty: 0,
        totalUnusedDays: 0,
        maxUnusedDays: 0,
        count: 0,
      }

      existing.total++
      existing.count++
      existing.totalUnusedDays += unusedDays
      if (unusedDays > existing.maxUnusedDays) {
        existing.maxUnusedDays = unusedDays
      }
      if (cell.status === 'empty') {
        existing.empty++
      }

      materialMap.set(cell.material, existing)
    })

    const result = Array.from(materialMap.entries()).map(([material, data]) => ({
      material,
      materialName: MATERIAL_NAMES[material],
      totalCells: data.total,
      emptyCells: data.empty,
      maxUnusedDays: data.maxUnusedDays,
      avgUnusedDays: data.count > 0 ? Math.round(data.totalUnusedDays / data.count) : 0,
    }))

    return result.sort((a, b) => b.maxUnusedDays - a.maxUnusedDays)
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
