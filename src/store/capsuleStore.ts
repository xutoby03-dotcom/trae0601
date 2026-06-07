import { create } from 'zustand'
import type { TimeCapsule, CapsuleFilter, Template } from '@/types'
import { getAllCapsules, addCapsule as dbAdd, updateCapsule as dbUpdate, deleteCapsule as dbDelete, getCapsule, getAllTemplates } from '@/lib/db'
import { generateId, downloadJson } from '@/lib/utils'

interface CapsuleStore {
  capsules: TimeCapsule[]
  templates: Template[]
  filter: CapsuleFilter
  moodFilter: string | null
  isLoading: boolean
  toast: { message: string; type: 'success' | 'error' | 'info' } | null

  loadCapsules: () => Promise<void>
  loadTemplates: () => Promise<void>
  addCapsule: (capsule: Omit<TimeCapsule, 'id' | 'createdAt' | 'isLocked' | 'isOpened'>) => Promise<void>
  openCapsule: (id: string) => Promise<void>
  deleteCapsule: (id: string) => Promise<void>
  setFilter: (filter: CapsuleFilter) => void
  setMoodFilter: (color: string | null) => void
  exportBackup: () => Promise<void>
  importBackup: (json: string) => Promise<void>
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  clearToast: () => void
}

export const useCapsuleStore = create<CapsuleStore>((set, get) => ({
  capsules: [],
  templates: [],
  filter: 'all',
  moodFilter: null,
  isLoading: false,
  toast: null,

  loadCapsules: async () => {
    set({ isLoading: true })
    try {
      const capsules = await getAllCapsules()
      const now = new Date().getTime()
      const updated: TimeCapsule[] = []
      for (const c of capsules) {
        if (c.isLocked && new Date(c.openDate).getTime() <= now) {
          const unlocked = { ...c, isLocked: false }
          await dbUpdate(unlocked)
          updated.push(unlocked)
        } else {
          updated.push(c)
        }
      }
      set({ capsules: updated, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  loadTemplates: async () => {
    try {
      const templates = await getAllTemplates()
      set({ templates })
    } catch {
      // ignore
    }
  },

  addCapsule: async (capsule) => {
    const now = new Date().toISOString()
    const newCapsule: TimeCapsule = {
      ...capsule,
      id: generateId(),
      createdAt: now,
      isLocked: true,
      isOpened: false,
    }
    await dbAdd(newCapsule)
    set((state) => ({ capsules: [newCapsule, ...state.capsules] }))
  },

  openCapsule: async (id) => {
    const capsule = await getCapsule(id)
    if (!capsule) return
    const updated = { ...capsule, isOpened: true }
    await dbUpdate(updated)
    set((state) => ({
      capsules: state.capsules.map((c) => (c.id === id ? updated : c)),
    }))
  },

  deleteCapsule: async (id) => {
    await dbDelete(id)
    set((state) => ({ capsules: state.capsules.filter((c) => c.id !== id) }))
  },

  setFilter: (filter) => set({ filter }),
  setMoodFilter: (moodFilter) => set({ moodFilter }),

  exportBackup: async () => {
    const capsules = await getAllCapsules()
    const data = JSON.stringify({ version: 1, exportDate: new Date().toISOString(), capsules }, null, 2)
    downloadJson(data, `time-capsule-backup-${new Date().toISOString().slice(0, 10)}.json`)
    get().showToast('备份导出成功', 'success')
  },

  importBackup: async (json) => {
    try {
      const data = JSON.parse(json)
      if (!data.capsules || !Array.isArray(data.capsules)) {
        get().showToast('备份文件格式错误', 'error')
        return
      }
      for (const capsule of data.capsules) {
        await dbAdd(capsule)
      }
      await get().loadCapsules()
      get().showToast(`成功导入 ${data.capsules.length} 个胶囊`, 'success')
    } catch {
      get().showToast('导入失败，请检查文件格式', 'error')
    }
  },

  showToast: (message, type = 'info') => {
    set({ toast: { message, type } })
    setTimeout(() => {
      set({ toast: null })
    }, 3000)
  },

  clearToast: () => set({ toast: null }),
}))
