import { create } from 'zustand'
import type { Screening, Registration, ScreeningFormData, RegistrationFormData } from '@/types'

const SCREENINGS_KEY = 'open-air-cinema_screenings'
const REGISTRATIONS_KEY = 'open-air-cinema_registrations'

const defaultScreenings: Screening[] = [
  {
    id: '1',
    movieName: '千与千寻',
    date: '2026-06-19',
    location: '社区中央广场',
    seatLimit: 80,
    ageRating: '全年龄',
    posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20animated%20film%20poster%2C%20a%20girl%20riding%20on%20a%20train%20over%20water%2C%20spirited%20away%20style%2C%20dreamy%20blue%20sky%2C%20vibrant%20colors%2C%20Studio%20Ghibli%20aesthetic&image_size=landscape_16_9',
    weatherPlan: '如遇雨天，改至社区活动中心二楼大厅',
    isRescheduled: false,
    status: 'upcoming',
  },
  {
    id: '2',
    movieName: '寻梦环游记',
    date: '2026-06-26',
    location: '社区中央广场',
    seatLimit: 60,
    ageRating: '全年龄',
    posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Pixar%20animated%20film%20poster%2C%20a%20boy%20with%20guitar%20in%20colorful%20land%20of%20the%20dead%2C%20mexican%20day%20of%20the%20dead%20aesthetic%2C%20vibrant%20marigold%20flowers%2C%20warm%20glowing%20lights&image_size=landscape_16_9',
    weatherPlan: '如遇雨天，改至社区活动中心二楼大厅',
    isRescheduled: false,
    status: 'upcoming',
  },
  {
    id: '3',
    movieName: '星际穿越',
    date: '2026-07-03',
    location: '社区中央广场',
    seatLimit: 100,
    ageRating: '12岁以上',
    posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sci-fi%20film%20poster%2C%20astronaut%20near%20black%20hole%2C%20Interstellar%20style%2C%20dramatic%20space%20scene%2C%20wormhole%20with%20light%20bending%2C%20cosmic%20dust%2C%20dark%20deep%20space%20blue&image_size=landscape_16_9',
    weatherPlan: '如遇雨天，改至社区活动中心二楼大厅',
    isRescheduled: false,
    status: 'upcoming',
  },
]

const defaultRegistrations: Registration[] = [
  { id: 'r1', screeningId: '1', name: '张伟', peopleCount: 3, building: '3栋501', hasChildren: true, phone: '138****1234', status: 'confirmed', checkedIn: false, rescheduleNotified: false, createdAt: '2026-06-12T10:00:00Z' },
  { id: 'r2', screeningId: '1', name: '李娜', peopleCount: 2, building: '5栋302', hasChildren: false, phone: '139****5678', status: 'confirmed', checkedIn: true, rescheduleNotified: false, createdAt: '2026-06-12T11:00:00Z' },
  { id: 'r3', screeningId: '1', name: '王芳', peopleCount: 4, building: '2栋101', hasChildren: true, phone: '137****9012', status: 'confirmed', checkedIn: true, rescheduleNotified: false, createdAt: '2026-06-12T12:00:00Z' },
  { id: 'r4', screeningId: '2', name: '赵刚', peopleCount: 2, building: '7栋201', hasChildren: false, phone: '136****3456', status: 'confirmed', checkedIn: false, rescheduleNotified: false, createdAt: '2026-06-13T09:00:00Z' },
  { id: 'r5', screeningId: '2', name: '孙丽', peopleCount: 5, building: '1栋601', hasChildren: true, phone: '135****7890', status: 'confirmed', checkedIn: true, rescheduleNotified: false, createdAt: '2026-06-13T10:00:00Z' },
]

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key)
    if (data) return JSON.parse(data)
  } catch { /* empty */ }
  return fallback
}

function saveToStorage<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

interface CinemaStore {
  screenings: Screening[]
  registrations: Registration[]

  addScreening: (data: ScreeningFormData) => void
  updateScreening: (id: string, data: Partial<Screening>) => void
  rescheduleScreening: (id: string, newDate: string) => void
  deleteScreening: (id: string) => void

  register: (screeningId: string, data: RegistrationFormData) => 'confirmed' | 'waitlisted'
  cancelRegistration: (id: string) => void
  checkIn: (id: string) => void

  getScreeningRegistrations: (screeningId: string) => Registration[]
  getConfirmedCount: (screeningId: string) => number
  getWaitlisted: (screeningId: string) => Registration[]
  getChildrenCount: (screeningId: string) => number
  getAttendanceRate: (screeningId: string) => number
}

export const useCinemaStore = create<CinemaStore>((set, get) => ({
  screenings: loadFromStorage(SCREENINGS_KEY, defaultScreenings),
  registrations: loadFromStorage(REGISTRATIONS_KEY, defaultRegistrations),

  addScreening: (data) => {
    const screening: Screening = {
      id: generateId(),
      ...data,
      isRescheduled: false,
      status: 'upcoming',
    }
    set((state) => {
      const screenings = [...state.screenings, screening]
      saveToStorage(SCREENINGS_KEY, screenings)
      return { screenings }
    })
  },

  updateScreening: (id, data) => {
    set((state) => {
      const screenings = state.screenings.map((s) =>
        s.id === id ? { ...s, ...data } : s
      )
      saveToStorage(SCREENINGS_KEY, screenings)
      return { screenings }
    })
  },

  rescheduleScreening: (id, newDate) => {
    set((state) => {
      const screenings = state.screenings.map((s) =>
        s.id === id
          ? { ...s, isRescheduled: true, originalDate: s.date, date: newDate }
          : s
      )
      const registrations = state.registrations.map((r) =>
        r.screeningId === id && r.status !== 'cancelled'
          ? { ...r, rescheduleNotified: true }
          : r
      )
      saveToStorage(SCREENINGS_KEY, screenings)
      saveToStorage(REGISTRATIONS_KEY, registrations)
      return { screenings, registrations }
    })
  },

  deleteScreening: (id) => {
    set((state) => {
      const screenings = state.screenings.filter((s) => s.id !== id)
      const registrations = state.registrations.filter((r) => r.screeningId !== id)
      saveToStorage(SCREENINGS_KEY, screenings)
      saveToStorage(REGISTRATIONS_KEY, registrations)
      return { screenings, registrations }
    })
  },

  register: (screeningId, data) => {
    const screening = get().screenings.find((s) => s.id === screeningId)
    if (!screening) return 'waitlisted'

    const confirmedCount = get().getConfirmedCount(screeningId)
    const isConfirmed = confirmedCount + data.peopleCount <= screening.seatLimit

    const registration: Registration = {
      id: generateId(),
      screeningId,
      ...data,
      status: isConfirmed ? 'confirmed' : 'waitlisted',
      checkedIn: false,
      rescheduleNotified: false,
      createdAt: new Date().toISOString(),
    }

    set((state) => {
      const registrations = [...state.registrations, registration]
      saveToStorage(REGISTRATIONS_KEY, registrations)
      return { registrations }
    })

    return isConfirmed ? 'confirmed' : 'waitlisted'
  },

  cancelRegistration: (id) => {
    const registration = get().registrations.find((r) => r.id === id)
    if (!registration) return

    set((state) => {
      let registrations = state.registrations.map((r) =>
        r.id === id ? { ...r, status: 'cancelled' as const } : r
      )

      const screening = state.screenings.find((s) => s.id === registration.screeningId)
      if (!screening) return { registrations }

      const cancelledPeople = registration.peopleCount

      const confirmedAfter = registrations
        .filter((r) => r.screeningId === registration.screeningId && r.status === 'confirmed')
        .reduce((sum, r) => sum + r.peopleCount, 0)

      const freeSeats = screening.seatLimit - confirmedAfter

      const waitlisted = registrations
        .filter((r) => r.screeningId === registration.screeningId && r.status === 'waitlisted')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      let remaining = freeSeats
      const promoted: string[] = []
      for (const w of waitlisted) {
        if (remaining >= w.peopleCount) {
          promoted.push(w.id)
          remaining -= w.peopleCount
        }
      }

      registrations = registrations.map((r) =>
        promoted.includes(r.id) ? { ...r, status: 'confirmed' as const } : r
      )

      saveToStorage(REGISTRATIONS_KEY, registrations)
      return { registrations }
    })
  },

  checkIn: (id) => {
    set((state) => {
      const registrations = state.registrations.map((r) =>
        r.id === id ? { ...r, checkedIn: !r.checkedIn } : r
      )
      saveToStorage(REGISTRATIONS_KEY, registrations)
      return { registrations }
    })
  },

  getScreeningRegistrations: (screeningId) => {
    return get().registrations.filter((r) => r.screeningId === screeningId && r.status !== 'cancelled')
  },

  getConfirmedCount: (screeningId) => {
    return get()
      .registrations.filter((r) => r.screeningId === screeningId && r.status === 'confirmed')
      .reduce((sum, r) => sum + r.peopleCount, 0)
  },

  getWaitlisted: (screeningId) => {
    return get()
      .registrations.filter((r) => r.screeningId === screeningId && r.status === 'waitlisted')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  },

  getChildrenCount: (screeningId) => {
    return get()
      .registrations.filter((r) => r.screeningId === screeningId && r.status === 'confirmed' && r.hasChildren)
      .reduce((sum, r) => sum + Math.max(1, Math.floor(r.peopleCount / 2)), 0)
  },

  getAttendanceRate: (screeningId) => {
    const regs = get().registrations.filter(
      (r) => r.screeningId === screeningId && r.status === 'confirmed'
    )
    if (regs.length === 0) return 0
    const checkedInCount = regs.filter((r) => r.checkedIn).reduce((s, r) => s + r.peopleCount, 0)
    const totalCount = regs.reduce((s, r) => s + r.peopleCount, 0)
    return totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0
  },
}))
