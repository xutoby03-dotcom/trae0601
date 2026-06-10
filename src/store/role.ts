import { create } from 'zustand'

interface RoleState {
  role: 'admin' | 'vendor'
  setRole: (r: 'admin' | 'vendor') => void
}

export const useRole = create<RoleState>(set => ({
  role: 'admin',
  setRole: r => set({ role: r }),
}))
