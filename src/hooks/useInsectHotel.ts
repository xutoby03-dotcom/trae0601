import { useEffect } from 'react'
import { useHotelStore } from '../store/useHotelStore'
import type { Cell, Observation } from '../types'

export function useInsectHotel() {
  const {
    cells,
    observations,
    selectedCellId,
    isLoading,
    init,
    addCell,
    updateCell,
    deleteCell,
    addObservation,
    selectCell,
    getCellObservations,
    getStatusStats,
    getMaterialAlerts,
    getTrendData,
    getMaterialStats,
  } = useHotelStore()

  useEffect(() => {
    init()
  }, [init])

  const selectedCell = cells.find((c) => c.id === selectedCellId) || null

  return {
    cells,
    observations,
    selectedCell,
    selectedCellId,
    isLoading,
    addCell,
    updateCell,
    deleteCell,
    addObservation,
    selectCell,
    getCellObservations,
    getStatusStats,
    getMaterialAlerts,
    getTrendData,
    getMaterialStats,
  }
}
