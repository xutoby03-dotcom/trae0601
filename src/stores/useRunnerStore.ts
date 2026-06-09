import { create } from 'zustand'
import type { Runner } from '@/types'
import { mockRunners } from '@/data/mockData'

interface RunnerState {
  currentRunner: Runner | null
  runners: Runner[]
  login: (id: string) => void
  logout: () => void
  getRunner: (id: string) => Runner | undefined
}

export const useRunnerStore = create<RunnerState>((set, get) => ({
  currentRunner: mockRunners[0],
  runners: mockRunners,
  login: (id: string) => {
    const runner = get().runners.find(r => r.id === id)
    if (runner) set({ currentRunner: runner })
  },
  logout: () => set({ currentRunner: null }),
  getRunner: (id: string) => get().runners.find(r => r.id === id),
}))
