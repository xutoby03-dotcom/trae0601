import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GarbageRecord, GarbageCategory } from '../types'

interface GarbageState {
  records: GarbageRecord[]
  addRecord: (record: GarbageRecord) => void
  removeRecord: (id: string) => void
  markDisposed: (id: string) => void
  correctRecord: (id: string, correctedBinType: GarbageCategory, correctedBy: string) => void
}

export const useGarbageStore = create<GarbageState>()(
  persist(
    (set) => ({
      records: [],
      addRecord: (record) =>
        set((state) => ({ records: [record, ...state.records] })),
      removeRecord: (id) =>
        set((state) => ({ records: state.records.filter((r) => r.id !== id) })),
      markDisposed: (id) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, disposed: true } : r
          ),
        })),
      correctRecord: (id, correctedBinType, correctedBy) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id
              ? {
                  ...r,
                  isCorrect: r.category === correctedBinType,
                  correctedCategory: correctedBinType,
                  correctedBinType,
                  correctedBy,
                }
              : r
          ),
        })),
    }),
    { name: 'garbage-store' }
  )
)
