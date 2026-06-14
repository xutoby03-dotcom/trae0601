import { create } from 'zustand'
import type { Sample, CheckoutRecord, ReturnRecord } from '@/types'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

function computeSampleStatus(sample: Sample): Sample['status'] {
  const now = new Date()
  const expiry = new Date(sample.expiryDate)
  const daysToExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (daysToExpiry < 0) return 'expired'
  if (sample.currentTemp < sample.tempMin || sample.currentTemp > sample.tempMax) return 'temp_abnormal'
  if (daysToExpiry <= 7) return 'expiring'
  return 'normal'
}

const MOCK_SAMPLES: Sample[] = [
  {
    id: 's1', code: 'BIO-2026-001', type: '血液', batch: 'B2026A',
    tempMin: 2, tempMax: 8, currentTemp: 4, expiryDate: '2026-08-15',
    hazardLevel: 3, photo: '', totalQuantity: 50, remainingQuantity: 35,
    status: 'normal', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 's2', code: 'BIO-2026-002', type: '微生物', batch: 'M2026B',
    tempMin: -20, tempMax: -15, currentTemp: -18, expiryDate: '2026-07-20',
    hazardLevel: 4, photo: '', totalQuantity: 30, remainingQuantity: 22,
    status: 'normal', createdAt: '2026-02-05T09:00:00Z', updatedAt: '2026-06-02T14:00:00Z',
  },
  {
    id: 's3', code: 'BIO-2026-003', type: '化学试剂', batch: 'C2026C',
    tempMin: 15, tempMax: 25, currentTemp: 28, expiryDate: '2027-01-01',
    hazardLevel: 5, photo: '', totalQuantity: 100, remainingQuantity: 80,
    status: 'temp_abnormal', createdAt: '2026-03-12T07:30:00Z', updatedAt: '2026-06-10T16:00:00Z',
  },
  {
    id: 's4', code: 'BIO-2026-004', type: '组织', batch: 'T2026D',
    tempMin: -80, tempMax: -70, currentTemp: -75, expiryDate: '2026-06-20',
    hazardLevel: 2, photo: '', totalQuantity: 20, remainingQuantity: 12,
    status: 'expiring', createdAt: '2026-01-20T11:00:00Z', updatedAt: '2026-06-05T09:30:00Z',
  },
  {
    id: 's5', code: 'BIO-2026-005', type: '细胞', batch: 'CE2026E',
    tempMin: -196, tempMax: -180, currentTemp: -190, expiryDate: '2026-05-01',
    hazardLevel: 1, photo: '', totalQuantity: 15, remainingQuantity: 8,
    status: 'expired', createdAt: '2025-11-15T10:00:00Z', updatedAt: '2026-04-28T13:00:00Z',
  },
  {
    id: 's6', code: 'BIO-2026-006', type: '血液', batch: 'B2026F',
    tempMin: 2, tempMax: 8, currentTemp: 5, expiryDate: '2026-12-31',
    hazardLevel: 3, photo: '', totalQuantity: 40, remainingQuantity: 40,
    status: 'normal', createdAt: '2026-04-01T08:00:00Z', updatedAt: '2026-04-01T08:00:00Z',
  },
]

const MOCK_CHECKOUTS: CheckoutRecord[] = [
  {
    id: 'c1', sampleId: 's1', className: '生科2301班', labBench: 'A-03',
    studentName: '张三', quantity: 5, checkoutTime: '2026-06-01T09:00:00Z',
    teacherConfirmed: true, teacherName: '李教授', status: 'returned',
  },
  {
    id: 'c2', sampleId: 's2', className: '生科2302班', labBench: 'B-07',
    studentName: '王五', quantity: 3, checkoutTime: '2026-06-02T10:30:00Z',
    teacherConfirmed: true, teacherName: '赵教授', status: 'pending',
  },
  {
    id: 'c3', sampleId: 's3', className: '化学2301班', labBench: 'C-12',
    studentName: '刘六', quantity: 10, checkoutTime: '2026-06-03T14:00:00Z',
    teacherConfirmed: false, teacherName: '', status: 'pending',
  },
  {
    id: 'c4', sampleId: 's1', className: '生科2301班', labBench: 'A-05',
    studentName: '李四', quantity: 8, checkoutTime: '2026-06-05T08:30:00Z',
    teacherConfirmed: true, teacherName: '李教授', status: 'confirmed',
  },
  {
    id: 'c5', sampleId: 's4', className: '医学2301班', labBench: 'D-02',
    studentName: '陈七', quantity: 4, checkoutTime: '2026-06-06T11:00:00Z',
    teacherConfirmed: true, teacherName: '孙教授', status: 'confirmed',
  },
]

const MOCK_RETURNS: ReturnRecord[] = [
  {
    id: 'r1', checkoutId: 'c1', sampleId: 's1', type: 'return',
    remainingQuantity: 2, contaminated: false, contaminationDesc: '',
    disposalMethod: 'other', returnPerson: '实验员王老师',
    returnTime: '2026-06-01T17:00:00Z', reason: '',
  },
]

interface StoreState {
  samples: Sample[]
  checkouts: CheckoutRecord[]
  returns: ReturnRecord[]

  addSample: (sample: Omit<Sample, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void
  updateSample: (id: string, data: Partial<Sample>) => void
  deleteSample: (id: string) => void

  addCheckout: (checkout: Omit<CheckoutRecord, 'id'>) => CheckoutRecord | null
  confirmCheckout: (id: string, teacherName: string) => void
  rejectCheckout: (id: string) => void

  addReturn: (ret: Omit<ReturnRecord, 'id'>) => void

  refreshSampleStatuses: () => void
}

const STORAGE_KEY = 'bio-sample-tracker'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}-${key}`)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(`${STORAGE_KEY}-${key}`, JSON.stringify(data))
}

export const useStore = create<StoreState>((set, get) => ({
  samples: loadFromStorage('samples', MOCK_SAMPLES),
  checkouts: loadFromStorage('checkouts', MOCK_CHECKOUTS),
  returns: loadFromStorage('returns', MOCK_RETURNS),

  addSample: (sampleData) => {
    const now = new Date().toISOString()
    const sample: Sample = {
      ...sampleData,
      id: generateId(),
      status: 'normal',
      createdAt: now,
      updatedAt: now,
    }
    sample.status = computeSampleStatus(sample)
    const samples = [...get().samples, sample]
    saveToStorage('samples', samples)
    set({ samples })
  },

  updateSample: (id, data) => {
    const samples = get().samples.map((s) =>
      s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
    )
    const updated = samples.map((s) => ({ ...s, status: computeSampleStatus(s) }))
    saveToStorage('samples', updated)
    set({ samples: updated })
  },

  deleteSample: (id) => {
    const samples = get().samples.filter((s) => s.id !== id)
    saveToStorage('samples', samples)
    set({ samples })
  },

  addCheckout: (checkoutData) => {
    const sample = get().samples.find((s) => s.id === checkoutData.sampleId)
    if (!sample) return null
    if (sample.status === 'expired') return null
    if (sample.remainingQuantity < checkoutData.quantity) return null

    const isHighHazard = sample.hazardLevel >= 4
    const status: CheckoutRecord['status'] = isHighHazard ? 'pending' : 'confirmed'
    const checkout: CheckoutRecord = {
      ...checkoutData,
      id: generateId(),
      status,
      teacherConfirmed: isHighHazard ? false : true,
      teacherName: isHighHazard ? '' : checkoutData.teacherName || '',
    }
    const checkouts = [...get().checkouts, checkout]

    if (status === 'confirmed') {
      const samples = get().samples.map((s) =>
        s.id === sample.id
          ? { ...s, remainingQuantity: s.remainingQuantity - checkout.quantity, updatedAt: new Date().toISOString() }
          : s
      )
      const updatedSamples = samples.map((s) => ({ ...s, status: computeSampleStatus(s) }))
      saveToStorage('samples', updatedSamples)
      saveToStorage('checkouts', checkouts)
      set({ samples: updatedSamples, checkouts })
    } else {
      saveToStorage('checkouts', checkouts)
      set({ checkouts })
    }

    return checkout
  },

  confirmCheckout: (id, teacherName) => {
    const existing = get().checkouts.find((c) => c.id === id)
    if (!existing || existing.status !== 'pending') return

    const checkouts = get().checkouts.map((c) =>
      c.id === id ? { ...c, teacherConfirmed: true, teacherName, status: 'confirmed' as const } : c
    )
    const checkout = checkouts.find((c) => c.id === id)
    if (checkout) {
      const samples = get().samples.map((s) =>
        s.id === checkout.sampleId
          ? { ...s, remainingQuantity: Math.max(0, s.remainingQuantity - checkout.quantity), updatedAt: new Date().toISOString() }
          : s
      )
      const updatedSamples = samples.map((s) => ({ ...s, status: computeSampleStatus(s) }))
      saveToStorage('samples', updatedSamples)
      saveToStorage('checkouts', checkouts)
      set({ samples: updatedSamples, checkouts })
    }
  },

  rejectCheckout: (id) => {
    const checkouts = get().checkouts.map((c) =>
      c.id === id ? { ...c, status: 'rejected' as const } : c
    )
    saveToStorage('checkouts', checkouts)
    set({ checkouts })
  },

  addReturn: (ret) => {
    const record: ReturnRecord = { ...ret, id: generateId() }
    const returns = [...get().returns, record]

    const checkouts = get().checkouts.map((c) =>
      c.id === ret.checkoutId
        ? { ...c, status: ret.type === 'return' ? ('returned' as const) : ('disposed' as const) }
        : c
    )

    if (ret.type === 'return') {
      const samples = get().samples.map((s) =>
        s.id === ret.sampleId
          ? { ...s, remainingQuantity: s.remainingQuantity + ret.remainingQuantity, updatedAt: new Date().toISOString() }
          : s
      )
      const updatedSamples = samples.map((s) => ({ ...s, status: computeSampleStatus(s) }))
      saveToStorage('samples', updatedSamples)
      saveToStorage('checkouts', checkouts)
      saveToStorage('returns', returns)
      set({ samples: updatedSamples, checkouts, returns })
    } else {
      saveToStorage('checkouts', checkouts)
      saveToStorage('returns', returns)
      set({ checkouts, returns })
    }
  },

  refreshSampleStatuses: () => {
    const samples = get().samples.map((s) => ({ ...s, status: computeSampleStatus(s) }))
    saveToStorage('samples', samples)
    set({ samples })
  },
}))
