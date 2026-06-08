import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Property, InspectionItem, InspectionCategory, RiskTag } from '@/lib/types'

interface PropertyStore {
  properties: Property[]
  compareIds: string[]
  addProperty: (property: Omit<Property, 'id' | 'inspections' | 'createdAt'>) => string
  updateProperty: (id: string, data: Partial<Property>) => void
  deleteProperty: (id: string) => void
  updateInspection: (propertyId: string, category: InspectionCategory, score: number, note: string) => void
  toggleRiskTag: (propertyId: string, tag: RiskTag) => void
  toggleCompare: (id: string) => void
  clearCompare: () => void
  getProperty: (id: string) => Property | undefined
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      properties: [],
      compareIds: [],

      addProperty: (data) => {
        const id = generateId()
        const property: Property = {
          ...data,
          id,
          inspections: [],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          properties: [...state.properties, property],
        }))
        return id
      },

      updateProperty: (id, data) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }))
      },

      deleteProperty: (id) => {
        set((state) => ({
          properties: state.properties.filter((p) => p.id !== id),
          compareIds: state.compareIds.filter((cid) => cid !== id),
        }))
      },

      updateInspection: (propertyId, category, score, note) => {
        set((state) => ({
          properties: state.properties.map((p) => {
            if (p.id !== propertyId) return p
            const existing = p.inspections.find((i) => i.category === category)
            let inspections: InspectionItem[]
            if (existing) {
              inspections = p.inspections.map((i) =>
                i.category === category ? { ...i, score, note } : i
              )
            } else {
              inspections = [
                ...p.inspections,
                { id: generateId(), propertyId, category, score, note },
              ]
            }
            return { ...p, inspections }
          }),
        }))
      },

      toggleRiskTag: (propertyId, tag) => {
        set((state) => ({
          properties: state.properties.map((p) => {
            if (p.id !== propertyId) return p
            const has = p.riskTags.includes(tag)
            return {
              ...p,
              riskTags: has ? p.riskTags.filter((t) => t !== tag) : [...p.riskTags, tag],
            }
          }),
        }))
      },

      toggleCompare: (id) => {
        set((state) => {
          const has = state.compareIds.includes(id)
          if (has) {
            return { compareIds: state.compareIds.filter((cid) => cid !== id) }
          }
          if (state.compareIds.length >= 3) return state
          return { compareIds: [...state.compareIds, id] }
        })
      },

      clearCompare: () => {
        set({ compareIds: [] })
      },

      getProperty: (id) => {
        return get().properties.find((p) => p.id === id)
      },
    }),
    {
      name: 'rental-checklist-storage',
    }
  )
)
