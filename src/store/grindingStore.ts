import { create } from 'zustand'

export type RoastLevel = 'raw' | 'light' | 'medium' | 'dark' | 'charred'
export type Equipment = 'stone' | 'steel' | 'ceramic' | 'manual'

export interface GrindingRecord {
  id: string
  spiceName: string
  roastLevel: RoastLevel
  equipment: Equipment
  meshSize: number
  shutdownTemp: number
  aromaIntensity: number
  layering: number
  persistence: number
  recipeRatio: number
  notes: string
  createdAt: string
}

export interface GrindingSpec {
  id: string
  recordId: string
  spiceName: string
  roastLevel: RoastLevel
  equipment: Equipment
  meshSize: number
  shutdownTemp: number
  aromaIntensity: number
  layering: number
  persistence: number
  recipeRatio: number
  originalNotes: string
  specNotes: string
  createdAt: string
}

interface GrindingState {
  currentRecord: Omit<GrindingRecord, 'id' | 'createdAt'>
  records: GrindingRecord[]
  specs: GrindingSpec[]
  specDrawerOpen: boolean

  setSpiceName: (v: string) => void
  setRoastLevel: (v: RoastLevel) => void
  setEquipment: (v: Equipment) => void
  setMeshSize: (v: number) => void
  setShutdownTemp: (v: number) => void
  setAromaIntensity: (v: number) => void
  setLayering: (v: number) => void
  setPersistence: (v: number) => void
  setRecipeRatio: (v: number) => void
  setNotes: (v: string) => void
  saveRecord: () => void
  createSpec: (recordId: string, specNotes: string) => void
  deleteSpec: (id: string) => void
  toggleSpecDrawer: () => void
  resetCurrent: () => void
  loadSpecToCurrent: (spec: GrindingSpec) => void
}

const defaultRecord: Omit<GrindingRecord, 'id' | 'createdAt'> = {
  spiceName: '',
  roastLevel: 'medium',
  equipment: 'steel',
  meshSize: 80,
  shutdownTemp: 45,
  aromaIntensity: 5,
  layering: 5,
  persistence: 5,
  recipeRatio: 50,
  notes: '',
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function migrateSpecs(specs: GrindingSpec[]): GrindingSpec[] {
  return specs.map((s) => ({
    ...s,
    aromaIntensity: s.aromaIntensity ?? 0,
    layering: s.layering ?? 0,
    persistence: s.persistence ?? 0,
    recipeRatio: s.recipeRatio ?? 0,
    originalNotes: s.originalNotes ?? '',
  }))
}

export const useGrindingStore = create<GrindingState>((set, get) => ({
  currentRecord: { ...defaultRecord },
  records: loadFromStorage<GrindingRecord[]>('grinding_records', []),
  specs: migrateSpecs(loadFromStorage<GrindingSpec[]>('grinding_specs', [])),
  specDrawerOpen: false,

  setSpiceName: (v) => set((s) => ({ currentRecord: { ...s.currentRecord, spiceName: v } })),
  setRoastLevel: (v) => set((s) => ({ currentRecord: { ...s.currentRecord, roastLevel: v } })),
  setEquipment: (v) => set((s) => ({ currentRecord: { ...s.currentRecord, equipment: v } })),
  setMeshSize: (v) => set((s) => ({ currentRecord: { ...s.currentRecord, meshSize: v } })),
  setShutdownTemp: (v) => set((s) => ({ currentRecord: { ...s.currentRecord, shutdownTemp: v } })),
  setAromaIntensity: (v) => set((s) => ({ currentRecord: { ...s.currentRecord, aromaIntensity: v } })),
  setLayering: (v) => set((s) => ({ currentRecord: { ...s.currentRecord, layering: v } })),
  setPersistence: (v) => set((s) => ({ currentRecord: { ...s.currentRecord, persistence: v } })),
  setRecipeRatio: (v) => set((s) => ({ currentRecord: { ...s.currentRecord, recipeRatio: v } })),
  setNotes: (v) => set((s) => ({ currentRecord: { ...s.currentRecord, notes: v } })),

  saveRecord: () => {
    const { currentRecord, records } = get()
    if (!currentRecord.spiceName.trim()) return
    const newRecord: GrindingRecord = {
      ...currentRecord,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    const updated = [newRecord, ...records]
    saveToStorage('grinding_records', updated)
    set({ records: updated, currentRecord: { ...defaultRecord } })
  },

  createSpec: (recordId, specNotes) => {
    const record = get().records.find((r) => r.id === recordId)
    if (!record) return
    const newSpec: GrindingSpec = {
      id: crypto.randomUUID(),
      recordId,
      spiceName: record.spiceName,
      roastLevel: record.roastLevel,
      equipment: record.equipment,
      meshSize: record.meshSize,
      shutdownTemp: record.shutdownTemp,
      aromaIntensity: record.aromaIntensity,
      layering: record.layering,
      persistence: record.persistence,
      recipeRatio: record.recipeRatio,
      originalNotes: record.notes,
      specNotes,
      createdAt: new Date().toISOString(),
    }
    const updated = [newSpec, ...get().specs]
    saveToStorage('grinding_specs', updated)
    set({ specs: updated })
  },

  deleteSpec: (id) => {
    const updated = get().specs.filter((s) => s.id !== id)
    saveToStorage('grinding_specs', updated)
    set({ specs: updated })
  },

  toggleSpecDrawer: () => set((s) => ({ specDrawerOpen: !s.specDrawerOpen })),

  resetCurrent: () => set({ currentRecord: { ...defaultRecord } }),

  loadSpecToCurrent: (spec) => {
    set({
      currentRecord: {
        spiceName: spec.spiceName,
        roastLevel: spec.roastLevel,
        equipment: spec.equipment,
        meshSize: spec.meshSize,
        shutdownTemp: spec.shutdownTemp,
        aromaIntensity: spec.aromaIntensity,
        layering: spec.layering,
        persistence: spec.persistence,
        recipeRatio: spec.recipeRatio,
        notes: spec.originalNotes,
      },
      specDrawerOpen: false,
    })
  },
}))

export const ROAST_LEVELS: { value: RoastLevel; label: string; color: string }[] = [
  { value: 'raw', label: '生', color: '#8B9A46' },
  { value: 'light', label: '微烘', color: '#C4A035' },
  { value: 'medium', label: '中烘', color: '#B8860B' },
  { value: 'dark', label: '深烘', color: '#8B4513' },
  { value: 'charred', label: '焦烘', color: '#3E2723' },
]

export const EQUIPMENTS: { value: Equipment; label: string }[] = [
  { value: 'stone', label: '石磨' },
  { value: 'steel', label: '钢磨' },
  { value: 'ceramic', label: '陶瓷磨' },
  { value: 'manual', label: '手动研磨器' },
]
