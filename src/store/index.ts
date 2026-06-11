import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Application, Board, Club, UserRole, Conflict } from '@/types'

const BOARDS: Board[] = [
  { id: 'board-1', name: 'A区-左侧', location: '食堂正门左侧', positionX: 15, positionY: 40 },
  { id: 'board-2', name: 'A区-右侧', location: '食堂正门右侧', positionX: 45, positionY: 40 },
  { id: 'board-3', name: 'B区-左侧', location: '食堂侧门左侧', positionX: 15, positionY: 70 },
  { id: 'board-4', name: 'B区-右侧', location: '食堂侧门右侧', positionX: 45, positionY: 70 },
  { id: 'board-5', name: 'C区-中央', location: '食堂正门中央', positionX: 30, positionY: 25 },
  { id: 'board-6', name: 'D区-廊道', location: '食堂连廊通道', positionX: 70, positionY: 55 },
]

const CLUBS: Club[] = [
  { name: '编程社', password: '123456' },
  { name: '摄影社', password: '123456' },
  { name: '话剧社', password: '123456' },
  { name: '吉他社', password: '123456' },
  { name: '书法社', password: '123456' },
  { name: '篮球社', password: '123456' },
]

const today = new Date()
const fmt = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }

const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app-1', activityName: '秋季编程马拉松', clubName: '编程社', boardId: 'board-1',
    startDate: fmt(addDays(today, -5)), endDate: fmt(addDays(today, -1)),
    size: 'A1', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hackathon%20poster%20colorful%20coding&image_size=landscape_16_9',
    contact: '张同学', status: 'expired', postedPhotoUrl: '', removedPhotoUrl: '', postedAt: fmt(addDays(today, -5)), removedAt: '', createdAt: fmt(addDays(today, -10))
  },
  {
    id: 'app-2', activityName: '光影摄影展', clubName: '摄影社', boardId: 'board-2',
    startDate: fmt(addDays(today, 1)), endDate: fmt(addDays(today, 7)),
    size: 'A2', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=photography%20exhibition%20poster%20elegant&image_size=landscape_16_9',
    contact: '李同学', status: 'approved', postedPhotoUrl: '', removedPhotoUrl: '', postedAt: '', removedAt: '', createdAt: fmt(addDays(today, -3))
  },
  {
    id: 'app-3', activityName: '春季话剧之夜', clubName: '话剧社', boardId: 'board-1',
    startDate: fmt(addDays(today, 2)), endDate: fmt(addDays(today, 8)),
    size: 'A1', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=drama%20night%20poster%20theatrical&image_size=landscape_16_9',
    contact: '王同学', status: 'pending', postedPhotoUrl: '', removedPhotoUrl: '', postedAt: '', removedAt: '', createdAt: fmt(addDays(today, -1))
  },
  {
    id: 'app-4', activityName: '吉他弹唱会', clubName: '吉他社', boardId: 'board-3',
    startDate: fmt(addDays(today, 3)), endDate: fmt(addDays(today, 9)),
    size: 'A2', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=guitar%20concert%20poster%20warm&image_size=landscape_16_9',
    contact: '赵同学', status: 'pending', postedPhotoUrl: '', removedPhotoUrl: '', postedAt: '', removedAt: '', createdAt: fmt(addDays(today, -1))
  },
  {
    id: 'app-5', activityName: '书法体验课', clubName: '书法社', boardId: 'board-1',
    startDate: fmt(addDays(today, 1)), endDate: fmt(addDays(today, 6)),
    size: 'A3', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=calligraphy%20workshop%20poster%20ink&image_size=landscape_16_9',
    contact: '孙同学', status: 'pending', postedPhotoUrl: '', removedPhotoUrl: '', postedAt: '', removedAt: '', createdAt: fmt(addDays(today, 0))
  },
  {
    id: 'app-6', activityName: '3v3篮球赛', clubName: '篮球社', boardId: 'board-4',
    startDate: fmt(addDays(today, 5)), endDate: fmt(addDays(today, 12)),
    size: 'A1', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=basketball%20tournament%20poster%20dynamic&image_size=landscape_16_9',
    contact: '周同学', status: 'approved', postedPhotoUrl: '', removedPhotoUrl: '', postedAt: '', removedAt: '', createdAt: fmt(addDays(today, -2))
  },
  {
    id: 'app-7', activityName: 'Python入门讲座', clubName: '编程社', boardId: 'board-2',
    startDate: fmt(addDays(today, 2)), endDate: fmt(addDays(today, 6)),
    size: 'A2', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=python%20lecture%20poster%20tech&image_size=landscape_16_9',
    contact: '吴同学', status: 'pending', postedPhotoUrl: '', removedPhotoUrl: '', postedAt: '', removedAt: '', createdAt: fmt(addDays(today, 0))
  },
  {
    id: 'app-8', activityName: '街头摄影大赛', clubName: '摄影社', boardId: 'board-5',
    startDate: fmt(addDays(today, -3)), endDate: fmt(addDays(today, 3)),
    size: 'A1', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=street%20photography%20contest%20urban&image_size=landscape_16_9',
    contact: '郑同学', status: 'approved', postedPhotoUrl: '', removedPhotoUrl: '', postedAt: fmt(addDays(today, -3)), removedAt: '', createdAt: fmt(addDays(today, -7))
  },
]

function detectConflicts(applications: Application[]): Conflict[] {
  const conflicts: Conflict[] = []
  const approvedOrPending = applications.filter(a => a.status === 'approved' || a.status === 'pending')

  for (let i = 0; i < approvedOrPending.length; i++) {
    for (let j = i + 1; j < approvedOrPending.length; j++) {
      const a = approvedOrPending[i]
      const b = approvedOrPending[j]
      if (a.boardId !== b.boardId) continue
      const aStart = new Date(a.startDate).getTime()
      const aEnd = new Date(a.endDate).getTime()
      const bStart = new Date(b.startDate).getTime()
      const bEnd = new Date(b.endDate).getTime()
      if (aStart <= bEnd && bStart <= aEnd) {
        conflicts.push({
          applicationA: a,
          applicationB: b,
          boardId: a.boardId,
          overlapStart: new Date(Math.max(aStart, bStart)).toISOString().slice(0, 10),
          overlapEnd: new Date(Math.min(aEnd, bEnd)).toISOString().slice(0, 10),
        })
      }
    }
  }
  return conflicts
}

interface AppState {
  applications: Application[]
  boards: Board[]
  clubs: Club[]
  currentUser: { role: UserRole; name: string } | null
  login: (name: string, password: string, role: UserRole) => boolean
  logout: () => void
  addApplication: (app: Omit<Application, 'id' | 'status' | 'postedPhotoUrl' | 'removedPhotoUrl' | 'postedAt' | 'removedAt' | 'createdAt'>) => void
  approveApplication: (id: string) => void
  rejectApplication: (id: string) => void
  uploadPostedPhoto: (id: string, photoUrl: string) => void
  uploadRemovedPhoto: (id: string, photoUrl: string) => void
  confirmRemoval: (id: string) => void
  getConflicts: () => Conflict[]
  getExpiredNotRemoved: () => Application[]
}

let idCounter = 100
const genId = () => `app-${++idCounter}`

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      applications: MOCK_APPLICATIONS,
      boards: BOARDS,
      clubs: CLUBS,
      currentUser: null,

      login: (name, password, role) => {
        if (role === 'admin') {
          if (name === 'admin' && password === 'admin123') {
            set({ currentUser: { role: 'admin', name: '管理员' } })
            return true
          }
          return false
        }
        const club = get().clubs.find(c => c.name === name && c.password === password)
        if (club) {
          set({ currentUser: { role: 'club', name: club.name } })
          return true
        }
        return false
      },

      logout: () => set({ currentUser: null }),

      addApplication: (app) => {
        const newApp: Application = {
          ...app,
          id: genId(),
          status: 'pending',
          postedPhotoUrl: '',
          removedPhotoUrl: '',
          postedAt: '',
          removedAt: '',
          createdAt: new Date().toISOString().slice(0, 10),
        }
        set(state => ({ applications: [...state.applications, newApp] }))
      },

      approveApplication: (id) => {
        set(state => ({
          applications: state.applications.map(a =>
            a.id === id ? { ...a, status: 'approved' as const } : a
          )
        }))
      },

      rejectApplication: (id) => {
        set(state => ({
          applications: state.applications.map(a =>
            a.id === id ? { ...a, status: 'rejected' as const } : a
          )
        }))
      },

      uploadPostedPhoto: (id, photoUrl) => {
        set(state => ({
          applications: state.applications.map(a =>
            a.id === id ? { ...a, postedPhotoUrl: photoUrl, postedAt: new Date().toISOString().slice(0, 10) } : a
          )
        }))
      },

      uploadRemovedPhoto: (id, photoUrl) => {
        set(state => ({
          applications: state.applications.map(a =>
            a.id === id ? { ...a, removedPhotoUrl: photoUrl, removedAt: new Date().toISOString().slice(0, 10) } : a
          )
        }))
      },

      confirmRemoval: (id) => {
        set(state => ({
          applications: state.applications.map(a =>
            a.id === id ? { ...a, status: 'expired' as const } : a
          )
        }))
      },

      getConflicts: () => detectConflicts(get().applications),

      getExpiredNotRemoved: () => {
        const today = new Date().toISOString().slice(0, 10)
        return get().applications.filter(
          a => a.status === 'approved' && a.endDate < today && !a.removedPhotoUrl
        )
      },
    }),
    { name: 'board-booking-store' }
  )
)
