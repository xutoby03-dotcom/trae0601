import { create } from 'zustand'
import type { Game, DashboardData, CheckSession, CheckItem, Lending, Component, Expansion } from '@/types'

interface AppState {
  games: Game[]
  dashboard: DashboardData | null
  currentGame: Game | null
  currentCheckSession: CheckSession | null
  lendings: Lending[]
  loading: boolean

  fetchGames: (status?: string) => Promise<void>
  fetchGame: (id: number) => Promise<void>
  createGame: (data: {
    name: string
    min_players: number
    max_players: number
    play_time_minutes: number
    expansions?: Array<{ name: string }>
    components?: Array<{ name: string; category: string; expected_count: number }>
  }) => Promise<void>
  updateGame: (id: number, data: Partial<Game>) => Promise<void>
  deleteGame: (id: number) => Promise<void>

  fetchDashboard: () => Promise<void>

  createCheckSession: (gameId: number, type: 'open' | 'close', table_location?: string) => Promise<void>
  fetchCheckSession: (sessionId: number) => Promise<void>
  updateCheckItems: (sessionId: number, items: Array<{
    component_id: number
    actual_count: number
    is_missing: boolean
    missing_count: number
    possible_holder?: string
  }>) => Promise<void>
  completeCheckSession: (sessionId: number) => Promise<void>
  fetchCheckHistory: (gameId: number) => Promise<CheckSession[]>

  createLending: (gameId: number, data: {
    borrower_name: string
    return_date: string
    deposit: number
  }) => Promise<void>
  returnLending: (lendingId: number) => Promise<void>
  fetchLendings: (status?: string) => Promise<void>
}

const api = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || '请求失败')
  return json.data as T
}

export const useStore = create<AppState>((set, get) => ({
  games: [],
  dashboard: null,
  currentGame: null,
  currentCheckSession: null,
  lendings: [],
  loading: false,

  fetchGames: async (status?: string) => {
    set({ loading: true })
    try {
      const url = status ? `/api/games?status=${status}` : '/api/games'
      const games = await api<Game[]>(url)
      set({ games, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchGame: async (id: number) => {
    set({ loading: true })
    try {
      const game = await api<Game>(`/api/games/${id}`)
      set({ currentGame: game, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createGame: async (data) => {
    await api('/api/games', { method: 'POST', body: JSON.stringify(data) })
    await get().fetchGames()
  },

  updateGame: async (id, data) => {
    await api(`/api/games/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    await get().fetchGame(id)
  },

  deleteGame: async (id) => {
    await api(`/api/games/${id}`, { method: 'DELETE' })
    await get().fetchGames()
  },

  fetchDashboard: async () => {
    try {
      const dashboard = await api<DashboardData>('/api/dashboard')
      set({ dashboard })
    } catch {}
  },

  createCheckSession: async (gameId, type, table_location) => {
    const session = await api<CheckSession>(`/api/games/${gameId}/check`, {
      method: 'POST',
      body: JSON.stringify({ type, table_location }),
    })
    set({ currentCheckSession: session })
  },

  fetchCheckSession: async (sessionId) => {
    try {
      const session = await api<CheckSession>(`/api/check-sessions/${sessionId}`)
      set({ currentCheckSession: session })
    } catch {}
  },

  updateCheckItems: async (sessionId, items) => {
    await api(`/api/check-sessions/${sessionId}/items`, {
      method: 'PUT',
      body: JSON.stringify({ items }),
    })
  },

  completeCheckSession: async (sessionId) => {
    await api(`/api/check-sessions/${sessionId}/complete`, { method: 'POST' })
    set({ currentCheckSession: null })
  },

  fetchCheckHistory: async (gameId) => {
    const history = await api<CheckSession[]>(`/api/games/${gameId}/check-history`)
    return history
  },

  createLending: async (gameId, data) => {
    await api(`/api/games/${gameId}/lend`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    await get().fetchGame(gameId)
  },

  returnLending: async (lendingId) => {
    await api(`/api/lendings/${lendingId}/return`, { method: 'PUT' })
    await get().fetchLendings()
  },

  fetchLendings: async (status?: string) => {
    try {
      const url = status ? `/api/lendings?status=${status}` : '/api/lendings'
      const lendings = await api<Lending[]>(url)
      set({ lendings })
    } catch {}
  },
}))
