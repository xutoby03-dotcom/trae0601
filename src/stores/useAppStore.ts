import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole, TabType } from '@/types'

interface AppStore {
  role: UserRole
  setRole: (role: UserRole) => void
  toggleRole: () => void
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  selectedDate: string
  setSelectedDate: (date: string) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      role: 'employee',
      setRole: (role) => set({ role }),
      toggleRole: () => set({ role: get().role === 'employee' ? 'admin' : 'employee' }),
      activeTab: 'morning',
      setActiveTab: (tab) => set({ activeTab: tab }),
      selectedDate: new Date().toISOString().split('T')[0],
      setSelectedDate: (date) => set({ selectedDate: date }),
    }),
    { name: 'shuttle-app' }
  )
)
