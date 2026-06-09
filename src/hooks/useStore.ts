import { useState, useEffect, useCallback } from 'react'
import type { Vehicle, MaintenanceRecord, FaultRecord } from '../types'

const STORAGE_KEYS = {
  vehicles: 'car-ledger-vehicles',
  maintenance: 'car-ledger-maintenance',
  faults: 'car-ledger-faults',
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function useStore() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    loadFromStorage(STORAGE_KEYS.vehicles, [])
  )
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.maintenance, [])
  )
  const [faultRecords, setFaultRecords] = useState<FaultRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.faults, [])
  )

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.vehicles, vehicles)
  }, [vehicles])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.maintenance, maintenanceRecords)
  }, [maintenanceRecords])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.faults, faultRecords)
  }, [faultRecords])

  const addVehicle = useCallback((vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = { ...vehicle, id: crypto.randomUUID() }
    setVehicles(prev => [...prev, newVehicle])
  }, [])

  const updateVehicle = useCallback((id: string, data: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, ...data } : v)))
  }, [])

  const deleteVehicle = useCallback((id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id))
    setMaintenanceRecords(prev => prev.filter(r => r.vehicleId !== id))
    setFaultRecords(prev => prev.filter(f => f.vehicleId !== id))
  }, [])

  const addMaintenanceRecord = useCallback((record: Omit<MaintenanceRecord, 'id'>) => {
    const newRecord: MaintenanceRecord = { ...record, id: crypto.randomUUID() }
    setMaintenanceRecords(prev => [...prev, newRecord])
    const vehicle = vehicles.find(v => v.id === record.vehicleId)
    if (vehicle && record.mileage > vehicle.currentMileage) {
      updateVehicle(record.vehicleId, { currentMileage: record.mileage })
    }
  }, [vehicles, updateVehicle])

  const updateMaintenanceRecord = useCallback((id: string, data: Partial<MaintenanceRecord>) => {
    setMaintenanceRecords(prev => prev.map(r => (r.id === id ? { ...r, ...data } : r)))
  }, [])

  const deleteMaintenanceRecord = useCallback((id: string) => {
    setMaintenanceRecords(prev => prev.filter(r => r.id !== id))
  }, [])

  const addFaultRecord = useCallback((record: Omit<FaultRecord, 'id'>) => {
    const newRecord: FaultRecord = { ...record, id: crypto.randomUUID() }
    setFaultRecords(prev => [...prev, newRecord])
  }, [])

  const updateFaultRecord = useCallback((id: string, data: Partial<FaultRecord>) => {
    setFaultRecords(prev => prev.map(f => (f.id === id ? { ...f, ...data } : f)))
  }, [])

  const deleteFaultRecord = useCallback((id: string) => {
    setFaultRecords(prev => prev.filter(f => f.id !== id))
  }, [])

  const linkFaultToMaintenance = useCallback((faultId: string, maintenanceId: string) => {
    setFaultRecords(prev =>
      prev.map(f =>
        f.id === faultId
          ? { ...f, linkedMaintenanceId: maintenanceId, status: 'resolved' as const, resolvedDate: new Date().toISOString().slice(0, 10) }
          : f
      )
    )
  }, [])

  return {
    vehicles,
    maintenanceRecords,
    faultRecords,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    addFaultRecord,
    updateFaultRecord,
    deleteFaultRecord,
    linkFaultToMaintenance,
  }
}
