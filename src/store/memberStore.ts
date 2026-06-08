import { create } from 'zustand'
import type { FamilyMember } from '@/types'

const MEMBERS_KEY = 'family_medicine_cabinet_members'

const DEFAULT_MEMBERS: FamilyMember[] = [
  { id: '1', name: '自己', tag: 'self', avatar: '😊' },
  { id: '2', name: '老人', tag: 'elderly', avatar: '🧓' },
  { id: '3', name: '小孩', tag: 'child', avatar: '👶' },
  { id: '4', name: '全家', tag: 'all', avatar: '👨‍👩‍👧‍👦' },
]

function loadMembers(): FamilyMember[] {
  try {
    const data = localStorage.getItem(MEMBERS_KEY)
    return data ? JSON.parse(data) : DEFAULT_MEMBERS
  } catch {
    return DEFAULT_MEMBERS
  }
}

interface MemberStore {
  members: FamilyMember[]
  addMember: (member: FamilyMember) => void
  removeMember: (id: string) => void
}

export const useMemberStore = create<MemberStore>((set) => ({
  members: loadMembers(),

  addMember: (member) => {
    set((state) => {
      const members = [...state.members, member]
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
      return { members }
    })
  },

  removeMember: (id) => {
    set((state) => {
      const members = state.members.filter(m => m.id !== id)
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
      return { members }
    })
  },
}))
