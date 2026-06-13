import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Vehicle, Request, ReturnRecord, RequestStatus, ConflictResult } from '@/types'
import { MOCK_VEHICLES, MOCK_REQUESTS, MOCK_RETURNS } from '../utils/mockData'
import { genId, checkTimeConflict } from '../utils/date'

interface StoreState {
  vehicles: Vehicle[]
  requests: Request[]
  returns: ReturnRecord[]
  currentUser: { name: string; role: 'admin' | 'user' }
  addVehicle: (v: Omit<Vehicle, 'id' | 'createdAt'>) => void
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void
  deleteVehicle: (id: string) => void
  addRequest: (r: Omit<Request, 'id' | 'createdAt' | 'status'>) => Request | null
  updateRequestStatus: (id: string, status: RequestStatus, rejectReason?: string) => void
  addReturn: (r: Omit<ReturnRecord, 'id' | 'returnedAt'>) => void
  checkConflict: (
    vehicleId: string,
    startTime: string,
    endTime: string,
    excludeRequestId?: string
  ) => ConflictResult
  getVehicleById: (id: string) => Vehicle | undefined
  getRequestById: (id: string) => Request | undefined
  getReturnByRequestId: (id: string) => ReturnRecord | undefined
}

function createState(set: any, get: any): StoreState {
  return {
    vehicles: MOCK_VEHICLES,
    requests: MOCK_REQUESTS,
    returns: MOCK_RETURNS,
    currentUser: { name: '张经理', role: 'admin' },

    addVehicle: function (v) {
      set(function (s: StoreState) {
        return {
          vehicles: [
            Object.assign({}, v, {
              id: genId(),
              createdAt: new Date().toISOString(),
            }),
          ].concat(s.vehicles),
        }
      })
    },

    updateVehicle: function (id, patch) {
      set(function (s: StoreState) {
        return {
          vehicles: s.vehicles.map(function (v) {
            return v.id === id ? Object.assign({}, v, patch) : v
          }),
        }
      })
    },

    deleteVehicle: function (id) {
      set(function (s: StoreState) {
        return { vehicles: s.vehicles.filter(function (v) { return v.id !== id }) }
      })
    },

    addRequest: function (r) {
      const conflict = get().checkConflict(r.vehicleId, r.startTime, r.endTime)
      if (conflict.hasConflict) return null
      const newRequest: Request = Object.assign({}, r, {
        id: genId(),
        createdAt: new Date().toISOString(),
        status: 'pending' as const,
      })
      set(function (s: StoreState) {
        return { requests: [newRequest].concat(s.requests) }
      })
      return newRequest
    },

    updateRequestStatus: function (id, status, rejectReason) {
      set(function (s: StoreState) {
        return {
          requests: s.requests.map(function (r) {
            if (r.id === id) {
              const patch: Partial<Request> = { status: status }
              if (rejectReason) patch.rejectReason = rejectReason
              return Object.assign({}, r, patch)
            }
            return r
          }),
        }
      })
    },

    addReturn: function (ret) {
      const fullReturn: ReturnRecord = Object.assign({}, ret, {
        id: genId(),
        returnedAt: new Date().toISOString(),
      })
      set(function (s: StoreState) {
        const req = s.requests.find(function (r) { return r.id === ret.requestId })
        let updatedVehicles = s.vehicles
        if (req) {
          updatedVehicles = s.vehicles.map(function (v) {
            if (v.id === req.vehicleId) {
              return Object.assign({}, v, {
                currentFuel: ret.fuelLevel,
                currentMileage: ret.actualMileage,
              })
            }
            return v
          })
        }
        return {
          returns: [fullReturn].concat(s.returns),
          requests: s.requests.map(function (r) {
            return r.id === ret.requestId ? Object.assign({}, r, { status: 'returned' as const }) : r
          }),
          vehicles: updatedVehicles,
        }
      })
    },

    checkConflict: function (vehicleId, startTime, endTime, excludeRequestId) {
      return checkTimeConflict(
        vehicleId,
        new Date(startTime),
        new Date(endTime),
        get().requests,
        excludeRequestId,
      )
    },

    getVehicleById: function (id) {
      return get().vehicles.find(function (v) { return v.id === id })
    },
    getRequestById: function (id) {
      return get().requests.find(function (r) { return r.id === id })
    },
    getReturnByRequestId: function (id) {
      return get().returns.find(function (r) { return r.requestId === id })
    },
  }
}

export const useStore = create<StoreState>()(
  persist(
    function (set, get) { return createState(set, get) },
    { name: 'fleet-key-store' },
  ),
)

export type { VehicleStatus, RequestStatus } from '@/types'
