import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Consumable, Requisition, Restock } from '@/types'

const generateId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36)

const now = new Date().toISOString()
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString()

const initialConsumables: Consumable[] = [
  {
    id: 'c1',
    name: '丁腈手套',
    specification: 'M码 / 无粉 / 100只装',
    unit: '盒',
    stock: 3,
    minAlert: 5,
    cabinet: 'A-01',
    isHazardous: false,
    imageUrl: '',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(2),
  },
  {
    id: 'c2',
    name: '移液器枪头',
    specification: '200μL / 无菌 / 96支/盒',
    unit: '盒',
    stock: 12,
    minAlert: 5,
    cabinet: 'A-03',
    isHazardous: false,
    imageUrl: '',
    createdAt: daysAgo(25),
    updatedAt: daysAgo(1),
  },
  {
    id: 'c3',
    name: '培养皿',
    specification: '90mm / 一次性 / 20套/包',
    unit: '包',
    stock: 2,
    minAlert: 4,
    cabinet: 'B-02',
    isHazardous: false,
    imageUrl: '',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(5),
  },
  {
    id: 'c4',
    name: '无水乙醇',
    specification: 'AR级 / 500mL',
    unit: '瓶',
    stock: 6,
    minAlert: 3,
    cabinet: 'C-01（危化柜）',
    isHazardous: true,
    imageUrl: '',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(3),
  },
  {
    id: 'c5',
    name: '盐酸',
    specification: '分析纯 / 500mL',
    unit: '瓶',
    stock: 2,
    minAlert: 3,
    cabinet: 'C-02（危化柜）',
    isHazardous: true,
    imageUrl: '',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(7),
  },
  {
    id: 'c6',
    name: '离心管',
    specification: '1.5mL / 无菌 / 500支/包',
    unit: '包',
    stock: 8,
    minAlert: 3,
    cabinet: 'A-05',
    isHazardous: false,
    imageUrl: '',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(1),
  },
  {
    id: 'c7',
    name: 'PBS缓冲液',
    specification: '1× / 500mL',
    unit: '瓶',
    stock: 15,
    minAlert: 5,
    cabinet: 'B-01',
    isHazardous: false,
    imageUrl: '',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(0),
  },
  {
    id: 'c8',
    name: '丙酮',
    specification: 'AR级 / 500mL',
    unit: '瓶',
    stock: 1,
    minAlert: 2,
    cabinet: 'C-03（危化柜）',
    isHazardous: true,
    imageUrl: '',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
  },
  {
    id: 'c9',
    name: '乳胶手套',
    specification: 'L码 / 有粉 / 100只装',
    unit: '盒',
    stock: 7,
    minAlert: 4,
    cabinet: 'A-02',
    isHazardous: false,
    imageUrl: '',
    createdAt: daysAgo(18),
    updatedAt: daysAgo(2),
  },
  {
    id: 'c10',
    name: '甲醛溶液',
    specification: '4% / 500mL',
    unit: '瓶',
    stock: 3,
    minAlert: 2,
    cabinet: 'C-01（危化柜）',
    isHazardous: true,
    imageUrl: '',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
]

const initialRequisitions: Requisition[] = [
  {
    id: 'r1',
    consumableId: 'c2',
    projectName: '肿瘤细胞增殖实验',
    quantity: 3,
    purpose: '细胞培养转液用',
    advisor: '王教授',
    returnNote: '消耗品，不归还',
    applicant: '张三',
    status: 'approved',
    isHazardous: false,
    createdAt: daysAgo(5),
    approvedAt: daysAgo(4),
    approvedBy: '李老师',
  },
  {
    id: 'r2',
    consumableId: 'c4',
    projectName: '组织切片染色',
    quantity: 1,
    purpose: '脱水步骤使用',
    advisor: '赵教授',
    returnNote: '消耗品，不归还',
    applicant: '李四',
    status: 'hazardous_pending',
    isHazardous: true,
    createdAt: daysAgo(2),
  },
  {
    id: 'r3',
    consumableId: 'c1',
    projectName: '日常实验',
    quantity: 2,
    purpose: '实验防护',
    advisor: '王教授',
    returnNote: '消耗品，不归还',
    applicant: '王五',
    status: 'pending',
    isHazardous: false,
    createdAt: daysAgo(1),
  },
  {
    id: 'r4',
    consumableId: 'c3',
    projectName: '菌落计数实验',
    quantity: 1,
    purpose: '细菌培养',
    advisor: '赵教授',
    returnNote: '消耗品，不归还',
    applicant: '张三',
    status: 'pending',
    isHazardous: false,
    createdAt: daysAgo(0),
  },
  {
    id: 'r5',
    consumableId: 'c5',
    projectName: '样品消解实验',
    quantity: 1,
    purpose: '酸消解处理',
    advisor: '赵教授',
    returnNote: '消耗品，不归还',
    applicant: '刘六',
    status: 'hazardous_pending',
    isHazardous: true,
    createdAt: daysAgo(1),
  },
  {
    id: 'r6',
    consumableId: 'c6',
    projectName: '蛋白提取实验',
    quantity: 1,
    purpose: '离心分离',
    advisor: '王教授',
    returnNote: '消耗品，不归还',
    applicant: '陈七',
    status: 'approved',
    isHazardous: false,
    createdAt: daysAgo(8),
    approvedAt: daysAgo(7),
    approvedBy: '李老师',
  },
]

const initialRestocks: Restock[] = [
  { id: 'rs1', consumableId: 'c1', quantity: 5, operator: '李老师', createdAt: daysAgo(10) },
  { id: 'rs2', consumableId: 'c2', quantity: 10, operator: '李老师', createdAt: daysAgo(8) },
  { id: 'rs3', consumableId: 'c4', quantity: 3, operator: '李老师', createdAt: daysAgo(6) },
  { id: 'rs4', consumableId: 'c7', quantity: 10, operator: '李老师', createdAt: daysAgo(3) },
  { id: 'rs5', consumableId: 'c6', quantity: 5, operator: '李老师', createdAt: daysAgo(2) },
  { id: 'rs6', consumableId: 'c1', quantity: 3, operator: '李老师', createdAt: daysAgo(1) },
]

interface StoreState {
  consumables: Consumable[]
  requisitions: Requisition[]
  restocks: Restock[]
  currentRole: 'admin' | 'student'
  setCurrentRole: (role: 'admin' | 'student') => void
  addConsumable: (c: Omit<Consumable, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateConsumable: (id: string, c: Partial<Consumable>) => void
  deleteConsumable: (id: string) => void
  restockConsumable: (consumableId: string, quantity: number, operator: string) => void
  addRequisition: (r: Omit<Requisition, 'id' | 'createdAt' | 'status' | 'isHazardous'>) => void
  approveRequisition: (id: string, approvedBy: string) => void
  rejectRequisition: (id: string, reason: string) => void
  approveHazardousRequisition: (id: string, approvedBy: string) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      consumables: initialConsumables,
      requisitions: initialRequisitions,
      restocks: initialRestocks,
      currentRole: 'admin',

      setCurrentRole: (role) => set({ currentRole: role }),

      addConsumable: (c) => {
        const id = generateId()
        const timestamp = new Date().toISOString()
        set((state) => ({
          consumables: [...state.consumables, { ...c, id, createdAt: timestamp, updatedAt: timestamp }],
        }))
      },

      updateConsumable: (id, c) => {
        set((state) => ({
          consumables: state.consumables.map((item) =>
            item.id === id ? { ...item, ...c, updatedAt: new Date().toISOString() } : item
          ),
        }))
      },

      deleteConsumable: (id) => {
        set((state) => ({
          consumables: state.consumables.filter((item) => item.id !== id),
        }))
      },

      restockConsumable: (consumableId, quantity, operator) => {
        const id = generateId()
        const timestamp = new Date().toISOString()
        set((state) => ({
          restocks: [...state.restocks, { id, consumableId, quantity, operator, createdAt: timestamp }],
          consumables: state.consumables.map((c) =>
            c.id === consumableId ? { ...c, stock: c.stock + quantity, updatedAt: timestamp } : c
          ),
        }))
      },

      addRequisition: (r) => {
        const id = generateId()
        const consumable = get().consumables.find((c) => c.id === r.consumableId)
        const isHazardous = consumable?.isHazardous ?? false
        const status: Requisition['status'] = isHazardous ? 'hazardous_pending' : 'pending'
        set((state) => ({
          requisitions: [...state.requisitions, { ...r, id, status, isHazardous, createdAt: new Date().toISOString() }],
        }))
      },

      approveRequisition: (id, approvedBy) => {
        const req = get().requisitions.find((r) => r.id === id)
        if (!req) return
        const timestamp = new Date().toISOString()
        set((state) => ({
          requisitions: state.requisitions.map((r) =>
            r.id === id ? { ...r, status: 'approved' as const, approvedAt: timestamp, approvedBy } : r
          ),
          consumables: state.consumables.map((c) =>
            c.id === req.consumableId ? { ...c, stock: Math.max(0, c.stock - req.quantity), updatedAt: timestamp } : c
          ),
        }))
      },

      rejectRequisition: (id, reason) => {
        set((state) => ({
          requisitions: state.requisitions.map((r) =>
            r.id === id ? { ...r, status: 'rejected' as const, rejectReason: reason } : r
          ),
        }))
      },

      approveHazardousRequisition: (id, approvedBy) => {
        const req = get().requisitions.find((r) => r.id === id)
        if (!req) return
        const timestamp = new Date().toISOString()
        set((state) => ({
          requisitions: state.requisitions.map((r) =>
            r.id === id ? { ...r, status: 'approved' as const, approvedAt: timestamp, approvedBy } : r
          ),
          consumables: state.consumables.map((c) =>
            c.id === req.consumableId ? { ...c, stock: Math.max(0, c.stock - req.quantity), updatedAt: timestamp } : c
          ),
        }))
      },
    }),
    { name: 'lab-consumables-store' }
  )
)
