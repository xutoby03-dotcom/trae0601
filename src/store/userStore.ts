import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, CreditLog } from '@/types'
import { MOCK_USERS, MOCK_CREDIT_LOGS, CURRENT_USER_ID } from '@/data/mockData'

interface UserState {
  users: User[]
  creditLogs: CreditLog[]
  currentUserId: string
  getCurrentUser: () => User
  getUserById: (id: string) => User | undefined
  updateCreditScore: (userId: string, change: number, reason: string, borrowRecordId?: string) => void
  initMockData: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: MOCK_USERS,
      creditLogs: MOCK_CREDIT_LOGS,
      currentUserId: CURRENT_USER_ID,

      getCurrentUser: () => {
        const { users, currentUserId } = get()
        return users.find(u => u.id === currentUserId) || users[0]
      },

      getUserById: (id: string) => {
        return get().users.find(u => u.id === id)
      },

      updateCreditScore: (userId: string, change: number, reason: string, borrowRecordId = '') => {
        const log: CreditLog = {
          id: `credit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId,
          change,
          reason,
          borrowRecordId,
          createdAt: new Date().toISOString(),
        }
        set(state => ({
          users: state.users.map(u =>
            u.id === userId ? { ...u, creditScore: Math.max(0, u.creditScore + change) } : u
          ),
          creditLogs: [...state.creditLogs, log],
        }))
      },

      initMockData: () => {
        set({ users: MOCK_USERS, creditLogs: MOCK_CREDIT_LOGS })
      },
    }),
    { name: 'tool-cabinet-users' }
  )
)
