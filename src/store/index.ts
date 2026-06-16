import { create } from 'zustand'
import type {
  Goggle,
  CheckoutRecord,
  DamageReport,
  Lab,
  ClassInfo,
  Teacher,
  GoggleStatus,
  DamageType,
  DamageActionType,
} from '@/types'

const STORAGE_KEY = 'goggle_mgr_data'

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function hoursAgo(hours: number): string {
  const d = new Date()
  d.setHours(d.getHours() - hours)
  return d.toISOString()
}

function futureHours(hours: number): string {
  const d = new Date()
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}

const MOCK_LABS: Lab[] = [
  { id: 'lab-1', name: '化学实验室A', building: '理工楼', roomNumber: '301' },
  { id: 'lab-2', name: '物理实验室B', building: '理工楼', roomNumber: '302' },
  { id: 'lab-3', name: '生物实验室C', building: '生命科学楼', roomNumber: '201' },
]

const MOCK_CLASSES: ClassInfo[] = [
  { id: 'cls-1', name: '高三(1)班', grade: '高三', department: '理科' },
  { id: 'cls-2', name: '高三(2)班', grade: '高三', department: '理科' },
  { id: 'cls-3', name: '高二(3)班', grade: '高二', department: '理科' },
  { id: 'cls-4', name: '高二(4)班', grade: '高二', department: '理科' },
  { id: 'cls-5', name: '高一(5)班', grade: '高一', department: '理科' },
  { id: 'cls-6', name: '高一(6)班', grade: '高一', department: '理科' },
]

const MOCK_TEACHERS: Teacher[] = [
  { id: 'tch-1', name: '王建国', department: '化学组' },
  { id: 'tch-2', name: '李明辉', department: '物理组' },
  { id: 'tch-3', name: '张秀英', department: '生物组' },
  { id: 'tch-4', name: '陈志远', department: '化学组' },
]

function createMockGoggles(): Goggle[] {
  const goggles: Goggle[] = []
  const sizes: Goggle['size'][] = ['S', 'M', 'M', 'M', 'L', 'L', 'XL']
  const statuses: GoggleStatus[] = [
    'available', 'available', 'available', 'available', 'available',
    'stored', 'stored', 'stored',
    'checked_out', 'checked_out', 'checked_out', 'checked_out',
    'pending_clean', 'pending_clean', 'pending_clean',
    'disinfected', 'disinfected',
    'drying', 'drying',
    'under_repair', 'under_repair',
    'retired',
  ]
  const labIds = MOCK_LABS.map(l => l.id)

  for (let i = 1; i <= 60; i++) {
    const status = statuses[i % statuses.length]
    const labId = labIds[i % labIds.length]
    const size = sizes[i % sizes.length]
    const isDisinfectable = ['stored', 'disinfected', 'drying', 'pending_clean'].includes(status)
    goggles.push({
      id: `g-${i}`,
      code: `HM-${String(i).padStart(3, '0')}`,
      size,
      labId,
      status,
      lastDisinfectionTime: isDisinfectable ? hoursAgo(Math.floor(Math.random() * 48) + 1) : null,
      photoUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=laboratory+safety+goggles+on+white+background+product+photo&image_size=square`,
      purchaseDate: daysAgo(Math.floor(Math.random() * 730) + 30),
      createdAt: daysAgo(Math.floor(Math.random() * 730) + 30),
      updatedAt: hoursAgo(Math.floor(Math.random() * 72)),
    })
  }
  return goggles
}

function createMockCheckouts(goggles: Goggle[]): CheckoutRecord[] {
  const records: CheckoutRecord[] = []
  const experiments = ['酸碱中和实验', '电路基础实验', '显微镜观察实验', '有机物提取实验', '光学折射实验', '细胞切片观察', '氧化还原反应', '力学测量实验']
  const statusOptions: CheckoutRecord['status'][] = ['active', 'active', 'returned', 'overdue', 'partial_returned', 'returned', 'returned']

  for (let i = 1; i <= 15; i++) {
    const classInfo = MOCK_CLASSES[i % MOCK_CLASSES.length]
    const teacher = MOCK_TEACHERS[i % MOCK_TEACHERS.length]
    const lab = MOCK_LABS[i % MOCK_LABS.length]
    const quantity = (i % 5) + 20
    const status = statusOptions[i % statusOptions.length]
    const checkoutTime = daysAgo(Math.floor(Math.random() * 14) + 1)
    const expectedReturnTime = new Date(new Date(checkoutTime).getTime() + 4 * 60 * 60 * 1000).toISOString()
    const checkedOutGoggles = goggles
      .filter(g => g.labId === lab.id)
      .slice(0, quantity)
      .map(g => g.id)

    records.push({
      id: `co-${i}`,
      classId: classInfo.id,
      experimentProject: experiments[i % experiments.length],
      labId: lab.id,
      teacherId: teacher.id,
      quantity,
      goggleIds: checkedOutGoggles,
      checkoutTime,
      expectedReturnTime,
      actualReturnTime: status === 'returned' ? new Date(new Date(checkoutTime).getTime() + 3 * 60 * 60 * 1000).toISOString() : null,
      status,
    })
  }
  return records
}

function createMockDamageReports(goggles: Goggle[]): DamageReport[] {
  const damageTypes: DamageType[] = ['lens_scratched', 'strap_broken', 'nose_pad_missing', 'other']
  const actionTypes: DamageActionType[] = ['repair', 'replace']
  const descriptions: Record<DamageType, string> = {
    lens_scratched: '镜片表面有明显划痕，影响视线',
    strap_broken: '松紧带断裂，无法固定',
    nose_pad_missing: '鼻托脱落，无法佩戴',
    other: '外壳裂纹，需要更换',
  }

  const reports: DamageReport[] = []
  const damagedGoggles = goggles.filter(g => g.status === 'under_repair' || g.status === 'retired')

  for (let i = 0; i < Math.min(8, damagedGoggles.length); i++) {
    const goggle = damagedGoggles[i]
    const damageType = damageTypes[i % damageTypes.length]
    const actionType = actionTypes[i % actionTypes.length]
    const statuses: DamageReport['status'][] = ['pending', 'pending', 'in_progress', 'completed']
    const status = statuses[i % statuses.length]

    reports.push({
      id: `dmg-${i + 1}`,
      goggleId: goggle.id,
      damageType,
      description: descriptions[damageType],
      photoUrl: null,
      reportedAt: daysAgo(Math.floor(Math.random() * 30) + 1),
      actionType,
      status,
      completedAt: status === 'completed' ? daysAgo(2) : null,
      notes: status === 'completed' ? '已处理完毕' : null,
    })
  }
  return reports
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return null
}

function saveToStorage(data: StoreData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

interface StoreData {
  goggles: Goggle[]
  checkouts: CheckoutRecord[]
  damageReports: DamageReport[]
  labs: Lab[]
  classes: ClassInfo[]
  teachers: Teacher[]
}

function getInitialData(): StoreData {
  const stored = loadFromStorage()
  if (stored && stored.goggles && stored.goggles.length > 0) return stored

  const goggles = createMockGoggles()
  const checkouts = createMockCheckouts(goggles)
  const damageReports = createMockDamageReports(goggles)
  const data = { goggles, checkouts, damageReports, labs: MOCK_LABS, classes: MOCK_CLASSES, teachers: MOCK_TEACHERS }
  saveToStorage(data)
  return data
}

interface GoggleStore extends StoreData {
  addGoggle: (goggle: Omit<Goggle, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateGoggle: (id: string, updates: Partial<Goggle>) => void
  createCheckout: (data: { classId: string; experimentProject: string; labId: string; teacherId: string; quantity: number }) => CheckoutRecord | null
  returnGoggle: (goggleId: string, status: GoggleStatus) => void
  reportDamage: (goggleId: string, damageType: DamageType, description: string, actionType: DamageActionType) => void
  updateDamageReport: (id: string, updates: Partial<DamageReport>) => void
  completeDamage: (id: string, notes: string) => void
  getLabById: (id: string) => Lab | undefined
  getClassById: (id: string) => ClassInfo | undefined
  getTeacherById: (id: string) => Teacher | undefined
  batchUpdateGoggleStatus: (ids: string[], status: GoggleStatus) => void
  resetData: () => void
}

const initialData = getInitialData()

export const useStore = create<GoggleStore>((set, get) => ({
  goggles: initialData.goggles,
  checkouts: initialData.checkouts,
  damageReports: initialData.damageReports,
  labs: initialData.labs,
  classes: initialData.classes,
  teachers: initialData.teachers,

  addGoggle: (goggleData) => {
    const now = new Date().toISOString()
    const goggle: Goggle = {
      ...goggleData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    set(s => {
      const goggles = [...s.goggles, goggle]
      saveToStorage({ ...s, goggles })
      return { goggles }
    })
  },

  updateGoggle: (id, updates) => {
    set(s => {
      const goggles = s.goggles.map(g =>
        g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
      )
      saveToStorage({ ...s, goggles })
      return { goggles }
    })
  },

  createCheckout: (data) => {
    const state = get()
    const availableGoggles = state.goggles.filter(
      g => g.labId === data.labId && (g.status === 'available' || g.status === 'stored')
    )
    if (availableGoggles.length < data.quantity) return null

    const selectedGoggles = availableGoggles.slice(0, data.quantity)
    const now = new Date().toISOString()

    const record: CheckoutRecord = {
      id: generateId(),
      classId: data.classId,
      experimentProject: data.experimentProject,
      labId: data.labId,
      teacherId: data.teacherId,
      quantity: data.quantity,
      goggleIds: selectedGoggles.map(g => g.id),
      checkoutTime: now,
      expectedReturnTime: futureHours(4),
      actualReturnTime: null,
      status: 'active',
    }

    set(s => {
      const goggles = s.goggles.map(g =>
        selectedGoggles.some(sg => sg.id === g.id)
          ? { ...g, status: 'checked_out' as GoggleStatus, updatedAt: now }
          : g
      )
      const checkouts = [...s.checkouts, record]
      saveToStorage({ ...s, goggles, checkouts })
      return { goggles, checkouts }
    })

    return record
  },

  returnGoggle: (goggleId, status) => {
    const now = new Date().toISOString()
    set(s => {
      const goggles = s.goggles.map(g => {
        if (g.id !== goggleId) return g
        const updates: Partial<Goggle> = { status, updatedAt: now }
        if (status === 'disinfected') updates.lastDisinfectionTime = now
        return { ...g, ...updates }
      })

      const checkouts = s.checkouts.map(co => {
        if (!co.goggleIds.includes(goggleId)) return co
        const returnedCount = co.goggleIds.filter(gid =>
          goggles.find(g => g.id === gid)?.status !== 'checked_out'
        ).length
        const allReturned = returnedCount === co.goggleIds.length
        return {
          ...co,
          actualReturnTime: allReturned ? now : co.actualReturnTime,
          status: allReturned ? 'returned' as const : 'partial_returned' as const,
        }
      })

      saveToStorage({ ...s, goggles, checkouts })
      return { goggles, checkouts }
    })
  },

  reportDamage: (goggleId, damageType, description, actionType) => {
    const now = new Date().toISOString()
    const report: DamageReport = {
      id: generateId(),
      goggleId,
      damageType,
      description,
      photoUrl: null,
      reportedAt: now,
      actionType,
      status: 'pending',
      completedAt: null,
      notes: null,
    }

    set(s => {
      const goggles = s.goggles.map(g =>
        g.id === goggleId ? { ...g, status: 'retired' as GoggleStatus, updatedAt: now } : g
      )
      const damageReports = [...s.damageReports, report]
      saveToStorage({ ...s, goggles, damageReports })
      return { goggles, damageReports }
    })
  },

  updateDamageReport: (id, updates) => {
    set(s => {
      const damageReports = s.damageReports.map(r =>
        r.id === id ? { ...r, ...updates } : r
      )
      saveToStorage({ ...s, damageReports })
      return { damageReports }
    })
  },

  completeDamage: (id, notes) => {
    const now = new Date().toISOString()
    const state = get()
    const report = state.damageReports.find(r => r.id === id)
    if (!report) return

    set(s => {
      const damageReports = s.damageReports.map(r =>
        r.id === id ? { ...r, status: 'completed' as const, completedAt: now, notes } : r
      )

      let goggles = s.goggles
      if (report.actionType === 'repair') {
        goggles = s.goggles.map(g =>
          g.id === report.goggleId
            ? { ...g, status: 'available' as GoggleStatus, lastDisinfectionTime: now, updatedAt: now }
            : g
        )
      }

      saveToStorage({ ...s, damageReports, goggles })
      return { damageReports, goggles }
    })
  },

  getLabById: (id) => get().labs.find(l => l.id === id),
  getClassById: (id) => get().classes.find(c => c.id === id),
  getTeacherById: (id) => get().teachers.find(t => t.id === id),

  batchUpdateGoggleStatus: (ids, status) => {
    const now = new Date().toISOString()
    set(s => {
      const goggles = s.goggles.map(g => {
        if (!ids.includes(g.id)) return g
        const updates: Partial<Goggle> = { status, updatedAt: now }
        if (status === 'disinfected') updates.lastDisinfectionTime = now
        return { ...g, ...updates }
      })
      saveToStorage({ ...s, goggles })
      return { goggles }
    })
  },

  resetData: () => {
    localStorage.removeItem(STORAGE_KEY)
    const goggles = createMockGoggles()
    const checkouts = createMockCheckouts(goggles)
    const damageReports = createMockDamageReports(goggles)
    const data = { goggles, checkouts, damageReports, labs: MOCK_LABS, classes: MOCK_CLASSES, teachers: MOCK_TEACHERS }
    saveToStorage(data)
    set(data)
  },
}))
