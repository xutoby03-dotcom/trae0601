import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locker, Package, LockerSize, LockerStatus, DashboardStats } from '@/types'
import { generateId, isUrgent, isToday } from '@/utils/helpers'

const now = new Date()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString()
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString()

const INITIAL_LOCKERS: Locker[] = [
  { id: 'l1', code: 'A-01', size: 'small', location: '前台左侧-第1排', isRefrigerated: false, photo: '', status: 'empty', currentPackageId: null, createdAt: daysAgo(30) },
  { id: 'l2', code: 'A-02', size: 'medium', location: '前台左侧-第1排', isRefrigerated: false, photo: '', status: 'empty', currentPackageId: null, createdAt: daysAgo(30) },
  { id: 'l3', code: 'A-03', size: 'medium', location: '前台左侧-第1排', isRefrigerated: false, photo: '', status: 'empty', currentPackageId: null, createdAt: daysAgo(30) },
  { id: 'l4', code: 'A-04', size: 'large', location: '前台左侧-第2排', isRefrigerated: false, photo: '', status: 'empty', currentPackageId: null, createdAt: daysAgo(30) },
  { id: 'l5', code: 'A-05', size: 'large', location: '前台左侧-第2排', isRefrigerated: false, photo: '', status: 'empty', currentPackageId: null, createdAt: daysAgo(30) },
  { id: 'l6', code: 'A-06', size: 'xlarge', location: '前台左侧-第3排', isRefrigerated: false, photo: '', status: 'empty', currentPackageId: null, createdAt: daysAgo(30) },
  { id: 'l7', code: 'B-01', size: 'small', location: '前台右侧-冷藏区', isRefrigerated: true, photo: '', status: 'empty', currentPackageId: null, createdAt: daysAgo(25) },
  { id: 'l8', code: 'B-02', size: 'medium', location: '前台右侧-冷藏区', isRefrigerated: true, photo: '', status: 'empty', currentPackageId: null, createdAt: daysAgo(25) },
  { id: 'l9', code: 'B-03', size: 'medium', location: '前台右侧-冷藏区', isRefrigerated: true, photo: '', status: 'empty', currentPackageId: null, createdAt: daysAgo(25) },
  { id: 'l10', code: 'B-04', size: 'large', location: '前台右侧-冷藏区', isRefrigerated: true, photo: '', status: 'empty', currentPackageId: null, createdAt: daysAgo(25) },
  { id: 'l11', code: 'C-01', size: 'small', location: '走廊入口-第1排', isRefrigerated: false, photo: '', status: 'empty', currentPackageId: null, createdAt: daysAgo(20) },
  { id: 'l12', code: 'C-02', size: 'medium', location: '走廊入口-第1排', isRefrigerated: false, photo: '', status: 'empty', currentPackageId: null, createdAt: daysAgo(20) },
]

const INITIAL_PACKAGES: Package[] = [
  { id: 'p1', lockerId: 'l2', recipientName: '张伟', phoneLastFour: '1234', expressCompany: '顺丰速运', size: 'medium', isFragile: false, inTime: hoursAgo(2), outTime: null, isPickedUp: false, isUrgent: false, createdAt: hoursAgo(2) },
  { id: 'p2', lockerId: 'l7', recipientName: '李娜', phoneLastFour: '5678', expressCompany: '京东物流', size: 'small', isFragile: true, inTime: hoursAgo(5), outTime: null, isPickedUp: false, isUrgent: false, createdAt: hoursAgo(5) },
  { id: 'p3', lockerId: 'l4', recipientName: '王强', phoneLastFour: '9012', expressCompany: '中通快递', size: 'large', isFragile: false, inTime: hoursAgo(52), outTime: null, isPickedUp: false, isUrgent: true, createdAt: hoursAgo(52) },
  { id: 'p4', lockerId: 'l8', recipientName: '刘芳', phoneLastFour: '3456', expressCompany: '圆通速递', size: 'medium', isFragile: true, inTime: hoursAgo(60), outTime: null, isPickedUp: false, isUrgent: true, createdAt: hoursAgo(60) },
  { id: 'p5', lockerId: 'l1', recipientName: '陈明', phoneLastFour: '7890', expressCompany: '顺丰速运', size: 'small', isFragile: false, inTime: hoursAgo(1), outTime: null, isPickedUp: false, isUrgent: false, createdAt: hoursAgo(1) },
  { id: 'p6', lockerId: '', recipientName: '赵磊', phoneLastFour: '2345', expressCompany: '韵达快递', size: 'medium', isFragile: false, inTime: hoursAgo(30), outTime: hoursAgo(10), isPickedUp: true, isUrgent: false, createdAt: hoursAgo(30) },
]

INITIAL_LOCKERS[1].status = 'occupied'; INITIAL_LOCKERS[1].currentPackageId = 'p1'
INITIAL_LOCKERS[6].status = 'occupied'; INITIAL_LOCKERS[6].currentPackageId = 'p2'
INITIAL_LOCKERS[3].status = 'urgent'; INITIAL_LOCKERS[3].currentPackageId = 'p3'
INITIAL_LOCKERS[7].status = 'urgent'; INITIAL_LOCKERS[7].currentPackageId = 'p4'
INITIAL_LOCKERS[0].status = 'occupied'; INITIAL_LOCKERS[0].currentPackageId = 'p5'

interface AppState {
  lockers: Locker[]
  packages: Package[]

  addLocker: (data: Omit<Locker, 'id' | 'status' | 'currentPackageId' | 'createdAt'>) => void
  updateLocker: (id: string, data: Partial<Locker>) => void
  deleteLocker: (id: string) => void
  getLocker: (id: string) => Locker | undefined
  getLockerByCode: (code: string) => Locker | undefined

  checkInPackage: (data: { lockerId: string; recipientName: string; phoneLastFour: string; expressCompany: string; size: LockerSize; isFragile: boolean }) => void
  checkOutPackage: (packageId: string) => void
  findPackagesByPhone: (phoneLastFour: string) => Package[]
  getPackageById: (id: string) => Package | undefined
  getPackagesByLockerId: (lockerId: string) => Package[]

  getDashboardStats: () => DashboardStats
  getUrgentPackages: () => Package[]
  getRefrigeratedPackages: () => Package[]
  getActivePackages: () => Package[]

  refreshUrgentStatus: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      lockers: INITIAL_LOCKERS,
      packages: INITIAL_PACKAGES,

      addLocker: (data) => {
        const newLocker: Locker = {
          ...data,
          id: generateId(),
          status: 'empty',
          currentPackageId: null,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ lockers: [...state.lockers, newLocker] }))
      },

      updateLocker: (id, data) => {
        set((state) => ({
          lockers: state.lockers.map((l) => (l.id === id ? { ...l, ...data } : l)),
        }))
      },

      deleteLocker: (id) => {
        set((state) => ({
          lockers: state.lockers.filter((l) => l.id !== id),
        }))
      },

      getLocker: (id) => {
        return get().lockers.find((l) => l.id === id)
      },

      getLockerByCode: (code) => {
        return get().lockers.find((l) => l.code === code)
      },

      checkInPackage: (data) => {
        const pkg: Package = {
          id: generateId(),
          ...data,
          inTime: new Date().toISOString(),
          outTime: null,
          isPickedUp: false,
          isUrgent: false,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          packages: [...state.packages, pkg],
          lockers: state.lockers.map((l) =>
            l.id === data.lockerId ? { ...l, status: 'occupied', currentPackageId: pkg.id } : l
          ),
        }))
      },

      checkOutPackage: (packageId) => {
        const state = get()
        const pkg = state.packages.find((p) => p.id === packageId)
        if (!pkg) return
        set({
          packages: state.packages.map((p) =>
            p.id === packageId
              ? { ...p, isPickedUp: true, outTime: new Date().toISOString(), isUrgent: false }
              : p
          ),
          lockers: state.lockers.map((l) =>
            l.id === pkg.lockerId ? { ...l, status: 'empty', currentPackageId: null } : l
          ),
        })
      },

      findPackagesByPhone: (phoneLastFour) => {
        return get()
          .packages.filter((p) => p.phoneLastFour === phoneLastFour && !p.isPickedUp)
          .sort((a, b) => new Date(a.inTime).getTime() - new Date(b.inTime).getTime())
      },

      getPackageById: (id) => {
        return get().packages.find((p) => p.id === id)
      },

      getPackagesByLockerId: (lockerId) => {
        return get().packages.filter((p) => p.lockerId === lockerId)
      },

      getDashboardStats: () => {
        const state = get()
        const { lockers, packages } = state
        const activePackages = packages.filter((p) => !p.isPickedUp)
        const emptyLockers = lockers.filter((l) => l.status === 'empty').length
        const occupiedLockers = lockers.length - emptyLockers
        const urgentPackages = activePackages.filter((p) => p.isUrgent).length
        const todayInCount = packages.filter((p) => isToday(p.inTime)).length
        const expressCounts: Record<string, number> = {}
        activePackages.forEach((p) => {
          expressCounts[p.expressCompany] = (expressCounts[p.expressCompany] || 0) + 1
        })
        const refrigeratedPackages = activePackages.filter((p) => {
          const locker = lockers.find((l) => l.id === p.lockerId)
          return locker?.isRefrigerated
        })
        return {
          emptyLockers,
          occupiedLockers,
          totalLockers: lockers.length,
          urgentPackages,
          todayInCount,
          expressCounts,
          refrigeratedPackages,
        }
      },

      getUrgentPackages: () => {
        return get().packages.filter((p) => !p.isPickedUp && p.isUrgent)
      },

      getRefrigeratedPackages: () => {
        const state = get()
        return state.packages.filter((p) => {
          if (p.isPickedUp) return false
          const locker = state.lockers.find((l) => l.id === p.lockerId)
          return locker?.isRefrigerated
        })
      },

      getActivePackages: () => {
        return get().packages.filter((p) => !p.isPickedUp)
      },

      refreshUrgentStatus: () => {
        const state = get()
        const updatedPackages = state.packages.map((p) => {
          if (p.isPickedUp) return p
          const urgent = isUrgent(p.inTime)
          return { ...p, isUrgent: urgent }
        })
        const updatedLockers: Locker[] = state.lockers.map((l) => {
          if (l.status === 'empty') return l
          const pkg = updatedPackages.find((p) => p.id === l.currentPackageId)
          if (!pkg) return { ...l, status: 'empty' as LockerStatus, currentPackageId: null }
          return { ...l, status: (pkg.isUrgent ? 'urgent' : 'occupied') as LockerStatus }
        })
        set({ packages: updatedPackages, lockers: updatedLockers })
      },
    }),
    {
      name: 'parcel-locker-storage',
    }
  )
)
