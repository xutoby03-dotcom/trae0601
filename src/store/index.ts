import { NapSpot, Reservation } from '../types'

const SPOTS_KEY = 'nap_spots'
const RESERVATIONS_KEY = 'nap_reservations'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {}
  return fallback
}

function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

const SEED_SPOTS: NapSpot[] = [
  {
    id: 'spot-1', name: 'A1躺椅', area: 'A区-窗边', seatType: 'lounge',
    capacity: 1, hasLightBlocking: true, nearAC: false,
    availableFrom: '12:00', availableTo: '14:00',
    rules: '请轻声，手机静音', gridRow: 1, gridCol: 1, status: 'available',
  },
  {
    id: 'spot-2', name: 'A2躺椅', area: 'A区-窗边', seatType: 'lounge',
    capacity: 1, hasLightBlocking: true, nearAC: false,
    availableFrom: '12:00', availableTo: '14:00',
    rules: '请轻声，手机静音', gridRow: 1, gridCol: 2, status: 'available',
  },
  {
    id: 'spot-3', name: 'A3躺椅', area: 'A区-窗边', seatType: 'lounge',
    capacity: 1, hasLightBlocking: false, nearAC: true,
    availableFrom: '12:00', availableTo: '13:30',
    rules: '限午休时段使用', gridRow: 1, gridCol: 3, status: 'available',
  },
  {
    id: 'spot-4', name: 'B1沙发位', area: 'B区-休息室', seatType: 'sofa',
    capacity: 2, hasLightBlocking: true, nearAC: true,
    availableFrom: '12:00', availableTo: '14:00',
    rules: '可两人共坐，请保持安静', gridRow: 2, gridCol: 1, status: 'available',
  },
  {
    id: 'spot-5', name: 'B2沙发位', area: 'B区-休息室', seatType: 'sofa',
    capacity: 2, hasLightBlocking: true, nearAC: true,
    availableFrom: '12:00', availableTo: '14:00',
    rules: '可两人共坐，请保持安静', gridRow: 2, gridCol: 2, status: 'available',
  },
  {
    id: 'spot-6', name: 'C1安静角', area: 'C区-会议室旁', seatType: 'quiet_corner',
    capacity: 1, hasLightBlocking: true, nearAC: false,
    availableFrom: '12:00', availableTo: '13:30',
    rules: '完全静音区域，禁止交谈', gridRow: 2, gridCol: 3, status: 'available',
  },
  {
    id: 'spot-7', name: 'C2安静角', area: 'C区-会议室旁', seatType: 'quiet_corner',
    capacity: 1, hasLightBlocking: true, nearAC: false,
    availableFrom: '12:30', availableTo: '14:00',
    rules: '完全静音区域，禁止交谈', gridRow: 3, gridCol: 1, status: 'available',
  },
  {
    id: 'spot-8', name: 'D1沙发位', area: 'D区-茶水间旁', seatType: 'sofa',
    capacity: 3, hasLightBlocking: false, nearAC: true,
    availableFrom: '12:00', availableTo: '14:00',
    rules: '可能有轻微声音，适合不太敏感的同事', gridRow: 3, gridCol: 2, status: 'available',
  },
  {
    id: 'spot-9', name: 'E1躺椅', area: 'E区-走廊尽头', seatType: 'lounge',
    capacity: 1, hasLightBlocking: true, nearAC: false,
    availableFrom: '12:00', availableTo: '13:45',
    rules: '远离主通道，安静私密', gridRow: 3, gridCol: 3, status: 'available',
  },
]

const SEED_RESERVATIONS: Reservation[] = []

export function initializeStore(): void {
  const spots = getFromStorage<NapSpot[] | null>(SPOTS_KEY, null)
  if (!spots) {
    saveToStorage(SPOTS_KEY, SEED_SPOTS)
  }
  const reservations = getFromStorage<Reservation[] | null>(RESERVATIONS_KEY, null)
  if (!reservations) {
    saveToStorage(RESERVATIONS_KEY, SEED_RESERVATIONS)
  }
}

export function getSpots(): NapSpot[] {
  return getFromStorage<NapSpot[]>(SPOTS_KEY, [])
}

export function getSpotById(id: string): NapSpot | undefined {
  return getSpots().find(s => s.id === id)
}

export function addSpot(spot: Omit<NapSpot, 'id' | 'status'>): NapSpot {
  const spots = getSpots()
  const newSpot: NapSpot = { ...spot, id: generateId(), status: 'available' }
  spots.push(newSpot)
  saveToStorage(SPOTS_KEY, spots)
  return newSpot
}

export function updateSpot(id: string, updates: Partial<NapSpot>): NapSpot | undefined {
  const spots = getSpots()
  const idx = spots.findIndex(s => s.id === id)
  if (idx === -1) return undefined
  spots[idx] = { ...spots[idx], ...updates }
  saveToStorage(SPOTS_KEY, spots)
  return spots[idx]
}

export function deleteSpot(id: string): boolean {
  const spots = getSpots()
  const filtered = spots.filter(s => s.id !== id)
  if (filtered.length === spots.length) return false
  saveToStorage(SPOTS_KEY, filtered)
  return true
}

export function getReservations(): Reservation[] {
  return getFromStorage<Reservation[]>(RESERVATIONS_KEY, [])
}

export function getReservationsByDate(date: string): Reservation[] {
  return getReservations().filter(r => r.date === date && r.status !== 'cancelled')
}

export function getReservationsBySpot(spotId: string, date: string): Reservation[] {
  return getReservations().filter(
    r => r.spotId === spotId && r.date === date && r.status !== 'cancelled'
  )
}

export function getOverlappingReservations(
  spotId: string, date: string, startTime: string, endTime: string, excludeId?: string
): Reservation[] {
  const existing = getReservationsBySpot(spotId, date)
  return existing.filter(r => {
    if (excludeId && r.id === excludeId) return false
    if (r.status === 'cancelled' || r.status === 'no_show') return false
    return startTime < r.endTime && endTime > r.startTime
  })
}

export function checkConflict(
  spotId: string, date: string, startTime: string, endTime: string, acceptNearby: boolean, excludeId?: string
): { conflict: true; message: string } | { conflict: false } {
  const spot = getSpotById(spotId)
  if (!spot) return { conflict: true, message: '座位不存在' }

  const overlapping = getOverlappingReservations(spotId, date, startTime, endTime, excludeId)

  if (overlapping.length === 0) return { conflict: false }

  const exclusiveOccupants = overlapping.filter(r => !r.acceptNearby)
  if (exclusiveOccupants.length > 0) {
    const names = exclusiveOccupants.map(r => r.employeeName).join('、')
    return {
      conflict: true,
      message: `${names} 已占独享位，该时段不可再预约`,
    }
  }

  if (!acceptNearby) {
    const names = overlapping.map(r => r.employeeName).join('、')
    return {
      conflict: true,
      message: `该座位 ${startTime}-${endTime} 已被 ${names} 预约，未勾选"接受临近同事"时需独占`,
    }
  }

  if (overlapping.length >= spot.capacity) {
    const names = overlapping.map(r => r.employeeName).join('、')
    return {
      conflict: true,
      message: `该座位 ${startTime}-${endTime} 已满（${names}），容量 ${spot.capacity} 人`,
    }
  }

  return { conflict: false }
}

export function addReservation(res: Omit<Reservation, 'id' | 'createdAt' | 'status'>): Reservation | { error: string } {
  const conflict = checkConflict(res.spotId, res.date, res.startTime, res.endTime, res.acceptNearby)
  if (conflict.conflict) {
    return { error: conflict.message }
  }
  const reservations = getReservations()
  const newRes: Reservation = {
    ...res, id: generateId(), status: 'confirmed', createdAt: new Date().toISOString(),
  }
  reservations.push(newRes)
  saveToStorage(RESERVATIONS_KEY, reservations)

  return newRes
}

export function updateReservation(id: string, updates: Partial<Reservation>): Reservation | undefined {
  const reservations = getReservations()
  const idx = reservations.findIndex(r => r.id === id)
  if (idx === -1) return undefined
  reservations[idx] = { ...reservations[idx], ...updates }
  saveToStorage(RESERVATIONS_KEY, reservations)
  return reservations[idx]
}

export function checkInReservation(id: string): Reservation | undefined {
  return updateReservation(id, { status: 'checked_in', checkedInAt: new Date().toISOString() })
}

export function completeReservation(id: string, feedback: { cleanedUp: boolean; hasLeftItems: boolean; leftItemsDesc?: string }): Reservation | undefined {
  return updateReservation(id, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    cleanedUp: feedback.cleanedUp,
    hasLeftItems: feedback.hasLeftItems,
    leftItemsDesc: feedback.leftItemsDesc,
  })
}

export function markNoShow(id: string): Reservation | undefined {
  return updateReservation(id, { status: 'no_show' })
}

export function cancelReservation(id: string): Reservation | undefined {
  return updateReservation(id, { status: 'cancelled' })
}

export function releaseNoShowsForDate(date: string, currentTime: string): number {
  const reservations = getReservations()
  let count = 0
  const updated = reservations.map(r => {
    if (
      r.date === date &&
      r.status === 'confirmed' &&
      !r.checkedInAt &&
      currentTime > r.endTime
    ) {
      count++
      return { ...r, status: 'no_show' as const }
    }
    return r
  })
  if (count > 0) {
    saveToStorage(RESERVATIONS_KEY, updated)
  }
  return count
}

export type SpotStatusInfo = {
  status: 'available' | 'reserved' | 'cleaning'
  activeReservations: Reservation[]
  remainingCapacity: number
  isFull: boolean
  hasExclusiveOccupant: boolean
  exclusiveOccupantNames: string[]
}

export function computeSpotStatus(
  spotId: string, date: string, startTime?: string, endTime?: string
): SpotStatusInfo {
  const spot = getSpotById(spotId)
  if (!spot) {
    return { status: 'available', activeReservations: [], remainingCapacity: 0, isFull: true, hasExclusiveOccupant: false, exclusiveOccupantNames: [] }
  }

  let dateReservations = getReservationsBySpot(spotId, date)

  if (startTime && endTime) {
    dateReservations = dateReservations.filter(
      r => startTime < r.endTime && endTime > r.startTime
    )
  }

  const activeReservations = dateReservations.filter(
    r => r.status === 'confirmed' || r.status === 'checked_in'
  )
  const hasCleaning = dateReservations.some(
    r => r.status === 'completed' && !r.cleanedUp
  )

  const occupied = activeReservations.length
  const remainingCapacity = Math.max(0, spot.capacity - occupied)
  const isFull = occupied >= spot.capacity
  const exclusiveOccupants = activeReservations.filter(r => !r.acceptNearby)
  const hasExclusiveOccupant = exclusiveOccupants.length > 0
  const exclusiveOccupantNames = exclusiveOccupants.map(r => r.employeeName)

  let status: SpotStatusInfo['status'] = 'available'
  if (hasCleaning) status = 'cleaning'
  else if (occupied > 0) status = 'reserved'

  return { status, activeReservations, remainingCapacity, isFull, hasExclusiveOccupant, exclusiveOccupantNames }
}

export function getStats() {
  const reservations = getReservations()
  const spots = getSpots()
  const completed = reservations.filter(r => r.status === 'completed')
  const noShows = reservations.filter(r => r.status === 'no_show')

  const spotUsage: Record<string, number> = {}
  reservations.filter(r => r.status !== 'cancelled').forEach(r => {
    spotUsage[r.spotId] = (spotUsage[r.spotId] || 0) + 1
  })

  const popularSpots = spots
    .map(s => ({ ...s, usageCount: spotUsage[s.id] || 0 }))
    .sort((a, b) => b.usageCount - a.usageCount)

  const timeSlotUsage: Record<string, number> = {}
  reservations.filter(r => r.status !== 'cancelled').forEach(r => {
    timeSlotUsage[r.startTime] = (timeSlotUsage[r.startTime] || 0) + 1
  })

  const peakTimes = Object.entries(timeSlotUsage)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => b.count - a.count)

  const leftItemsReports = completed.filter(r => r.hasLeftItems)
  const notCleanedReports = completed.filter(r => !r.cleanedUp)

  return {
    totalReservations: reservations.filter(r => r.status !== 'cancelled').length,
    completedCount: completed.length,
    noShowCount: noShows.length,
    noShowRate: reservations.filter(r => r.status !== 'cancelled').length > 0
      ? (noShows.length / reservations.filter(r => r.status !== 'cancelled').length * 100).toFixed(1)
      : '0',
    popularSpots,
    peakTimes,
    leftItemsReports,
    notCleanedReports,
  }
}

export function resetStore(): void {
  saveToStorage(SPOTS_KEY, SEED_SPOTS)
  saveToStorage(RESERVATIONS_KEY, SEED_RESERVATIONS)
}
