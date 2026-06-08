import { create } from 'zustand'
import type { Item, ItemFilters, Stats, BargainOffer, PriceRecord, EstimateResult } from '@/types'
import { transformKeys, transformItem } from '@/utils/transform'

interface ApiResponse<T> {
  success: boolean
  data: T
}

interface Store {
  items: Item[]
  filters: ItemFilters
  stats: Stats | null
  currentItem: (Item & { priceRecords: PriceRecord[] }) | null
  priceRecords: PriceRecord[]
  bargains: BargainOffer[]
  loading: boolean

  setFilters: (filters: Partial<ItemFilters>) => void
  resetFilters: () => void
  fetchItems: () => Promise<void>
  fetchItem: (id: number) => Promise<void>
  fetchStats: () => Promise<void>
  fetchPriceRecords: (id: number) => Promise<void>
  fetchBargains: (id: number) => Promise<void>
  createItem: (item: Record<string, unknown>) => Promise<Item | null>
  updateItemPrice: (id: number, price: number, reason: string) => Promise<void>
  submitBargain: (itemId: number, offerPrice: number, message: string) => Promise<void>
  handleBargain: (bargainId: number, status: 'accepted' | 'rejected', sellerNote: string) => Promise<void>
  estimatePrice: (data: { originalPrice: number; purchaseDate: string; condition: string; accessoriesComplete: boolean; category: string }) => Promise<EstimateResult | null>
  deleteItem: (id: number) => Promise<void>
  markAsSold: (id: number) => Promise<void>
}

const defaultFilters: ItemFilters = {}

export const useStore = create<Store>((set, get) => ({
  items: [],
  filters: defaultFilters,
  stats: null,
  currentItem: null,
  priceRecords: [],
  bargains: [],
  loading: false,

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }))
  },

  resetFilters: () => {
    set({ filters: defaultFilters })
  },

  fetchItems: async () => {
    set({ loading: true })
    try {
      const { filters } = get()
      const params = new URLSearchParams()
      if (filters.category) params.set('category', filters.category)
      if (filters.condition) params.set('condition', filters.condition)
      if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice))
      if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice))
      if (filters.freeShipping !== undefined) params.set('freeShipping', filters.freeShipping ? '1' : '0')
      const query = params.toString()
      const res = await fetch(`/api/items${query ? `?${query}` : ''}`)
      const json: ApiResponse<Record<string, unknown>[]> = await res.json()
      const items = json.data.map(transformItem) as unknown as Item[]
      set({ items })
    } catch (error) {
      console.error(error)
    } finally {
      set({ loading: false })
    }
  },

  fetchItem: async (id) => {
    set({ loading: true })
    try {
      const res = await fetch(`/api/items/${id}`)
      const json: ApiResponse<Record<string, unknown> & { priceRecords: Record<string, unknown>[] }> = await res.json()
      const item = transformItem(json.data) as unknown as Item & { priceRecords: PriceRecord[] }
      item.priceRecords = (json.data.priceRecords || []).map(transformKeys) as unknown as PriceRecord[]
      set({ currentItem: item })
    } catch (error) {
      console.error(error)
    } finally {
      set({ loading: false })
    }
  },

  fetchStats: async () => {
    try {
      const res = await fetch('/api/stats')
      const json: ApiResponse<Stats> = await res.json()
      set({ stats: json.data })
    } catch (error) {
      console.error(error)
    }
  },

  fetchPriceRecords: async (id) => {
    try {
      const res = await fetch(`/api/items/${id}/prices`)
      const json: ApiResponse<Record<string, unknown>[]> = await res.json()
      const priceRecords = json.data.map(transformKeys) as unknown as PriceRecord[]
      set({ priceRecords })
    } catch (error) {
      console.error(error)
    }
  },

  fetchBargains: async (id) => {
    try {
      const res = await fetch(`/api/items/${id}/bargains`)
      const json: ApiResponse<Record<string, unknown>[]> = await res.json()
      const bargains = json.data.map((b) => {
        return transformKeys(b) as unknown as BargainOffer
      })
      set({ bargains })
    } catch (error) {
      console.error(error)
    }
  },

  createItem: async (item) => {
    set({ loading: true })
    try {
      const payload: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(item)) {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
        payload[snakeKey] = value
      }
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json: ApiResponse<Record<string, unknown>> = await res.json()
      const newItem = transformItem(json.data) as unknown as Item
      set((state) => ({ items: [newItem, ...state.items] }))
      return newItem
    } catch (error) {
      console.error(error)
      return null
    } finally {
      set({ loading: false })
    }
  },

  updateItemPrice: async (id, price, reason) => {
    try {
      const res = await fetch(`/api/items/${id}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price, reason }),
      })
      const json: ApiResponse<Record<string, unknown>[]> = await res.json()
      const priceRecords = json.data.map(transformKeys) as unknown as PriceRecord[]
      set({ priceRecords })
      await get().fetchItem(id)
    } catch (error) {
      console.error(error)
    }
  },

  submitBargain: async (itemId, offerPrice, message) => {
    try {
      const res = await fetch(`/api/items/${itemId}/bargains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerPrice, message }),
      })
      const json: ApiResponse<Record<string, unknown>> = await res.json()
      const bargain = transformKeys(json.data) as unknown as BargainOffer
      set((state) => ({ bargains: [bargain, ...state.bargains] }))
    } catch (error) {
      console.error(error)
    }
  },

  handleBargain: async (bargainId, status, sellerNote) => {
    try {
      const res = await fetch(`/api/bargains/${bargainId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, sellerNote }),
      })
      const json: ApiResponse<Record<string, unknown>> = await res.json()
      const updated = transformKeys(json.data) as unknown as BargainOffer
      set((state) => ({
        bargains: state.bargains.map((b) => (b.id === bargainId ? updated : b)),
      }))
      if (status === 'accepted' && get().currentItem) {
        await get().fetchItem(get().currentItem!.id)
      }
    } catch (error) {
      console.error(error)
    }
  },

  estimatePrice: async (data) => {
    try {
      const res = await fetch('/api/items/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json: ApiResponse<EstimateResult> = await res.json()
      return json.data
    } catch (error) {
      console.error(error)
      return null
    }
  },

  deleteItem: async (id) => {
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' })
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
        currentItem: state.currentItem?.id === id ? null : state.currentItem,
      }))
    } catch (error) {
      console.error(error)
    }
  },

  markAsSold: async (id) => {
    try {
      await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sold' }),
      })
      await get().fetchItem(id)
      await get().fetchItems()
    } catch (error) {
      console.error(error)
    }
  },
}))
