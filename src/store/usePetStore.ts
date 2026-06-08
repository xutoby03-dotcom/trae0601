import { create } from 'zustand'
import type { PetPost, Clue, StatusLog, AppData, PetStatus } from '@/types'

const STORAGE_KEY = 'pet-finder-data'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { posts: [], clues: [], statusLogs: [] }
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

interface PetStore extends AppData {
  addPost: (post: Omit<PetPost, 'id' | 'createdAt' | 'updatedAt'>) => string
  updatePost: (id: string, updates: Partial<PetPost>) => void
  deletePost: (id: string) => void
  changeStatus: (id: string, newStatus: PetStatus) => void
  addClue: (clue: Omit<Clue, 'id' | 'createdAt'>) => void
  deleteClue: (id: string) => void
  exportData: () => void
  importData: (file: File) => Promise<boolean>
}

export const usePetStore = create<PetStore>((set, get) => ({
  ...loadData(),

  addPost: (postData) => {
    const id = generateId()
    const now = new Date().toISOString()
    const post: PetPost = { ...postData, id, createdAt: now, updatedAt: now }
    set((state) => {
      const newData = { ...state, posts: [post, ...state.posts] }
      saveData(newData)
      return newData
    })
    return id
  },

  updatePost: (id, updates) => {
    set((state) => {
      const posts = state.posts.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
      const newData = { ...state, posts }
      saveData(newData)
      return newData
    })
  },

  deletePost: (id) => {
    set((state) => {
      const posts = state.posts.filter((p) => p.id !== id)
      const clues = state.clues.filter((c) => c.postId !== id)
      const statusLogs = state.statusLogs.filter((s) => s.postId !== id)
      const newData = { ...state, posts, clues, statusLogs }
      saveData(newData)
      return newData
    })
  },

  changeStatus: (id, newStatus) => {
    set((state) => {
      const post = state.posts.find((p) => p.id === id)
      if (!post || post.status === newStatus) return state
      const log: StatusLog = {
        id: generateId(),
        postId: id,
        fromStatus: post.status,
        toStatus: newStatus,
        changedAt: new Date().toISOString(),
      }
      const posts = state.posts.map((p) =>
        p.id === id ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p
      )
      const newData = { ...state, posts, statusLogs: [log, ...state.statusLogs] }
      saveData(newData)
      return newData
    })
  },

  addClue: (clueData) => {
    const clue: Clue = { ...clueData, id: generateId(), createdAt: new Date().toISOString() }
    set((state) => {
      const newData = { ...state, clues: [clue, ...state.clues] }
      saveData(newData)
      return newData
    })
  },

  deleteClue: (id) => {
    set((state) => {
      const clues = state.clues.filter((c) => c.id !== id)
      const newData = { ...state, clues }
      saveData(newData)
      return newData
    })
  },

  exportData: () => {
    const { posts, clues, statusLogs } = get()
    const data: AppData = { posts, clues, statusLogs }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pet-finder-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  },

  importData: async (file) => {
    try {
      const text = await file.text()
      const data: AppData = JSON.parse(text)
      if (!data.posts || !Array.isArray(data.posts)) return false
      set(() => {
        saveData(data)
        return data
      })
      return true
    } catch {
      return false
    }
  },
}))
