import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BakingRecord, RecipeAdjustment, RecordStatus, ProblemTag } from '@/types'

interface BakingStore {
  records: BakingRecord[]
  addRecord: (record: BakingRecord) => void
  updateRecord: (id: string, updates: Partial<BakingRecord>) => void
  deleteRecord: (id: string) => void
  getRecord: (id: string) => BakingRecord | undefined
  getRecordsByProduct: (productId: string) => BakingRecord[]
  getRecentFailures: () => BakingRecord[]
  getPendingReview: () => BakingRecord[]
  getImproved: () => BakingRecord[]
  createNewVersion: (parentId: string, adjustments: RecipeAdjustment[], updates: Partial<BakingRecord>) => BakingRecord | null
  updateStatus: (id: string, status: RecordStatus) => void
  getProblemTagStats: () => { tag: ProblemTag; count: number }[]
  getSuccessRateByType: () => { type: string; total: number; success: number; rate: number }[]
  getMonthlyWaste: () => { month: string; failures: number; cost: number }[]
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

export const useBakingStore = create<BakingStore>()(
  persist(
    (set, get) => ({
      records: [],

      addRecord: (record) => {
        set((state) => ({ records: [...state.records, record] }))
      },

      updateRecord: (id, updates) => {
        set((state) => ({
          records: state.records.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }))
      },

      deleteRecord: (id) => {
        set((state) => ({ records: state.records.filter((r) => r.id !== id) }))
      },

      getRecord: (id) => {
        return get().records.find((r) => r.id === id)
      },

      getRecordsByProduct: (productId) => {
        return get()
          .records.filter((r) => r.productId === productId)
          .sort((a, b) => a.versionNumber - b.versionNumber)
      },

      getRecentFailures: () => {
        return get()
          .records.filter((r) => r.result === 'failure' || r.result === 'partial')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6)
      },

      getPendingReview: () => {
        return get()
          .records.filter((r) => r.status === 'pending_review')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },

      getImproved: () => {
        const improvedProductIds = new Set<string>()
        const records = get().records
        for (const r of records) {
          if (r.status === 'improved') {
            improvedProductIds.add(r.productId)
          }
        }
        const result: BakingRecord[] = []
        const seen = new Set<string>()
        for (const r of records) {
          if (improvedProductIds.has(r.productId) && !seen.has(r.productId)) {
            seen.add(r.productId)
            const versions = records
              .filter((v) => v.productId === r.productId)
              .sort((a, b) => b.versionNumber - a.versionNumber)
            result.push(versions[0])
          }
        }
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },

      createNewVersion: (parentId, adjustments, updates) => {
        const parent = get().records.find((r) => r.id === parentId)
        if (!parent) return null
        const existingVersions = get().records.filter((r) => r.productId === parent.productId)
        const newVersionNum = Math.max(...existingVersions.map((v) => v.versionNumber), 0) + 1
        const newRecord: BakingRecord = {
          ...parent,
          ...updates,
          id: generateId(),
          parentId,
          versionNumber: newVersionNum,
          versionLabel: `v${newVersionNum}`,
          createdAt: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
          result: 'partial',
          tasteScore: 0,
          notes: '',
          problemTags: [],
          status: 'pending_review',
          photos: [],
          adjustments,
        }
        set((state) => ({ records: [...state.records, newRecord] }))
        return newRecord
      },

      updateStatus: (id, status) => {
        set((state) => ({
          records: state.records.map((r) => (r.id === id ? { ...r, status } : r)),
        }))
      },

      getProblemTagStats: () => {
        const tagCount: Record<string, number> = {}
        for (const r of get().records) {
          for (const tag of r.problemTags) {
            tagCount[tag] = (tagCount[tag] || 0) + 1
          }
        }
        return Object.entries(tagCount)
          .map(([tag, count]) => ({ tag: tag as ProblemTag, count }))
          .sort((a, b) => b.count - a.count)
      },

      getSuccessRateByType: () => {
        const typeStats: Record<string, { total: number; success: number }> = {}
        const labels: Record<string, string> = { cake: '蛋糕', cookie: '饼干', bread: '面包', other: '其他' }
        for (const r of get().records) {
          const key = r.productType
          if (!typeStats[key]) typeStats[key] = { total: 0, success: 0 }
          typeStats[key].total++
          if (r.result === 'success') typeStats[key].success++
        }
        return Object.entries(typeStats).map(([type, { total, success }]) => ({
          type: labels[type] || type,
          total,
          success,
          rate: total > 0 ? Math.round((success / total) * 100) : 0,
        }))
      },

      getMonthlyWaste: () => {
        const monthlyData: Record<string, { failures: number; cost: number }> = {}
        for (const r of get().records) {
          if (r.result === 'failure') {
            const month = r.date.substring(0, 7)
            if (!monthlyData[month]) monthlyData[month] = { failures: 0, cost: 0 }
            monthlyData[month].failures++
            monthlyData[month].cost += r.materialCost || 0
          }
        }
        return Object.entries(monthlyData)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month))
      },
    }),
    {
      name: 'baking-failure-storage',
    }
  )
)

export { generateId }
