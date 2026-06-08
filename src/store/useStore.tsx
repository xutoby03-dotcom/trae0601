import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { FoodItem, Order, UserProfile, MonthlyStats } from '../types'
import { generateId, isExpired } from '../types'

interface StoreContextType {
  foodItems: FoodItem[]
  currentUser: UserProfile
  addFoodItem: (item: Omit<FoodItem, 'id' | 'status' | 'currentQuantity' | 'orders' | 'createdAt' | 'publisherId' | 'publisherName' | 'publisherAvatar'>) => void
  addOrder: (foodId: string, quantity: number, pickupTime: string, message: string) => void
  confirmPickup: (foodId: string, orderId: string) => void
  markNoShow: (foodId: string, orderId: string) => void
  getMonthlyStats: () => MonthlyStats
}

const StoreContext = createContext<StoreContextType | null>(null)

const CURRENT_USER: UserProfile = {
  id: 'user_me',
  name: '我',
  avatar: '🧑',
  noShowCount: 0,
  completedPickups: 0,
}

const NEIGHBORS: UserProfile[] = [
  { id: 'user_1', name: '张阿姨', avatar: '👩', noShowCount: 0, completedPickups: 12 },
  { id: 'user_2', name: '李叔', avatar: '👨', noShowCount: 1, completedPickups: 8 },
  { id: 'user_3', name: '小王', avatar: '🧑‍💼', noShowCount: 0, completedPickups: 5 },
  { id: 'user_4', name: '赵姐', avatar: '👩‍🦰', noShowCount: 0, completedPickups: 15 },
]

const DEMO_DATA: FoodItem[] = [
  {
    id: 'demo_1',
    name: '蒙牛纯牛奶 250ml×12盒',
    photo: '',
    quantity: 3,
    originalPrice: 39.9,
    sharePrice: 8,
    expiryDate: new Date().toISOString().split('T')[0],
    pickupLocation: '3号楼1单元门口',
    isOpened: false,
    allergyWarning: '含乳制品',
    coldChainRequired: true,
    publisherId: 'user_1',
    publisherName: '张阿姨',
    publisherAvatar: '👩',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'grouping',
    currentQuantity: 1,
    orders: [
      {
        id: 'order_1_1',
        userId: 'user_2',
        userName: '李叔',
        userAvatar: '👨',
        quantity: 1,
        pickupTime: '今天18:00-19:00',
        message: '下班后过来取',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        pickedUp: false,
        noShow: false,
      },
    ],
  },
  {
    id: 'demo_2',
    name: '桃李醇熟面包 400g',
    photo: '',
    quantity: 2,
    originalPrice: 12.8,
    sharePrice: 4,
    expiryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    pickupLocation: '5号楼快递柜旁',
    isOpened: false,
    allergyWarning: '含麸质、鸡蛋',
    coldChainRequired: false,
    publisherId: 'user_3',
    publisherName: '小王',
    publisherAvatar: '🧑‍💼',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'grouping',
    currentQuantity: 0,
    orders: [],
  },
  {
    id: 'demo_3',
    name: '海天酱油 500ml',
    photo: '',
    quantity: 1,
    originalPrice: 9.9,
    sharePrice: 3,
    expiryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    pickupLocation: '1号楼物业前台',
    isOpened: true,
    allergyWarning: '含大豆、小麦',
    coldChainRequired: false,
    publisherId: 'user_4',
    publisherName: '赵姐',
    publisherAvatar: '👩‍🦰',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'grouping',
    currentQuantity: 0,
    orders: [],
  },
  {
    id: 'demo_4',
    name: '旺旺雪饼 150g',
    photo: '',
    quantity: 4,
    originalPrice: 8.5,
    sharePrice: 1.5,
    expiryDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
    pickupLocation: '7号楼楼下花园',
    isOpened: false,
    allergyWarning: '',
    coldChainRequired: false,
    publisherId: 'user_1',
    publisherName: '张阿姨',
    publisherAvatar: '👩',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    status: 'grouping',
    currentQuantity: 2,
    orders: [
      {
        id: 'order_4_1',
        userId: 'user_3',
        userName: '小王',
        userAvatar: '🧑‍💼',
        quantity: 1,
        pickupTime: '明天上午10点',
        message: '谢谢阿姨！',
        createdAt: new Date(Date.now() - 21600000).toISOString(),
        pickedUp: false,
        noShow: false,
      },
      {
        id: 'order_4_2',
        userId: 'user_4',
        userName: '赵姐',
        userAvatar: '👩‍🦰',
        quantity: 1,
        pickupTime: '明天下午3点',
        message: '顺便带点水果给你',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        pickedUp: false,
        noShow: false,
      },
    ],
  },
  {
    id: 'demo_5',
    name: '安慕希酸奶 205g×6',
    photo: '',
    quantity: 2,
    originalPrice: 29.9,
    sharePrice: 6,
    expiryDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    pickupLocation: '2号楼负一层车库',
    isOpened: false,
    allergyWarning: '含乳制品',
    coldChainRequired: true,
    publisherId: 'user_2',
    publisherName: '李叔',
    publisherAvatar: '👨',
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    status: 'grouping',
    currentQuantity: 0,
    orders: [],
  },
  {
    id: 'demo_6',
    name: '奥利奥饼干 97g',
    photo: '',
    quantity: 3,
    originalPrice: 6.5,
    sharePrice: 1.5,
    expiryDate: new Date(Date.now()).toISOString().split('T')[0],
    pickupLocation: '6号楼电梯口',
    isOpened: true,
    allergyWarning: '含小麦、大豆、乳制品',
    coldChainRequired: false,
    publisherId: 'user_4',
    publisherName: '赵姐',
    publisherAvatar: '👩‍🦰',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    status: 'grouping',
    currentQuantity: 1,
    orders: [
      {
        id: 'order_6_1',
        userId: 'user_1',
        userName: '张阿姨',
        userAvatar: '👩',
        quantity: 1,
        pickupTime: '今天下午5点',
        message: '给孩子尝尝',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        pickedUp: false,
        noShow: false,
      },
    ],
  },
  {
    id: 'demo_7',
    name: '三全速冻水饺 450g',
    photo: '',
    quantity: 1,
    originalPrice: 15.8,
    sharePrice: 5,
    expiryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    pickupLocation: '4号楼冰柜共享区',
    isOpened: false,
    allergyWarning: '含麸质、虾',
    coldChainRequired: true,
    publisherId: 'user_3',
    publisherName: '小王',
    publisherAvatar: '🧑‍💼',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    status: 'grouping',
    currentQuantity: 0,
    orders: [],
  },
]

const STORAGE_KEY = 'food_share_store'

function loadFromStorage(): FoodItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return DEMO_DATA
}

function saveToStorage(items: FoodItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch { /* ignore */ }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(loadFromStorage)

  useEffect(() => {
    saveToStorage(foodItems)
  }, [foodItems])

  const updateExpiredItems = useCallback((items: FoodItem[]): FoodItem[] => {
    return items.map(item => {
      if (item.status !== 'completed' && isExpired(item.expiryDate)) {
        return { ...item, status: 'expired' as const }
      }
      return item
    })
  }, [])

  const addFoodItem = useCallback((item: Omit<FoodItem, 'id' | 'status' | 'currentQuantity' | 'orders' | 'createdAt' | 'publisherId' | 'publisherName' | 'publisherAvatar'>) => {
    const newItem: FoodItem = {
      ...item,
      id: generateId(),
      status: isExpired(item.expiryDate) ? 'expired' : 'grouping',
      currentQuantity: 0,
      orders: [],
      createdAt: new Date().toISOString(),
      publisherId: CURRENT_USER.id,
      publisherName: CURRENT_USER.name,
      publisherAvatar: CURRENT_USER.avatar,
    }
    setFoodItems(prev => updateExpiredItems([newItem, ...prev]))
  }, [updateExpiredItems])

  const addOrder = useCallback((foodId: string, quantity: number, pickupTime: string, message: string) => {
    setFoodItems(prev => updateExpiredItems(prev.map(item => {
      if (item.id !== foodId) return item
      if (item.status === 'expired') return item
      const newOrder: Order = {
        id: generateId(),
        userId: CURRENT_USER.id,
        userName: CURRENT_USER.name,
        userAvatar: CURRENT_USER.avatar,
        quantity,
        pickupTime,
        message,
        createdAt: new Date().toISOString(),
        pickedUp: false,
        noShow: false,
      }
      const newCurrentQty = item.currentQuantity + quantity
      const newStatus: FoodItem['status'] = newCurrentQty >= item.quantity ? 'pendingPickup' : 'grouping'
      return {
        ...item,
        currentQuantity: newCurrentQty,
        orders: [...item.orders, newOrder],
        status: newStatus,
      }
    })))
  }, [updateExpiredItems])

  const confirmPickup = useCallback((foodId: string, orderId: string) => {
    setFoodItems(prev => prev.map(item => {
      if (item.id !== foodId) return item
      const newOrders = item.orders.map(o =>
        o.id === orderId ? { ...o, pickedUp: true } : o
      )
      const allPickedUp = newOrders.every(o => o.pickedUp)
      return {
        ...item,
        orders: newOrders,
        status: allPickedUp ? 'completed' as const : item.status,
      }
    }))
  }, [])

  const markNoShow = useCallback((foodId: string, orderId: string) => {
    setFoodItems(prev => prev.map(item => {
      if (item.id !== foodId) return item
      const newOrders = item.orders.map(o =>
        o.id === orderId ? { ...o, noShow: true } : o
      )
      const activeOrders = newOrders.filter(o => !o.noShow)
      const allDone = activeOrders.every(o => o.pickedUp)
      const newCurrentQty = item.currentQuantity - newOrders.find(o => o.id === orderId)!.quantity
      return {
        ...item,
        orders: newOrders,
        currentQuantity: Math.max(0, newCurrentQty),
        status: allDone && activeOrders.length > 0 ? 'completed' as const : 'grouping' as const,
      }
    }))
  }, [])

  const getMonthlyStats = useCallback((): MonthlyStats => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthItems = foodItems.filter(item => new Date(item.createdAt) >= monthStart)
    const completedItems = monthItems.filter(item => item.status === 'completed')
    const moneySaved = completedItems.reduce((sum, item) => sum + item.originalPrice - item.sharePrice, 0)
    const foodPortions = completedItems.reduce((sum, item) => sum + item.quantity, 0)
    const completedOrders = monthItems.reduce((sum, item) =>
      sum + item.orders.filter(o => o.pickedUp).length, 0)
    const noShowCount = monthItems.reduce((sum, item) =>
      sum + item.orders.filter(o => o.noShow).length, 0)
    const itemsShared = completedItems.length
    return { moneySaved, foodPortions, completedOrders, noShowCount, itemsShared }
  }, [foodItems])

  return (
    <StoreContext.Provider value={{
      foodItems,
      currentUser: CURRENT_USER,
      addFoodItem,
      addOrder,
      confirmPickup,
      markNoShow,
      getMonthlyStats,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export { NEIGHBORS }
