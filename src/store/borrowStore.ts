import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BorrowRecord, BorrowRecordStatus } from '@/types'
import { MOCK_BORROW_RECORDS, CURRENT_USER_ID } from '@/data/mockData'
import { useToolStore } from './toolStore'
import { useUserStore } from './userStore'

interface BorrowState {
  borrowRecords: BorrowRecord[]
  requestBorrow: (toolId: string, purpose: string, startTime: string, expectedReturnTime: string) => void
  confirmBorrow: (recordId: string) => void
  returnTool: (recordId: string, returnPhoto: string, hasDamage: boolean, damageDescription: string, damageCompensation: number) => void
  getBorrowRecordsByBorrower: (userId: string) => BorrowRecord[]
  getBorrowRecordsByOwner: (userId: string) => BorrowRecord[]
  getBorrowRecordsByTool: (toolId: string) => BorrowRecord[]
  getPendingRequests: (ownerId: string) => BorrowRecord[]
  initMockData: () => void
}

export const useBorrowStore = create<BorrowState>()(
  persist(
    (set, get) => ({
      borrowRecords: MOCK_BORROW_RECORDS,

      requestBorrow: (toolId, purpose, startTime, expectedReturnTime) => {
        const tool = useToolStore.getState().getToolById(toolId)
        if (!tool) return
        const record: BorrowRecord = {
          id: `borrow-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          toolId,
          borrowerId: CURRENT_USER_ID,
          ownerId: tool.ownerId,
          startTime,
          expectedReturnTime,
          actualReturnTime: '',
          purpose,
          status: 'pending',
          returnPhoto: '',
          hasDamage: false,
          damageDescription: '',
          damageCompensation: 0,
          isOverdue: false,
        }
        set(state => ({ borrowRecords: [...state.borrowRecords, record] }))
      },

      confirmBorrow: (recordId) => {
        const record = get().borrowRecords.find(r => r.id === recordId)
        if (!record) return
        set(state => ({
          borrowRecords: state.borrowRecords.map(r =>
            r.id === recordId ? { ...r, status: 'active' as BorrowRecordStatus } : r
          ),
        }))
        useToolStore.getState().updateToolStatus(record.toolId, 'borrowed')
      },

      returnTool: (recordId, returnPhoto, hasDamage, damageDescription, damageCompensation) => {
        const record = get().borrowRecords.find(r => r.id === recordId)
        if (!record) return

        const now = new Date()
        const expected = new Date(record.expectedReturnTime)
        const isOverdue = now > expected

        set(state => ({
          borrowRecords: state.borrowRecords.map(r =>
            r.id === recordId
              ? {
                  ...r,
                  status: 'returned' as BorrowRecordStatus,
                  actualReturnTime: now.toISOString(),
                  returnPhoto,
                  hasDamage,
                  damageDescription,
                  damageCompensation,
                  isOverdue,
                }
              : r
          ),
        }))

        useToolStore.getState().updateToolStatus(record.toolId, 'available')

        if (isOverdue) {
          useUserStore.getState().updateCreditScore(record.borrowerId, -10, '逾期归还工具', recordId)
        } else {
          useUserStore.getState().updateCreditScore(record.borrowerId, 5, '准时归还工具', recordId)
        }

        if (hasDamage) {
          useUserStore.getState().updateCreditScore(record.borrowerId, -20, '归还时工具损坏', recordId)
          useToolStore.getState().setToolMaintenance(record.toolId)
        }
      },

      getBorrowRecordsByBorrower: (userId) => {
        return get().borrowRecords.filter(r => r.borrowerId === userId)
      },

      getBorrowRecordsByOwner: (userId) => {
        return get().borrowRecords.filter(r => r.ownerId === userId)
      },

      getBorrowRecordsByTool: (toolId) => {
        return get().borrowRecords.filter(r => r.toolId === toolId)
      },

      getPendingRequests: (ownerId) => {
        return get().borrowRecords.filter(r => r.ownerId === ownerId && r.status === 'pending')
      },

      initMockData: () => {
        set({ borrowRecords: MOCK_BORROW_RECORDS })
      },
    }),
    { name: 'tool-cabinet-borrows' }
  )
)
