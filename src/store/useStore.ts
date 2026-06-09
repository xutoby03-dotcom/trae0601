import { create } from 'zustand'
import type { Uniform, Reservation, Handover, PurchaseRequest, User } from '@/types'
import { MOCK_UNIFORMS, MOCK_RESERVATIONS, MOCK_HANDOVERS, MOCK_PURCHASE_REQUESTS, MOCK_USERS } from '@/data/mock'

interface AppState {
  currentUser: User
  users: User[]
  uniforms: Uniform[]
  reservations: Reservation[]
  handovers: Handover[]
  purchaseRequests: PurchaseRequest[]

  addUniform: (uniform: Uniform) => void
  updateUniform: (id: string, updates: Partial<Uniform>) => void

  addReservation: (reservation: Reservation) => void
  updateReservation: (id: string, updates: Partial<Reservation>) => void

  addHandover: (handover: Handover) => void
  updateHandover: (id: string, updates: Partial<Handover>) => void

  addPurchaseRequest: (request: PurchaseRequest) => void
  updatePurchaseRequest: (id: string, updates: Partial<PurchaseRequest>) => void

  getUniformsByFilter: (filters: { size?: string; season?: string; gender?: string; search?: string }) => Uniform[]
  getUrgentUniforms: () => Uniform[]
  getReservationsByUniform: (uniformId: string) => Reservation[]
  getReservationsByUser: (userId: string) => Reservation[]
  getHandoverByReservation: (reservationId: string) => Handover | undefined
  getPublishedUniforms: (userId: string) => Uniform[]
  getUserById: (id: string) => User | undefined
  getStats: () => {
    totalTransferred: number
    totalSaved: number
    sizeDemand: { size: string; demand: number; supply: number }[]
    monthlyTrend: { month: string; count: number }[]
  }
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: MOCK_USERS[0],
  users: MOCK_USERS,
  uniforms: MOCK_UNIFORMS,
  reservations: MOCK_RESERVATIONS,
  handovers: MOCK_HANDOVERS,
  purchaseRequests: MOCK_PURCHASE_REQUESTS,

  addUniform: (uniform) => set((s) => ({ uniforms: [uniform, ...s.uniforms] })),
  updateUniform: (id, updates) => set((s) => ({
    uniforms: s.uniforms.map((u) => (u.id === id ? { ...u, ...updates } : u)),
  })),

  addReservation: (reservation) => set((s) => ({ reservations: [reservation, ...s.reservations] })),
  updateReservation: (id, updates) => set((s) => ({
    reservations: s.reservations.map((r) => (r.id === id ? { ...r, ...updates } : r)),
  })),

  addHandover: (handover) => set((s) => ({ handovers: [handover, ...s.handovers] })),
  updateHandover: (id, updates) => set((s) => ({
    handovers: s.handovers.map((h) => (h.id === id ? { ...h, ...updates } : h)),
  })),

  addPurchaseRequest: (request) => set((s) => ({ purchaseRequests: [request, ...s.purchaseRequests] })),
  updatePurchaseRequest: (id, updates) => set((s) => ({
    purchaseRequests: s.purchaseRequests.map((r) => (r.id === id ? { ...r, ...updates } : r)),
  })),

  getUniformsByFilter: (filters) => {
    const { uniforms } = get()
    return uniforms.filter((u) => {
      if (filters.size && u.size !== filters.size) return false
      if (filters.season && u.season !== filters.season) return false
      if (filters.gender && u.gender !== filters.gender) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        return (
          u.school.toLowerCase().includes(q) ||
          u.grade.toLowerCase().includes(q) ||
          u.size.includes(q) ||
          u.season.includes(q) ||
          u.gender.includes(q) ||
          u.condition.includes(q)
        )
      }
      return true
    })
  },

  getUrgentUniforms: () => {
    const { uniforms } = get()
    return uniforms.filter((u) => u.isUrgent && u.status === 'available')
  },

  getReservationsByUniform: (uniformId) => {
    return get().reservations.filter((r) => r.uniformId === uniformId)
  },

  getReservationsByUser: (userId) => {
    return get().reservations.filter((r) => r.userId === userId)
  },

  getHandoverByReservation: (reservationId) => {
    return get().handovers.find((h) => h.reservationId === reservationId)
  },

  getPublishedUniforms: (userId) => {
    return get().uniforms.filter((u) => u.publisherId === userId)
  },

  getUserById: (id) => {
    return get().users.find((u) => u.id === id)
  },

  getStats: () => {
    const { uniforms, purchaseRequests } = get()
    const completed = uniforms.filter((u) => u.status === 'completed')
    const totalTransferred = completed.length
    const totalSaved = completed.reduce((sum, u) => sum + (u.isFree ? 80 : u.price), 0) + completed.filter((u) => u.isFree).length * 60

    const sizeDemandMap: Record<string, { demand: number; supply: number }> = {}
    purchaseRequests.filter((r) => r.status === 'open').forEach((r) => {
      if (!sizeDemandMap[r.size]) sizeDemandMap[r.size] = { demand: 0, supply: 0 }
      sizeDemandMap[r.size].demand++
    })
    uniforms.filter((u) => u.status === 'available').forEach((u) => {
      if (!sizeDemandMap[u.size]) sizeDemandMap[u.size] = { demand: 0, supply: 0 }
      sizeDemandMap[u.size].supply++
    })
    const sizeDemand = Object.entries(sizeDemandMap).map(([size, ds]) => ({ size, ...ds }))

    const monthMap: Record<string, number> = {}
    uniforms.forEach((u) => {
      const month = u.createdAt.slice(0, 7)
      monthMap[month] = (monthMap[month] || 0) + 1
    })
    const monthlyTrend = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }))

    return { totalTransferred, totalSaved, sizeDemand, monthlyTrend }
  },
}))
