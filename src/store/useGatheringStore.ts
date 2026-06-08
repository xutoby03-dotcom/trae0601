import { create } from 'zustand'
import {
  type Gathering,
  type Participant,
  type Dish,
  type PrepTask,
  type Payment,
  type Leftover,
  type DishCategory,
  type GatheringStatus,
  type LeftoverAmount,
  AVATAR_COLORS,
} from '@/types'

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

interface GatheringStore {
  gatherings: Gathering[]
  participants: Participant[]
  dishes: Dish[]
  prepTasks: PrepTask[]
  payments: Payment[]
  leftovers: Leftover[]

  addGathering: (g: Omit<Gathering, 'id' | 'createdAt'>) => string
  updateGathering: (id: string, data: Partial<Gathering>) => void
  deleteGathering: (id: string) => void
  setGatheringStatus: (id: string, status: GatheringStatus) => void

  addParticipant: (p: Omit<Participant, 'id' | 'avatar'>) => string
  updateParticipant: (id: string, data: Partial<Participant>) => void
  removeParticipant: (id: string) => void

  addDish: (d: Omit<Dish, 'id'>) => string
  updateDish: (id: string, data: Partial<Dish>) => void
  removeDish: (id: string) => void
  getDuplicateDishes: (gatheringId: string) => Map<string, Dish[]>
  getDishesByCategory: (gatheringId: string) => Record<DishCategory, Dish[]>

  addPrepTask: (t: Omit<PrepTask, 'id'>) => string
  updatePrepTask: (id: string, data: Partial<PrepTask>) => void
  removePrepTask: (id: string) => void

  addPayment: (p: Omit<Payment, 'id'>) => string
  removePayment: (id: string) => void

  addLeftover: (l: Omit<Leftover, 'id'>) => string
  updateLeftover: (id: string, data: Partial<Leftover>) => void
  removeLeftover: (id: string) => void

  getGatheringById: (id: string) => Gathering | undefined
  getParticipantsByGathering: (gatheringId: string) => Participant[]
  getDishesByGathering: (gatheringId: string) => Dish[]
  getPrepTasksByGathering: (gatheringId: string) => PrepTask[]
  getPaymentsByGathering: (gatheringId: string) => Payment[]
  getLeftoversByGathering: (gatheringId: string) => Leftover[]
  getTopDishes: (limit?: number) => { name: string; avgRating: number; count: number }[]
  getOverLeftoverDishes: () => { name: string; lotCount: number }[]
}

const STORAGE_KEY = 'gathering-coordinator'

function loadFromStorage(): Partial<GatheringStore> {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return {
        gatherings: parsed.gatherings || [],
        participants: parsed.participants || [],
        dishes: parsed.dishes || [],
        prepTasks: parsed.prepTasks || [],
        payments: parsed.payments || [],
        leftovers: parsed.leftovers || [],
      }
    }
  } catch { /* ignore */ }
  return {}
}

function saveToStorage(state: Partial<GatheringStore>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      gatherings: state.gatherings,
      participants: state.participants,
      dishes: state.dishes,
      prepTasks: state.prepTasks,
      payments: state.payments,
      leftovers: state.leftovers,
    }))
  } catch { /* ignore */ }
}

const stored = loadFromStorage()

export const useGatheringStore = create<GatheringStore>((set, get) => ({
  gatherings: stored.gatherings || [],
  participants: stored.participants || [],
  dishes: stored.dishes || [],
  prepTasks: stored.prepTasks || [],
  payments: stored.payments || [],
  leftovers: stored.leftovers || [],

  addGathering: (g) => {
    const id = genId()
    const gathering: Gathering = { ...g, id, createdAt: new Date().toISOString() }
    set((s) => {
      const newState = { gatherings: [...s.gatherings, gathering] }
      saveToStorage({ ...s, ...newState })
      return newState
    })
    return id
  },

  updateGathering: (id, data) => {
    set((s) => {
      const newState = { gatherings: s.gatherings.map((g) => g.id === id ? { ...g, ...data } : g) }
      saveToStorage({ ...s, ...newState })
      return newState
    })
  },

  deleteGathering: (id) => {
    set((s) => {
      const newState = {
        gatherings: s.gatherings.filter((g) => g.id !== id),
        participants: s.participants.filter((p) => p.gatheringId !== id),
        dishes: s.dishes.filter((d) => d.gatheringId !== id),
        prepTasks: s.prepTasks.filter((t) => t.gatheringId !== id),
        payments: s.payments.filter((p) => p.gatheringId !== id),
        leftovers: s.leftovers.filter((l) => l.gatheringId !== id),
      }
      saveToStorage({ ...s, ...newState })
      return newState
    })
  },

  setGatheringStatus: (id, status) => {
    set((s) => {
      const newState = { gatherings: s.gatherings.map((g) => g.id === id ? { ...g, status } : g) }
      saveToStorage({ ...s, ...newState })
      return newState
    })
  },

  addParticipant: (p) => {
    const id = genId()
    const avatar = getAvatarColor(p.name)
    const participant: Participant = { ...p, id, avatar }
    set((s) => {
      const newState = { participants: [...s.participants, participant] }
      saveToStorage({ ...s, ...newState })
      return newState
    })
    return id
  },

  updateParticipant: (id, data) => {
    set((s) => {
      const newState = { participants: s.participants.map((p) => p.id === id ? { ...p, ...data } : p) }
      saveToStorage({ ...s, ...newState })
      return newState
    })
  },

  removeParticipant: (id) => {
    set((s) => {
      const newState = {
        participants: s.participants.filter((p) => p.id !== id),
        dishes: s.dishes.filter((d) => d.participantId !== id),
        payments: s.payments.filter((p) => p.participantId !== id),
      }
      saveToStorage({ ...s, ...newState })
      return newState
    })
  },

  addDish: (d) => {
    const id = genId()
    const dish: Dish = { ...d, id }
    set((s) => {
      const newState = { dishes: [...s.dishes, dish] }
      saveToStorage({ ...s, ...newState })
      return newState
    })
    return id
  },

  updateDish: (id, data) => {
    set((s) => {
      const newState = { dishes: s.dishes.map((d) => d.id === id ? { ...d, ...data } : d) }
      saveToStorage({ ...s, ...newState })
      return newState
    })
  },

  removeDish: (id) => {
    set((s) => {
      const newState = { dishes: s.dishes.filter((d) => d.id !== id) }
      saveToStorage({ ...s, ...newState })
      return newState
    })
  },

  getDuplicateDishes: (gatheringId) => {
    const dishes = get().dishes.filter((d) => d.gatheringId === gatheringId)
    const map = new Map<string, Dish[]>()
    dishes.forEach((d) => {
      const key = d.name.toLowerCase().trim()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(d)
    })
    const result = new Map<string, Dish[]>()
    map.forEach((v, k) => {
      if (v.length > 1) result.set(k, v)
    })
    return result
  },

  getDishesByCategory: (gatheringId) => {
    const dishes = get().dishes.filter((d) => d.gatheringId === gatheringId)
    const result: Record<DishCategory, Dish[]> = {
      staple: [], hot: [], cold: [], dessert: [], drink: [],
    }
    dishes.forEach((d) => {
      result[d.category].push(d)
    })
    return result
  },

  addPrepTask: (t) => {
    const id = genId()
    const task: PrepTask = { ...t, id }
    set((s) => {
      const newState = { prepTasks: [...s.prepTasks, task] }
      saveToStorage({ ...s, ...newState })
      return newState
    })
    return id
  },

  updatePrepTask: (id, data) => {
    set((s) => {
      const newState = { prepTasks: s.prepTasks.map((t) => t.id === id ? { ...t, ...data } : t) }
      saveToStorage({ ...s, ...newState })
      return newState
    })
  },

  removePrepTask: (id) => {
    set((s) => {
      const newState = { prepTasks: s.prepTasks.filter((t) => t.id !== id) }
      saveToStorage({ ...s, ...newState })
      return newState
    })
  },

  addPayment: (p) => {
    const id = genId()
    const payment: Payment = { ...p, id }
    set((s) => {
      const newState = { payments: [...s.payments, payment] }
      saveToStorage({ ...s, ...newState })
      return newState
    })
    return id
  },

  removePayment: (id) => {
    set((s) => {
      const newState = { payments: s.payments.filter((p) => p.id !== id) }
      saveToStorage({ ...s, ...newState })
      return newState
    })
  },

  addLeftover: (l) => {
    const id = genId()
    const leftover: Leftover = { ...l, id }
    set((s) => {
      const newState = { leftovers: [...s.leftovers, leftover] }
      saveToStorage({ ...s, ...newState })
      return newState
    })
    return id
  },

  updateLeftover: (id, data) => {
    set((s) => {
      const newState = { leftovers: s.leftovers.map((l) => l.id === id ? { ...l, ...data } : l) }
      saveToStorage({ ...s, ...newState })
      return newState
    })
  },

  removeLeftover: (id) => {
    set((s) => {
      const newState = { leftovers: s.leftovers.filter((l) => l.id !== id) }
      saveToStorage({ ...s, ...newState })
      return newState
    })
  },

  getGatheringById: (id) => get().gatherings.find((g) => g.id === id),

  getParticipantsByGathering: (gatheringId) => get().participants.filter((p) => p.gatheringId === gatheringId),

  getDishesByGathering: (gatheringId) => get().dishes.filter((d) => d.gatheringId === gatheringId),

  getPrepTasksByGathering: (gatheringId) => get().prepTasks.filter((t) => t.gatheringId === gatheringId),

  getPaymentsByGathering: (gatheringId) => get().payments.filter((p) => p.gatheringId === gatheringId),

  getLeftoversByGathering: (gatheringId) => get().leftovers.filter((l) => l.gatheringId === gatheringId),

  getTopDishes: (limit = 3) => {
    const ratedDishes = get().dishes.filter((d) => d.rating !== undefined && d.rating > 0)
    const map = new Map<string, { total: number; count: number }>()
    ratedDishes.forEach((d) => {
      const key = d.name.trim()
      if (!map.has(key)) map.set(key, { total: 0, count: 0 })
      const entry = map.get(key)!
      entry.total += d.rating
      entry.count += 1
    })
    return Array.from(map.entries())
      .map(([name, { total, count }]) => ({ name, avgRating: total / count, count }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit)
  },

  getOverLeftoverDishes: () => {
    const allLeftovers = get().leftovers
    const map = new Map<string, number>()
    allLeftovers.forEach((l) => {
      if (l.amount === 'lot' || l.amount === 'some') {
        map.set(l.dishName, (map.get(l.dishName) || 0) + 1)
      }
    })
    return Array.from(map.entries())
      .map(([name, lotCount]) => ({ name, lotCount }))
      .sort((a, b) => b.lotCount - a.lotCount)
  },
}))
