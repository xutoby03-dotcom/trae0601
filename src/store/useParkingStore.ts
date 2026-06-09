import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ParkingSpot, ParkingApplication, StatsRecord, DaySlot, VehicleSize, ApplicationStatus } from '@/types'

const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export { DAY_NAMES }

const mockSpots: ParkingSpot[] = [
  {
    id: 'spot-1',
    building: '3栋',
    spotNumber: 'B2-045',
    isWallAdjacent: true,
    vehicleSize: 'any',
    availableSlots: [
      { dayOfWeek: new Date().getDay(), startTime: '18:00', endTime: '23:59' },
      { dayOfWeek: (new Date().getDay() + 1) % 7, startTime: '00:00', endTime: '08:00' },
    ],
    contactPhone: '138****6789',
    ownerId: 'user-1',
    ownerName: '张先生',
    status: 'available',
  },
  {
    id: 'spot-2',
    building: '5栋',
    spotNumber: 'B1-112',
    isWallAdjacent: false,
    vehicleSize: 'medium',
    availableSlots: [
      { dayOfWeek: new Date().getDay(), startTime: '19:00', endTime: '23:59' },
    ],
    contactPhone: '139****2345',
    ownerId: 'user-2',
    ownerName: '李女士',
    status: 'available',
  },
  {
    id: 'spot-3',
    building: '1栋',
    spotNumber: 'B3-007',
    isWallAdjacent: true,
    vehicleSize: 'small',
    availableSlots: [
      { dayOfWeek: 6, startTime: '08:00', endTime: '22:00' },
      { dayOfWeek: 0, startTime: '08:00', endTime: '22:00' },
    ],
    contactPhone: '137****8901',
    ownerId: 'user-3',
    ownerName: '王先生',
    status: 'available',
  },
  {
    id: 'spot-4',
    building: '7栋',
    spotNumber: 'B1-201',
    isWallAdjacent: false,
    vehicleSize: 'suv',
    availableSlots: [
      { dayOfWeek: new Date().getDay(), startTime: '20:30', endTime: '23:59' },
      { dayOfWeek: (new Date().getDay() + 1) % 7, startTime: '00:00', endTime: '07:00' },
    ],
    contactPhone: '136****5678',
    ownerId: 'user-4',
    ownerName: '赵女士',
    status: 'available',
  },
  {
    id: 'spot-5',
    building: '2栋',
    spotNumber: 'B2-088',
    isWallAdjacent: true,
    vehicleSize: 'any',
    availableSlots: [
      { dayOfWeek: 6, startTime: '09:00', endTime: '20:00' },
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00' },
    ],
    contactPhone: '135****4321',
    ownerId: 'user-5',
    ownerName: '陈先生',
    status: 'available',
  },
  {
    id: 'spot-6',
    building: '3栋',
    spotNumber: 'B1-056',
    isWallAdjacent: false,
    vehicleSize: 'medium',
    availableSlots: [
      { dayOfWeek: new Date().getDay(), startTime: '17:00', endTime: '23:59' },
    ],
    contactPhone: '133****7654',
    ownerId: 'user-6',
    ownerName: '刘女士',
    status: 'in_use',
  },
]

const mockApplications: ParkingApplication[] = [
  {
    id: 'app-1',
    spotId: 'spot-6',
    applicantId: 'user-7',
    applicantName: '周先生',
    licensePlate: '粤A·12345',
    estimatedHours: 3,
    isEV: true,
    hasLargeItems: false,
    status: 'active',
    startTime: new Date(Date.now() - 2 * 3600000).toISOString(),
    endTime: '',
    isOvertime: false,
    isWrongSpot: false,
  },
  {
    id: 'app-2',
    spotId: 'spot-1',
    applicantId: 'user-8',
    applicantName: '吴女士',
    licensePlate: '粤B·67890',
    estimatedHours: 2,
    isEV: false,
    hasLargeItems: true,
    status: 'pending',
    startTime: '',
    endTime: '',
    isOvertime: false,
    isWrongSpot: false,
  },
  {
    id: 'app-3',
    spotId: 'spot-2',
    applicantId: 'user-9',
    applicantName: '郑先生',
    licensePlate: '粤A·55555',
    estimatedHours: 4,
    isEV: true,
    hasLargeItems: false,
    status: 'pending',
    startTime: '',
    endTime: '',
    isOvertime: false,
    isWrongSpot: false,
  },
]

const mockStats: StatsRecord[] = [
  { id: 'stat-1', spotId: 'spot-1', applicationId: 'app-prev-1', usedHours: 3, isOvertime: false, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'stat-2', spotId: 'spot-2', applicationId: 'app-prev-2', usedHours: 5, isOvertime: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'stat-3', spotId: 'spot-3', applicationId: 'app-prev-3', usedHours: 8, isOvertime: false, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'stat-4', spotId: 'spot-1', applicationId: 'app-prev-4', usedHours: 2, isOvertime: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'stat-5', spotId: 'spot-5', applicationId: 'app-prev-5', usedHours: 6, isOvertime: false, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
]

interface ParkingStore {
  spots: ParkingSpot[]
  applications: ParkingApplication[]
  stats: StatsRecord[]
  currentUserId: string
  addSpot: (spot: Omit<ParkingSpot, 'id' | 'ownerId' | 'ownerName' | 'status'>) => void
  updateSpot: (id: string, updates: Partial<ParkingSpot>) => void
  addApplication: (app: Omit<ParkingApplication, 'id' | 'status' | 'startTime' | 'endTime' | 'isOvertime' | 'isWrongSpot'>) => void
  approveApplication: (id: string) => void
  rejectApplication: (id: string) => void
  completeParking: (id: string, isOvertime: boolean, isWrongSpot: boolean) => void
  getSpotById: (id: string) => ParkingSpot | undefined
  getApplicationsBySpotId: (spotId: string) => ParkingApplication[]
  getApplicationsByApplicant: (applicantId: string) => ParkingApplication[]
  getSpotsByOwner: (ownerId: string) => ParkingSpot[]
  getTonightAvailable: () => ParkingSpot[]
  getWeekendAvailable: () => ParkingSpot[]
  getStartingSoon: () => ParkingSpot[]
  getTotalUsedHours: () => number
  getSpotUtilizationRate: (spotId: string) => number
  getTopBorrowers: () => { name: string; count: number }[]
  getOvertimeCount: () => number
  getOvertimeRecords: () => (StatsRecord & { spotInfo: string })[]
}

export const useParkingStore = create<ParkingStore>()(
  persist(
    (set, get) => ({
      spots: mockSpots,
      applications: mockApplications,
      stats: mockStats,
      currentUserId: 'user-1',

      addSpot: (spot) => {
        const id = `spot-${Date.now()}`
        const newSpot: ParkingSpot = {
          ...spot,
          id,
          ownerId: get().currentUserId,
          ownerName: '张先生',
          status: 'available',
        }
        set((state) => ({ spots: [...state.spots, newSpot] }))
      },

      updateSpot: (id, updates) => {
        set((state) => ({
          spots: state.spots.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }))
      },

      addApplication: (app) => {
        const id = `app-${Date.now()}`
        const newApp: ParkingApplication = {
          ...app,
          id,
          status: 'pending',
          startTime: '',
          endTime: '',
          isOvertime: false,
          isWrongSpot: false,
        }
        set((state) => {
          const spot = state.spots.find((s) => s.id === app.spotId)
          return {
            applications: [...state.applications, newApp],
            spots: spot
              ? state.spots.map((s) =>
                  s.id === app.spotId ? { ...s, status: 'pending' as const } : s
                )
              : state.spots,
          }
        })
      },

      approveApplication: (id) => {
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id
              ? { ...a, status: 'active' as ApplicationStatus, startTime: new Date().toISOString() }
              : a
          ),
          spots: state.spots.map((s) => {
            const app = state.applications.find((a) => a.id === id)
            return app && s.id === app.spotId ? { ...s, status: 'in_use' as const } : s
          }),
        }))
      },

      rejectApplication: (id) => {
        set((state) => {
          const app = state.applications.find((a) => a.id === id)
          const otherActiveApps = state.applications.filter(
            (a) => a.spotId === app?.spotId && a.id !== id && a.status === 'pending'
          )
          return {
            applications: state.applications.map((a) =>
              a.id === id ? { ...a, status: 'rejected' as ApplicationStatus } : a
            ),
            spots: state.spots.map((s) =>
              app && s.id === app.spotId && otherActiveApps.length === 0
                ? { ...s, status: 'available' as const }
                : s
            ),
          }
        })
      },

      completeParking: (id, isOvertime, isWrongSpot) => {
        set((state) => {
          const app = state.applications.find((a) => a.id === id)
          if (!app) return state

          const endTime = new Date().toISOString()
          const startTime = app.startTime ? new Date(app.startTime).getTime() : Date.now()
          const usedHours = Math.round(((Date.now() - startTime) / 3600000) * 10) / 10

          const statRecord: StatsRecord = {
            id: `stat-${Date.now()}`,
            spotId: app.spotId,
            applicationId: id,
            usedHours,
            isOvertime,
            createdAt: new Date().toISOString(),
          }

          return {
            applications: state.applications.map((a) =>
              a.id === id
                ? { ...a, status: 'completed' as ApplicationStatus, endTime, isOvertime, isWrongSpot }
                : a
            ),
            spots: state.spots.map((s) =>
              s.id === app.spotId ? { ...s, status: 'available' as const } : s
            ),
            stats: [...state.stats, statRecord],
          }
        })
      },

      getSpotById: (id) => get().spots.find((s) => s.id === id),

      getApplicationsBySpotId: (spotId) =>
        get().applications.filter((a) => a.spotId === spotId),

      getApplicationsByApplicant: (applicantId) =>
        get().applications.filter((a) => a.applicantId === applicantId),

      getSpotsByOwner: (ownerId) => get().spots.filter((s) => s.ownerId === ownerId),

      getTonightAvailable: () => {
        const now = new Date()
        const today = now.getDay()
        const currentHour = now.getHours()
        return get().spots.filter((spot) => {
          if (spot.status !== 'available') return false
          return spot.availableSlots.some(
            (slot) => slot.dayOfWeek === today && parseInt(slot.startTime.split(':')[0]) >= currentHour
          )
        })
      },

      getWeekendAvailable: () => {
        const now = new Date()
        const today = now.getDay()
        const isWeekend = today === 0 || today === 6 || (today === 5 && now.getHours() >= 18)
        return get().spots.filter((spot) => {
          if (spot.status !== 'available') return false
          if (isWeekend) {
            return spot.availableSlots.some((slot) => slot.dayOfWeek === 0 || slot.dayOfWeek === 6)
          }
          return spot.availableSlots.some((slot) => slot.dayOfWeek === 6 || slot.dayOfWeek === 0)
        })
      },

      getStartingSoon: () => {
        const now = new Date()
        const today = now.getDay()
        const currentMinutes = now.getHours() * 60 + now.getMinutes()
        return get().spots.filter((spot) => {
          if (spot.status !== 'available') return false
          return spot.availableSlots.some((slot) => {
            if (slot.dayOfWeek !== today) return false
            const [h, m] = slot.startTime.split(':').map(Number)
            const slotMinutes = h * 60 + m
            return slotMinutes > currentMinutes && slotMinutes - currentMinutes <= 30
          })
        })
      },

      getTotalUsedHours: () => get().stats.reduce((sum, s) => sum + s.usedHours, 0),

      getSpotUtilizationRate: (spotId) => {
        const spotStats = get().stats.filter((s) => s.spotId === spotId)
        const totalHours = spotStats.reduce((sum, s) => sum + s.usedHours, 0)
        const daysActive = Math.max(
          1,
          Math.ceil(
            (Date.now() -
              new Date(
                spotStats.length > 0
                  ? spotStats[spotStats.length - 1].createdAt
                  : Date.now()
              ).getTime()) /
              86400000
          )
        )
        return Math.round((totalHours / (daysActive * 24)) * 100)
      },

      getTopBorrowers: () => {
        const appMap = new Map<string, { name: string; count: number }>()
        get().applications
          .filter((a) => a.status === 'completed' || a.status === 'active')
          .forEach((a) => {
            const existing = appMap.get(a.applicantId)
            if (existing) {
              existing.count++
            } else {
              appMap.set(a.applicantId, { name: a.applicantName, count: 1 })
            }
          })
        return Array.from(appMap.values()).sort((a, b) => b.count - a.count)
      },

      getOvertimeCount: () => get().stats.filter((s) => s.isOvertime).length,

      getOvertimeRecords: () => {
        const spots = get().spots
        return get().stats
          .filter((s) => s.isOvertime)
          .map((s) => {
            const spot = spots.find((sp) => sp.id === s.spotId)
            return {
              ...s,
              spotInfo: spot ? `${spot.building}-${spot.spotNumber}` : '未知车位',
            }
          })
      },
    }),
    {
      name: 'parking-store',
    }
  )
)

export const VEHICLE_SIZE_LABELS: Record<VehicleSize, string> = {
  small: '小型车',
  medium: '中型车',
  suv: 'SUV',
  any: '不限',
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: '待审批',
  approved: '已同意',
  rejected: '已拒绝',
  active: '使用中',
  completed: '已完成',
}

export const SPOT_STATUS_LABELS: Record<string, string> = {
  available: '空闲',
  in_use: '使用中',
  pending: '待审批',
}

export function formatDaySlots(slots: DaySlot[]): string {
  if (slots.length === 0) return '暂无'
  return slots
    .map((s) => `${DAY_NAMES[s.dayOfWeek]} ${s.startTime}-${s.endTime}`)
    .join('、')
}
