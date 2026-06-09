import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Property,
  Inspection,
  Staff,
  CheckItem,
  Photo,
  SupplyRecord,
  ReworkItem,
  CheckCategory,
  InspectionStatus,
} from '@/types'
import { DEFAULT_CHECK_ITEMS } from '@/types'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

const MOCK_STAFF: Staff[] = [
  { id: 's1', name: '王阿姨', phone: '138-0001-0001', role: 'cleaner' },
  { id: 's2', name: '李师傅', phone: '138-0002-0002', role: 'cleaner' },
  { id: 's3', name: '赵姐', phone: '138-0003-0003', role: 'cleaner' },
  { id: 's0', name: '张房东', phone: '139-9999-0000', role: 'landlord' },
]

const MOCK_PROPERTIES: Property[] = [
  { id: 'p1', name: '海景两居室', address: '三亚湾路88号A栋1201', rooms: 2, beds: 2, supplyStandards: ['纸巾', '洗发水', '矿泉水', '沐浴露', '牙刷', '拖鞋'], cleanerId: 's1', checkInTime: '14:00', status: 'checkout_today', createdAt: '2026-05-01', complaintCount: 3 },
  { id: 'p2', name: '山景loft', address: '丽江古城七一街32号', rooms: 1, beds: 1, supplyStandards: ['纸巾', '洗发水', '矿泉水', '拖鞋'], cleanerId: 's2', checkInTime: '15:00', status: 'cleaning', createdAt: '2026-04-15', complaintCount: 1 },
  { id: 'p3', name: '花园别墅', address: '大理下关洱海天域B栋', rooms: 3, beds: 4, supplyStandards: ['纸巾', '洗发水', '矿泉水', '沐浴露', '牙刷', '拖鞋', '垃圾袋', '洗手液'], cleanerId: 's3', checkInTime: '13:00', status: 'reviewing', createdAt: '2026-03-20', complaintCount: 5 },
  { id: 'p4', name: '古城小院', address: '平遥古城南大街56号', rooms: 2, beds: 3, supplyStandards: ['纸巾', '洗发水', '矿泉水'], cleanerId: 's1', checkInTime: '14:00', status: 'ready', createdAt: '2026-02-10', complaintCount: 0 },
  { id: 'p5', name: '湖景套房', address: '西湖边南山路168号', rooms: 1, beds: 1, supplyStandards: ['纸巾', '洗发水', '矿泉水', '沐浴露'], cleanerId: 's2', checkInTime: '16:00', status: 'checkout_today', createdAt: '2026-05-10', complaintCount: 2 },
  { id: 'p6', name: '竹林民宿', address: '莫干山仙潭村12号', rooms: 2, beds: 2, supplyStandards: ['纸巾', '洗发水', '矿泉水', '沐浴露', '牙刷'], cleanerId: 's3', checkInTime: '14:00', status: 'cleaning', createdAt: '2026-04-01', complaintCount: 1 },
]

function makeCheckItems(inspectionId: string): CheckItem[] {
  const items: CheckItem[] = []
  const categories = Object.keys(DEFAULT_CHECK_ITEMS) as CheckCategory[]
  categories.forEach((cat) => {
    DEFAULT_CHECK_ITEMS[cat].forEach((name) => {
      items.push({ id: uid(), inspectionId, category: cat, name, passed: null, note: '' })
    })
  })
  return items
}

const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'i1', propertyId: 'p2', cleanerId: 's2', status: 'cleaning',
    createdAt: '2026-06-09T08:00:00', startedAt: '2026-06-09T08:30:00', completedAt: null, reviewedAt: null,
    checkItems: makeCheckItems('i1').map((item, idx) => idx < 6 ? { ...item, passed: true } : item),
    photos: [
      { id: 'ph1', inspectionId: 'i1', type: 'before', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dirty+hotel+bathroom+with+messy+towels+and+wet+floor+realistic&image_size=landscape_16_9', uploadedAt: '2026-06-09T08:31:00' },
    ],
    supplyRecords: [{ id: 'sr1', inspectionId: 'i1', itemName: '纸巾', quantity: 2 }],
    reworkItems: [],
  },
  {
    id: 'i2', propertyId: 'p3', cleanerId: 's3', status: 'reviewing',
    createdAt: '2026-06-08T14:00:00', startedAt: '2026-06-08T14:20:00', completedAt: '2026-06-08T16:45:00', reviewedAt: null,
    checkItems: makeCheckItems('i2').map((item) => ({ ...item, passed: item.category === 'fridge' ? false : true, note: item.category === 'fridge' ? '冰箱有异味' : '' })),
    photos: [
      { id: 'ph2', inspectionId: 'i2', type: 'before', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dirty+hotel+kitchen+with+stains+realistic&image_size=landscape_16_9', uploadedAt: '2026-06-08T14:22:00' },
      { id: 'ph3', inspectionId: 'i2', type: 'after', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clean+hotel+kitchen+spotless+sparkling+realistic&image_size=landscape_16_9', uploadedAt: '2026-06-08T16:40:00' },
    ],
    supplyRecords: [
      { id: 'sr2', inspectionId: 'i2', itemName: '洗发水', quantity: 1 },
      { id: 'sr3', inspectionId: 'i2', itemName: '矿泉水', quantity: 4 },
    ],
    reworkItems: [],
  },
  {
    id: 'i3', propertyId: 'p6', cleanerId: 's3', status: 'cleaning',
    createdAt: '2026-06-09T07:00:00', startedAt: '2026-06-09T07:30:00', completedAt: null, reviewedAt: null,
    checkItems: makeCheckItems('i3').map((item, idx) => idx < 3 ? { ...item, passed: true } : item),
    photos: [],
    supplyRecords: [],
    reworkItems: [],
  },
  {
    id: 'i4', propertyId: 'p4', cleanerId: 's1', status: 'approved',
    createdAt: '2026-06-07T09:00:00', startedAt: '2026-06-07T09:15:00', completedAt: '2026-06-07T11:30:00', reviewedAt: '2026-06-07T12:00:00',
    checkItems: makeCheckItems('i4').map((item) => ({ ...item, passed: true })),
    photos: [
      { id: 'ph4', inspectionId: 'i4', type: 'before', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dirty+hotel+bedroom+unmade+bed+realistic&image_size=landscape_16_9', uploadedAt: '2026-06-07T09:16:00' },
      { id: 'ph5', inspectionId: 'i4', type: 'after', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clean+hotel+bedroom+perfectly+made+bed+spotless+realistic&image_size=landscape_16_9', uploadedAt: '2026-06-07T11:25:00' },
    ],
    supplyRecords: [{ id: 'sr4', inspectionId: 'i4', itemName: '矿泉水', quantity: 2 }],
    reworkItems: [],
  },
]

interface AppState {
  properties: Property[]
  inspections: Inspection[]
  staff: Staff[]

  addProperty: (p: Omit<Property, 'id' | 'createdAt' | 'complaintCount'>) => void
  updateProperty: (id: string, p: Partial<Property>) => void
  deleteProperty: (id: string) => void

  createInspection: (propertyId: string) => void
  startCleaning: (id: string) => void
  completeCleaning: (id: string) => void
  approveInspection: (id: string) => void
  reworkInspection: (id: string) => void

  updateCheckItem: (inspectionId: string, itemId: string, passed: boolean | null, note?: string) => void
  addPhoto: (inspectionId: string, type: 'before' | 'after', url: string) => void
  removePhoto: (inspectionId: string, photoId: string) => void
  addSupplyRecord: (inspectionId: string, itemName: string, quantity: number) => void
  removeSupplyRecord: (inspectionId: string, recordId: string) => void
  addReworkItem: (inspectionId: string, checkItemId: string, reason: string, deductionReason: string, deductionAmount: number) => void
  updateReworkItem: (inspectionId: string, reworkItemId: string, updates: Partial<ReworkItem>) => void
  removeReworkItem: (inspectionId: string, reworkItemId: string) => void

  getProperty: (id: string) => Property | undefined
  getInspection: (id: string) => Inspection | undefined
  getStaff: (id: string) => Staff | undefined
  getInspectionsByProperty: (propertyId: string) => Inspection[]
  getCleaners: () => Staff[]
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      properties: MOCK_PROPERTIES,
      inspections: MOCK_INSPECTIONS,
      staff: MOCK_STAFF,

      addProperty: (p) => {
        const property: Property = { ...p, id: uid(), createdAt: new Date().toISOString().slice(0, 10), complaintCount: 0 }
        set((s) => ({ properties: [...s.properties, property] }))
      },

      updateProperty: (id, p) => {
        set((s) => ({ properties: s.properties.map((prop) => (prop.id === id ? { ...prop, ...p } : prop)) }))
      },

      deleteProperty: (id) => {
        set((s) => ({ properties: s.properties.filter((p) => p.id !== id) }))
      },

      createInspection: (propertyId) => {
        const prop = get().properties.find((p) => p.id === propertyId)
        if (!prop) return
        const id = uid()
        const inspection: Inspection = {
          id,
          propertyId,
          cleanerId: prop.cleanerId,
          status: 'pending',
          createdAt: new Date().toISOString(),
          startedAt: null,
          completedAt: null,
          reviewedAt: null,
          checkItems: makeCheckItems(id),
          photos: [],
          supplyRecords: [],
          reworkItems: [],
        }
        set((s) => ({
          inspections: [...s.inspections, inspection],
          properties: s.properties.map((p) => (p.id === propertyId ? { ...p, status: 'checkout_today' as InspectionStatus extends never ? never : 'checkout_today' } : p)),
        }))
      },

      startCleaning: (id) => {
        set((s) => ({
          inspections: s.inspections.map((insp) =>
            insp.id === id ? { ...insp, status: 'cleaning' as const, startedAt: insp.startedAt || new Date().toISOString() } : insp
          ),
          properties: s.properties.map((p) => {
            const insp = s.inspections.find((i) => i.id === id)
            return insp && p.id === insp.propertyId ? { ...p, status: 'cleaning' as const } : p
          }),
        }))
      },

      completeCleaning: (id) => {
        set((s) => ({
          inspections: s.inspections.map((insp) =>
            insp.id === id ? { ...insp, status: 'reviewing' as const, completedAt: new Date().toISOString() } : insp
          ),
          properties: s.properties.map((p) => {
            const insp = s.inspections.find((i) => i.id === id)
            return insp && p.id === insp.propertyId ? { ...p, status: 'reviewing' as const } : p
          }),
        }))
      },

      approveInspection: (id) => {
        set((s) => ({
          inspections: s.inspections.map((insp) =>
            insp.id === id ? { ...insp, status: 'approved' as const, reviewedAt: new Date().toISOString() } : insp
          ),
          properties: s.properties.map((p) => {
            const insp = s.inspections.find((i) => i.id === id)
            return insp && p.id === insp.propertyId ? { ...p, status: 'ready' as const } : p
          }),
        }))
      },

      reworkInspection: (id) => {
        set((s) => ({
          inspections: s.inspections.map((insp) =>
            insp.id === id ? { ...insp, status: 'rework' as const, checkItems: insp.checkItems.map((ci) => (ci.passed === false ? { ...ci, passed: null, note: '' } : ci)) } : insp
          ),
          properties: s.properties.map((p) => {
            const insp = s.inspections.find((i) => i.id === id)
            return insp && p.id === insp.propertyId ? { ...p, status: 'cleaning' as const } : p
          }),
        }))
      },

      updateCheckItem: (inspectionId, itemId, passed, note) => {
        set((s) => ({
          inspections: s.inspections.map((insp) =>
            insp.id === inspectionId
              ? { ...insp, checkItems: insp.checkItems.map((ci) => (ci.id === itemId ? { ...ci, passed, ...(note !== undefined ? { note } : {}) } : ci)) }
              : insp
          ),
        }))
      },

      addPhoto: (inspectionId, type, url) => {
        const photo: Photo = { id: uid(), inspectionId, type, url, uploadedAt: new Date().toISOString() }
        set((s) => ({
          inspections: s.inspections.map((insp) =>
            insp.id === inspectionId ? { ...insp, photos: [...insp.photos, photo] } : insp
          ),
        }))
      },

      removePhoto: (inspectionId, photoId) => {
        set((s) => ({
          inspections: s.inspections.map((insp) =>
            insp.id === inspectionId ? { ...insp, photos: insp.photos.filter((p) => p.id !== photoId) } : insp
          ),
        }))
      },

      addSupplyRecord: (inspectionId, itemName, quantity) => {
        const record: SupplyRecord = { id: uid(), inspectionId, itemName, quantity }
        set((s) => ({
          inspections: s.inspections.map((insp) =>
            insp.id === inspectionId ? { ...insp, supplyRecords: [...insp.supplyRecords, record] } : insp
          ),
        }))
      },

      removeSupplyRecord: (inspectionId, recordId) => {
        set((s) => ({
          inspections: s.inspections.map((insp) =>
            insp.id === inspectionId ? { ...insp, supplyRecords: insp.supplyRecords.filter((r) => r.id !== recordId) } : insp
          ),
        }))
      },

      addReworkItem: (inspectionId, checkItemId, reason, deductionReason, deductionAmount) => {
        const item: ReworkItem = { id: uid(), inspectionId, checkItemId, reason, deductionReason, deductionAmount }
        set((s) => ({
          inspections: s.inspections.map((insp) =>
            insp.id === inspectionId ? { ...insp, reworkItems: [...insp.reworkItems, item] } : insp
          ),
        }))
      },

      updateReworkItem: (inspectionId, reworkItemId, updates) => {
        set((s) => ({
          inspections: s.inspections.map((insp) =>
            insp.id === inspectionId
              ? { ...insp, reworkItems: insp.reworkItems.map((ri) => (ri.id === reworkItemId ? { ...ri, ...updates } : ri)) }
              : insp
          ),
        }))
      },

      removeReworkItem: (inspectionId, reworkItemId) => {
        set((s) => ({
          inspections: s.inspections.map((insp) =>
            insp.id === inspectionId ? { ...insp, reworkItems: insp.reworkItems.filter((ri) => ri.id !== reworkItemId) } : insp
          ),
        }))
      },

      getProperty: (id) => get().properties.find((p) => p.id === id),
      getInspection: (id) => get().inspections.find((i) => i.id === id),
      getStaff: (id) => get().staff.find((s) => s.id === id),
      getInspectionsByProperty: (propertyId) => get().inspections.filter((i) => i.propertyId === propertyId),
      getCleaners: () => get().staff.filter((s) => s.role === 'cleaner'),
    }),
    { name: 'minsu-clean-v2' }
  )
)
