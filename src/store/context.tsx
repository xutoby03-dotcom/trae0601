import { createContext, useContext } from 'react'
import type { Vehicle, MaintenanceRecord, FaultRecord } from '../types'

interface StoreContextType {
  vehicles: Vehicle[]
  maintenanceRecords: MaintenanceRecord[]
  faultRecords: FaultRecord[]
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void
  updateVehicle: (id: string, data: Partial<Vehicle>) => void
  deleteVehicle: (id: string) => void
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => void
  updateMaintenanceRecord: (id: string, data: Partial<MaintenanceRecord>) => void
  deleteMaintenanceRecord: (id: string) => void
  addFaultRecord: (record: Omit<FaultRecord, 'id'>) => void
  updateFaultRecord: (id: string, data: Partial<FaultRecord>) => void
  deleteFaultRecord: (id: string) => void
  linkFaultToMaintenance: (faultId: string, maintenanceId: string) => void
}

export const StoreContext = createContext<StoreContextType | null>(null)

export function useStoreContext() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStoreContext must be used within StoreProvider')
  return ctx
}
