import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Collection, Series, ExchangeRequest, SavedExchange, Rarity } from '@/types'

interface CollectionState {
  collections: Collection[]
  series: Series[]
  exchangeRequests: ExchangeRequest[]
  savedExchanges: SavedExchange[]

  addCollection: (collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateCollection: (id: string, data: Partial<Collection>) => void
  deleteCollection: (id: string) => void

  addSeries: (series: Omit<Series, 'id' | 'createdAt'>) => string
  updateSeries: (id: string, data: Partial<Series>) => void
  deleteSeries: (id: string) => void

  addExchangeRequest: (request: Omit<ExchangeRequest, 'id' | 'createdAt'>) => string
  updateExchangeRequest: (id: string, data: Partial<ExchangeRequest>) => void
  deleteExchangeRequest: (id: string) => void

  addSavedExchange: (saved: Omit<SavedExchange, 'id' | 'savedAt'>) => void
  removeSavedExchange: (exchangeRequestId: string) => void

  exportData: () => string
  importData: (json: string) => boolean
}

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36)

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      collections: [],
      series: [],
      exchangeRequests: [],
      savedExchanges: [],

      addCollection: (collection) => {
        const id = generateId()
        const now = new Date().toISOString()
        set((state) => ({
          collections: [...state.collections, { ...collection, id, createdAt: now, updatedAt: now }],
        }))
        return id
      },

      updateCollection: (id, data) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        }))
      },

      deleteCollection: (id) => {
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
          exchangeRequests: state.exchangeRequests.filter((e) => e.haveCollectionId !== id),
        }))
      },

      addSeries: (series) => {
        const id = generateId()
        set((state) => ({
          series: [...state.series, { ...series, id, createdAt: new Date().toISOString() }],
        }))
        return id
      },

      updateSeries: (id, data) => {
        set((state) => ({
          series: state.series.map((s) => (s.id === id ? { ...s, ...data } : s)),
        }))
      },

      deleteSeries: (id) => {
        set((state) => ({
          series: state.series.filter((s) => s.id !== id),
          collections: state.collections.filter((c) => c.seriesId !== id),
        }))
      },

      addExchangeRequest: (request) => {
        const id = generateId()
        set((state) => ({
          exchangeRequests: [...state.exchangeRequests, { ...request, id, createdAt: new Date().toISOString() }],
        }))
        return id
      },

      updateExchangeRequest: (id, data) => {
        set((state) => ({
          exchangeRequests: state.exchangeRequests.map((e) => (e.id === id ? { ...e, ...data } : e)),
        }))
      },

      deleteExchangeRequest: (id) => {
        set((state) => ({
          exchangeRequests: state.exchangeRequests.filter((e) => e.id !== id),
          savedExchanges: state.savedExchanges.filter((s) => s.exchangeRequestId !== id),
        }))
      },

      addSavedExchange: (saved) => {
        set((state) => ({
          savedExchanges: [...state.savedExchanges, { ...saved, id: generateId(), savedAt: new Date().toISOString() }],
        }))
      },

      removeSavedExchange: (exchangeRequestId) => {
        set((state) => ({
          savedExchanges: state.savedExchanges.filter((s) => s.exchangeRequestId !== exchangeRequestId),
        }))
      },

      exportData: () => {
        const { collections, series, exchangeRequests, savedExchanges } = get()
        return JSON.stringify({ collections, series, exchangeRequests, savedExchanges, exportDate: new Date().toISOString() }, null, 2)
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json)
          if (data.collections && data.series) {
            set({
              collections: data.collections || [],
              series: data.series || [],
              exchangeRequests: data.exchangeRequests || [],
              savedExchanges: data.savedExchanges || [],
            })
            return true
          }
          return false
        } catch {
          return false
        }
      },
    }),
    {
      name: 'blind-box-storage',
    }
  )
)

export function useSeriesWithCollections() {
  const { collections, series } = useCollectionStore()
  return series.map((s) => ({
    ...s,
    collections: collections.filter((c) => c.seriesId === s.id),
    collectedCount: new Set(collections.filter((c) => c.seriesId === s.id).map((c) => c.characterName)).size,
  }))
}

export function useDuplicateCounts() {
  const { collections } = useCollectionStore()
  const countMap: Record<string, number> = {}
  collections.forEach((c) => {
    const key = `${c.seriesId}-${c.characterName}`
    countMap[key] = (countMap[key] || 0) + 1
  })
  return countMap
}

export function useExchangeMatches() {
  const { exchangeRequests, collections } = useCollectionStore()
  const activeRequests = exchangeRequests.filter((r) => r.isActive)
  const matches: { myRequest: ExchangeRequest; matchedRequest: ExchangeRequest }[] = []

  activeRequests.forEach((myReq) => {
    activeRequests.forEach((otherReq) => {
      if (myReq.id === otherReq.id) return
      const iHave = collections.find((c) => c.id === myReq.haveCollectionId)
      if (!iHave) return
      const wantMatch =
        otherReq.haveSeriesName === myReq.wantSeriesName &&
        otherReq.haveCharacterName === myReq.wantCharacterName
      const giveMatch =
        myReq.haveSeriesName === otherReq.wantSeriesName &&
        myReq.haveCharacterName === otherReq.wantCharacterName
      if (wantMatch && giveMatch) {
        const alreadyAdded = matches.some(
          (m) =>
            (m.myRequest.id === myReq.id && m.matchedRequest.id === otherReq.id) ||
            (m.myRequest.id === otherReq.id && m.matchedRequest.id === myReq.id)
        )
        if (!alreadyAdded) {
          matches.push({ myRequest: myReq, matchedRequest: otherReq })
        }
      }
    })
  })

  return matches
}

export function useStats() {
  const { collections, exchangeRequests } = useCollectionStore()
  const totalSpent = collections.reduce((sum, c) => sum + c.purchasePrice, 0)
  const totalCurrentValue = collections.reduce((sum, c) => sum + (c.currentValue || 0), 0)
  const duplicateCount = collections.filter((c) => c.isDuplicate).length
  const duplicateRate = collections.length > 0 ? (duplicateCount / collections.length) * 100 : 0
  const hiddenCount = collections.filter((c) => c.rarity === 'hidden').length
  const avgPrice = collections.length > 0 ? totalSpent / collections.length : 0
  const mostExpensive = collections.length > 0
    ? collections.reduce((max, c) => (c.purchasePrice > max.purchasePrice ? c : max), collections[0])
    : null
  const exchangeableCount = collections.filter((c) => c.willingToExchange).length
  const activeExchanges = exchangeRequests.filter((r) => r.isActive)

  const wantList: Record<string, { characterName: string; seriesName: string; count: number }> = {}
  activeExchanges.forEach((r) => {
    const key = `${r.wantSeriesName}-${r.wantCharacterName}`
    if (!wantList[key]) {
      wantList[key] = { characterName: r.wantCharacterName, seriesName: r.wantSeriesName, count: 0 }
    }
    wantList[key].count++
  })
  const topWantList = Object.values(wantList).sort((a, b) => b.count - a.count)

  const rarityDistribution = {
    common: collections.filter((c) => c.rarity === 'common').length,
    rare: collections.filter((c) => c.rarity === 'rare').length,
    hidden: collections.filter((c) => c.rarity === 'hidden').length,
  }

  return {
    totalSpent,
    totalCurrentValue,
    duplicateCount,
    duplicateRate,
    hiddenCount,
    avgPrice,
    mostExpensive,
    exchangeableCount,
    totalCollections: collections.length,
    topWantList,
    rarityDistribution,
    activeExchangeCount: activeExchanges.length,
  }
}

export function useSeriesProgress() {
  const { collections, series } = useCollectionStore()
  return series.map((s) => {
    const seriesCollections = collections.filter((c) => c.seriesId === s.id)
    const uniqueCharacters = new Set(seriesCollections.map((c) => c.characterName))
    const collectedCount = uniqueCharacters.size
    const totalItems = s.totalItems || s.itemNames?.length || 1
    const progress = (collectedCount / totalItems) * 100

    const rarityBreakdown: Record<Rarity, number> = { common: 0, rare: 0, hidden: 0 }
    seriesCollections.forEach((c) => {
      rarityBreakdown[c.rarity]++
    })

    const missingNames = (s.itemNames || []).filter((name) => !uniqueCharacters.has(name))

    return {
      ...s,
      collections: seriesCollections,
      collectedCount,
      totalItems,
      progress: Math.min(progress, 100),
      isComplete: collectedCount >= totalItems,
      rarityBreakdown,
      missingCount: totalItems - collectedCount,
      missingNames,
    }
  })
}
