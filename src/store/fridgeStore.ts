import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FoodItem, ClaimRecord, CleaningRecord } from '@/types'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

interface FridgeStore {
  foodItems: FoodItem[]
  claimRecords: ClaimRecord[]
  cleaningRecords: CleaningRecord[]

  addFoodItem: (item: Omit<FoodItem, 'id' | 'status' | 'createdAt'>) => void
  addFoodItems: (items: Omit<FoodItem, 'id' | 'status' | 'createdAt'>[]) => void
  claimFood: (foodItemId: string, quantity: number, claimerName: string, notes: string) => boolean
  checkExpiry: () => void
  addCleaningRecord: (record: Omit<CleaningRecord, 'id' | 'recordedAt'>) => void

  getAvailableItems: () => FoodItem[]
  getExpiredItems: () => FoodItem[]
  getTodayExpiryItems: () => FoodItem[]
  getSoonExpiryItems: () => FoodItem[]
  getSafeItems: () => FoodItem[]
  getMonthlyClaimCount: () => number
  getMonthlyExpiredCount: () => number
  getPopularFoods: () => { name: string; totalClaimed: number }[]
}

const mockFoodItems: FoodItem[] = [
  {
    id: 'mock1',
    name: '有机白菜',
    quantity: 5,
    source: '张阿姨捐赠',
    shelfLayer: 1,
    expiryDate: getToday(),
    coldChain: true,
    allergens: '',
    photoUrl: '',
    status: 'available',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'mock2',
    name: '全麦面包',
    quantity: 8,
    source: '社区烘焙坊',
    shelfLayer: 2,
    expiryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    coldChain: false,
    allergens: '麸质',
    photoUrl: '',
    status: 'available',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'mock3',
    name: '鲜牛奶',
    quantity: 3,
    source: '超市余量',
    shelfLayer: 3,
    expiryDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    coldChain: true,
    allergens: '牛奶',
    photoUrl: '',
    status: 'available',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'mock4',
    name: '鸡蛋',
    quantity: 12,
    source: '李叔叔捐赠',
    shelfLayer: 3,
    expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    coldChain: true,
    allergens: '鸡蛋',
    photoUrl: '',
    status: 'available',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'mock5',
    name: '苹果',
    quantity: 10,
    source: '果园直供',
    shelfLayer: 4,
    expiryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    coldChain: false,
    allergens: '',
    photoUrl: '',
    status: 'available',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock6',
    name: '豆腐',
    quantity: 4,
    source: '素食坊捐赠',
    shelfLayer: 5,
    expiryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    coldChain: true,
    allergens: '大豆',
    photoUrl: '',
    status: 'available',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock7',
    name: '即食米饭',
    quantity: 6,
    source: '爱心企业捐赠',
    shelfLayer: 2,
    expiryDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    coldChain: false,
    allergens: '',
    photoUrl: '',
    status: 'expired',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'mock8',
    name: '酸奶',
    quantity: 0,
    source: '超市余量',
    shelfLayer: 3,
    expiryDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    coldChain: true,
    allergens: '牛奶',
    photoUrl: '',
    status: 'depleted',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
]

const mockClaimRecords: ClaimRecord[] = [
  {
    id: 'cr1',
    foodItemId: 'mock8',
    foodName: '酸奶',
    quantity: 6,
    claimedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: '谢谢社区冰箱',
    claimerName: '王女士',
  },
]

const mockCleaningRecords: CleaningRecord[] = [
  {
    id: 'cl1',
    temperature: 4,
    disinfectionTime: new Date(Date.now() - 1 * 86400000).toISOString(),
    abnormalOdor: '',
    notes: '常规消毒清洁',
    recordedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    recorderName: '赵志愿者',
  },
]

export const useFridgeStore = create<FridgeStore>()(
  persist(
    (set, get) => ({
      foodItems: mockFoodItems,
      claimRecords: mockClaimRecords,
      cleaningRecords: mockCleaningRecords,

      addFoodItem: (item) => {
        const newItem: FoodItem = {
          ...item,
          id: generateId(),
          status: 'available',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ foodItems: [...state.foodItems, newItem] }))
      },

      addFoodItems: (items) => {
        const newItems: FoodItem[] = items.map((item) => ({
          ...item,
          id: generateId(),
          status: 'available',
          createdAt: new Date().toISOString(),
        }))
        set((state) => ({ foodItems: [...state.foodItems, ...newItems] }))
      },

      claimFood: (foodItemId, quantity, claimerName, notes) => {
        const state = get()
        const food = state.foodItems.find((f) => f.id === foodItemId)
        if (!food || food.status !== 'available' || food.quantity < quantity) {
          return false
        }

        const record: ClaimRecord = {
          id: generateId(),
          foodItemId,
          foodName: food.name,
          quantity,
          claimedAt: new Date().toISOString(),
          notes,
          claimerName,
        }

        const newQuantity = food.quantity - quantity
        const newStatus = newQuantity === 0 ? 'depleted' as const : food.status

        set((state) => ({
          claimRecords: [...state.claimRecords, record],
          foodItems: state.foodItems.map((f) =>
            f.id === foodItemId ? { ...f, quantity: newQuantity, status: newStatus } : f
          ),
        }))
        return true
      },

      checkExpiry: () => {
        const today = getToday()
        const current = get().foodItems
        const needsUpdate = current.some((f) => f.status === 'available' && f.expiryDate < today)
        if (!needsUpdate) return
        set((state) => ({
          foodItems: state.foodItems.map((f) => {
            if (f.status === 'available' && f.expiryDate < today) {
              return { ...f, status: 'expired' as const }
            }
            return f
          }),
        }))
      },

      addCleaningRecord: (record) => {
        const newRecord: CleaningRecord = {
          ...record,
          id: generateId(),
          recordedAt: new Date().toISOString(),
        }
        set((state) => ({ cleaningRecords: [...state.cleaningRecords, newRecord] }))
      },

      getAvailableItems: () => get().foodItems.filter((f) => f.status === 'available'),
      getExpiredItems: () => get().foodItems.filter((f) => f.status === 'expired'),

      getTodayExpiryItems: () => {
        const today = getToday()
        return get().foodItems.filter((f) => f.status === 'available' && f.expiryDate === today)
      },

      getSoonExpiryItems: () => {
        const today = new Date(getToday())
        const threeDays = new Date(today)
        threeDays.setDate(threeDays.getDate() + 3)
        const threeDaysStr = threeDays.toISOString().split('T')[0]
        const todayStr = getToday()
        return get().foodItems.filter(
          (f) => f.status === 'available' && f.expiryDate > todayStr && f.expiryDate <= threeDaysStr
        )
      },

      getSafeItems: () => {
        const today = new Date(getToday())
        const threeDays = new Date(today)
        threeDays.setDate(threeDays.getDate() + 3)
        const threeDaysStr = threeDays.toISOString().split('T')[0]
        return get().foodItems.filter(
          (f) => f.status === 'available' && f.expiryDate > threeDaysStr
        )
      },

      getMonthlyClaimCount: () => {
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        return get().claimRecords
          .filter((r) => r.claimedAt >= monthStart)
          .reduce((sum, r) => sum + r.quantity, 0)
      },

      getMonthlyExpiredCount: () => {
        const now = new Date()
        const targetYear = now.getFullYear()
        const targetMonth = now.getMonth()
        return get().foodItems
          .filter((f) => {
            if (f.status !== 'expired') return false
            const d = new Date(f.expiryDate)
            return d.getFullYear() === targetYear && d.getMonth() === targetMonth
          })
          .reduce((sum, f) => sum + f.quantity, 0)
      },

      getPopularFoods: () => {
        const records = get().claimRecords
        const map = new Map<string, number>()
        records.forEach((r) => {
          map.set(r.foodName, (map.get(r.foodName) || 0) + r.quantity)
        })
        return Array.from(map.entries())
          .map(([name, totalClaimed]) => ({ name, totalClaimed }))
          .sort((a, b) => b.totalClaimed - a.totalClaimed)
      },
    }),
    {
      name: 'community-fridge-store',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const today = getToday()
        const needsUpdate = state.foodItems.some(
          (f) => f.status === 'available' && f.expiryDate < today
        )
        if (needsUpdate) {
          state.foodItems = state.foodItems.map((f) => {
            if (f.status === 'available' && f.expiryDate < today) {
              return { ...f, status: 'expired' as const }
            }
            return f
          })
        }
      },
    }
  )
)
