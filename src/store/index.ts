import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Umbrella, BorrowRecord, UmbrellaStatus, BorrowStatus, DamageType, ReturnCondition } from '@/types'

const now = new Date()
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString()
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

const MOCK_UMBRELLAS: Umbrella[] = [
  { id: 'u1', code: 'UM-001', color: '#EF4444', size: 'M', location: '小区东门', deposit: 20, photoUrl: '', status: 'available', contributorId: 'c1', contributorName: '王大姐', createdAt: weekAgo },
  { id: 'u2', code: 'UM-002', color: '#3B82F6', size: 'L', location: '小区西门', deposit: 0, photoUrl: '', status: 'available', contributorId: 'c2', contributorName: '陈老师', createdAt: fiveDaysAgo },
  { id: 'u3', code: 'UM-003', color: '#1F2937', size: 'M', location: '社区中心', deposit: 10, photoUrl: '', status: 'borrowed', contributorId: 'c3', contributorName: '赵阿姨', createdAt: threeDaysAgo },
  { id: 'u4', code: 'UM-004', color: '#22C55E', size: 'S', location: '地下车库', deposit: 0, photoUrl: '', status: 'damaged', contributorId: 'c1', contributorName: '王大姐', createdAt: weekAgo },
  { id: 'u5', code: 'UM-005', color: '#EAB308', size: 'L', location: '物业前台', deposit: 15, photoUrl: '', status: 'available', contributorId: 'c4', contributorName: '刘叔叔', createdAt: twoDaysAgo },
  { id: 'u6', code: 'UM-006', color: '#A855F7', size: 'M', location: '小区东门', deposit: 0, photoUrl: '', status: 'lost', contributorId: 'c2', contributorName: '陈老师', createdAt: fiveDaysAgo },
  { id: 'u7', code: 'UM-007', color: '#EC4899', size: 'S', location: '社区中心', deposit: 10, photoUrl: '', status: 'available', contributorId: 'c5', contributorName: '孙奶奶', createdAt: yesterday },
  { id: 'u8', code: 'UM-008', color: '#F97316', size: 'M', location: '小区西门', deposit: 0, photoUrl: '', status: 'borrowed', contributorId: 'c3', contributorName: '赵阿姨', createdAt: threeDaysAgo },
]

const MOCK_RECORDS: BorrowRecord[] = [
  { id: 'r1', umbrellaId: 'u3', borrowerName: '张阿姨', borrowTime: yesterday, expectedReturnTime: tomorrow, actualReturnTime: null, returnLocation: '小区东门', conditionOnReturn: null, damageTypes: [], damageNote: '', returnPhotoUrl: null, status: 'active' },
  { id: 'r2', umbrellaId: 'u8', borrowerName: '李叔', borrowTime: twoDaysAgo, expectedReturnTime: yesterday, actualReturnTime: null, returnLocation: '小区西门', conditionOnReturn: null, damageTypes: [], damageNote: '', returnPhotoUrl: null, status: 'overdue' },
  { id: 'r3', umbrellaId: 'u4', borrowerName: '小刘', borrowTime: threeDaysAgo, expectedReturnTime: twoDaysAgo, actualReturnTime: twoDaysAgo, returnLocation: '地下车库', conditionOnReturn: 'damaged', damageTypes: ['rib_broken'], damageNote: '开伞时用力过猛', returnPhotoUrl: '', status: 'returned' },
  { id: 'r4', umbrellaId: 'u6', borrowerName: '周先生', borrowTime: fiveDaysAgo, expectedReturnTime: threeDaysAgo, actualReturnTime: null, returnLocation: '小区东门', conditionOnReturn: 'lost', damageTypes: [], damageNote: '', returnPhotoUrl: null, status: 'overdue' },
]

interface UmbrellaStore {
  umbrellas: Umbrella[]
  borrowRecords: BorrowRecord[]
  addUmbrella: (umbrella: Omit<Umbrella, 'id' | 'createdAt'>) => string
  borrowUmbrella: (umbrellaId: string, borrowerName: string, expectedReturnTime: string, returnLocation: string) => void
  returnUmbrella: (recordId: string, condition: ReturnCondition, damageTypes: DamageType[], damageNote: string) => void
  repairUmbrella: (umbrellaId: string) => void
  reportLost: (umbrellaId: string) => void
  getUmbrellasByStatus: (status: UmbrellaStatus) => Umbrella[]
  getActiveBorrowForUmbrella: (umbrellaId: string) => BorrowRecord | undefined
  getOverdueRecords: () => BorrowRecord[]
  getContributorStats: () => { name: string; count: number }[]
  getLocationStats: () => { location: string; total: number; available: number }[]
  getLossRate: () => number
  getAverageBorrowDuration: () => number
}

export const useUmbrellaStore = create<UmbrellaStore>()(
  persist(
    (set, get) => ({
      umbrellas: MOCK_UMBRELLAS,
      borrowRecords: MOCK_RECORDS,

      addUmbrella: (data) => {
        const id = `u${Date.now()}`
        const umbrella: Umbrella = {
          ...data,
          id,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ umbrellas: [...state.umbrellas, umbrella] }))
        return id
      },

      borrowUmbrella: (umbrellaId, borrowerName, expectedReturnTime, returnLocation) => {
        const recordId = `r${Date.now()}`
        const record: BorrowRecord = {
          id: recordId,
          umbrellaId,
          borrowerName,
          borrowTime: new Date().toISOString(),
          expectedReturnTime,
          actualReturnTime: null,
          returnLocation,
          conditionOnReturn: null,
          damageTypes: [],
          damageNote: '',
          returnPhotoUrl: null,
          status: 'active',
        }
        set((state) => ({
          umbrellas: state.umbrellas.map((u) =>
            u.id === umbrellaId ? { ...u, status: 'borrowed' as UmbrellaStatus } : u
          ),
          borrowRecords: [...state.borrowRecords, record],
        }))
      },

      returnUmbrella: (recordId, condition, damageTypes, damageNote) => {
        set((state) => {
          const record = state.borrowRecords.find((r) => r.id === recordId)
          if (!record) return state

          let newStatus: UmbrellaStatus = 'available'
          if (condition === 'damaged') newStatus = 'damaged'
          if (condition === 'lost') newStatus = 'lost'

          return {
            umbrellas: state.umbrellas.map((u) =>
              u.id === record.umbrellaId ? { ...u, status: newStatus } : u
            ),
            borrowRecords: state.borrowRecords.map((r) =>
              r.id === recordId
                ? {
                    ...r,
                    actualReturnTime: new Date().toISOString(),
                    conditionOnReturn: condition,
                    damageTypes,
                    damageNote,
                    status: 'returned' as BorrowStatus,
                  }
                : r
            ),
          }
        })
      },

      repairUmbrella: (umbrellaId) => {
        set((state) => ({
          umbrellas: state.umbrellas.map((u) =>
            u.id === umbrellaId ? { ...u, status: 'available' as UmbrellaStatus } : u
          ),
        }))
      },

      reportLost: (umbrellaId) => {
        set((state) => ({
          umbrellas: state.umbrellas.map((u) =>
            u.id === umbrellaId ? { ...u, status: 'lost' as UmbrellaStatus } : u
          ),
        }))
      },

      getUmbrellasByStatus: (status) => {
        return get().umbrellas.filter((u) => u.status === status)
      },

      getActiveBorrowForUmbrella: (umbrellaId) => {
        return get().borrowRecords.find(
          (r) => r.umbrellaId === umbrellaId && (r.status === 'active' || r.status === 'overdue')
        )
      },

      getOverdueRecords: () => {
        const records = get().borrowRecords.filter(
          (r) => r.status === 'active' && new Date(r.expectedReturnTime) < new Date()
        )
        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            records.some((od) => od.id === r.id) ? { ...r, status: 'overdue' as BorrowStatus } : r
          ),
        }))
        return records
      },

      getContributorStats: () => {
        const map = new Map<string, number>()
        get().umbrellas.forEach((u) => {
          map.set(u.contributorName, (map.get(u.contributorName) || 0) + 1)
        })
        return Array.from(map.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
      },

      getLocationStats: () => {
        const umbrellas = get().umbrellas
        const locationMap = new Map<string, { total: number; available: number }>()
        umbrellas.forEach((u) => {
          const stat = locationMap.get(u.location) || { total: 0, available: 0 }
          stat.total += 1
          if (u.status === 'available') stat.available += 1
          locationMap.set(u.location, stat)
        })
        return Array.from(locationMap.entries()).map(([location, { total, available }]) => ({
          location,
          total,
          available,
        }))
      },

      getLossRate: () => {
        const umbrellas = get().umbrellas
        if (umbrellas.length === 0) return 0
        const lost = umbrellas.filter((u) => u.status === 'lost').length
        return Math.round((lost / umbrellas.length) * 100)
      },

      getAverageBorrowDuration: () => {
        const records = get().borrowRecords.filter(
          (r) => r.actualReturnTime && r.status === 'returned'
        )
        if (records.length === 0) return 0
        const totalHours = records.reduce((sum, r) => {
          const borrow = new Date(r.borrowTime).getTime()
          const ret = new Date(r.actualReturnTime!).getTime()
          return sum + (ret - borrow) / (1000 * 60 * 60)
        }, 0)
        return Math.round((totalHours / records.length) * 10) / 10
      },
    }),
    { name: 'umbrella-store' }
  )
)
