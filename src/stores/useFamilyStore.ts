import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FamilyMember } from '../types'
import { defaultMembers } from '../data/defaultMembers'

interface FamilyState {
  members: FamilyMember[]
  addMember: (member: FamilyMember) => void
  removeMember: (id: string) => void
  updateMember: (id: string, data: Partial<FamilyMember>) => void
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set) => ({
      members: defaultMembers,
      addMember: (member) =>
        set((state) => ({ members: [...state.members, member] })),
      removeMember: (id) =>
        set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
      updateMember: (id, data) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        })),
    }),
    { name: 'family-store' }
  )
)
