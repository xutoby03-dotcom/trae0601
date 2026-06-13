import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { format } from 'date-fns'
import type { Coat, WashBatch, WashBatchItem, RepairRecord } from '@/types'

interface LabStore {
  coats: Coat[]
  washBatches: WashBatch[]
  washBatchItems: WashBatchItem[]
  repairRecords: RepairRecord[]

  addCoat: (coat: Omit<Coat, 'id' | 'createdAt'>) => void
  updateCoat: (id: string, data: Partial<Coat>) => void
  deleteCoat: (id: string) => void

  addWashBatch: (batch: Omit<WashBatch, 'id' | 'batchNo' | 'createdAt'>, coatIds: string[]) => void
  updateBatchStatus: (id: string, status: WashBatch['status']) => void

  returnItem: (itemId: string, returnStatus: WashBatchItem['returnStatus'], damageLocation?: string, damageNote?: string) => void

  addRepairRecord: (coatId: string, washBatchItemId: string, damageLocation: string, damageNote: string, damagePhotoUrl: string) => void
  repairComplete: (id: string, repairNote: string) => void

  checkOverdue: () => void
}

const SEED_COATS: Coat[] = [
  { id: 'c1', code: 'LBC-001', size: 'M', className: '化学一班', studentName: '张明', stainLevel: 2, photoUrl: '', status: 'available', createdAt: '2026-06-01T08:00:00Z' },
  { id: 'c2', code: 'LBC-002', size: 'L', className: '化学一班', studentName: '李华', stainLevel: 3, photoUrl: '', status: 'available', createdAt: '2026-06-01T08:00:00Z' },
  { id: 'c3', code: 'LBC-003', size: 'S', className: '化学二班', studentName: '王芳', stainLevel: 1, photoUrl: '', status: 'available', createdAt: '2026-06-02T08:00:00Z' },
  { id: 'c4', code: 'LBC-004', size: 'XL', className: '化学二班', studentName: '赵强', stainLevel: 4, photoUrl: '', status: 'available', createdAt: '2026-06-02T08:00:00Z' },
  { id: 'c5', code: 'LBC-005', size: 'M', className: '生物一班', studentName: '刘洋', stainLevel: 2, photoUrl: '', status: 'sent', createdAt: '2026-06-03T08:00:00Z' },
  { id: 'c6', code: 'LBC-006', size: 'L', className: '生物一班', studentName: '陈静', stainLevel: 3, photoUrl: '', status: 'sent', createdAt: '2026-06-03T08:00:00Z' },
  { id: 'c7', code: 'LBC-007', size: 'M', className: '生物二班', studentName: '周磊', stainLevel: 5, photoUrl: '', status: 'damaged', createdAt: '2026-06-04T08:00:00Z' },
  { id: 'c8', code: 'LBC-008', size: 'S', className: '生物二班', studentName: '吴婷', stainLevel: 1, photoUrl: '', status: 'available', createdAt: '2026-06-04T08:00:00Z' },
  { id: 'c9', code: 'LBC-009', size: 'XL', className: '物理一班', studentName: '孙鹏', stainLevel: 2, photoUrl: '', status: 'lost', createdAt: '2026-06-05T08:00:00Z' },
  { id: 'c10', code: 'LBC-010', size: 'M', className: '物理一班', studentName: '郑雨', stainLevel: 3, photoUrl: '', status: 'available', createdAt: '2026-06-05T08:00:00Z' },
  { id: 'c11', code: 'LBC-011', size: 'L', className: '物理二班', studentName: '黄晨', stainLevel: 4, photoUrl: '', status: 'available', createdAt: '2026-06-06T08:00:00Z' },
  { id: 'c12', code: 'LBC-012', size: 'M', className: '物理二班', studentName: '林雪', stainLevel: 1, photoUrl: '', status: 'available', createdAt: '2026-06-06T08:00:00Z' },
]

const SEED_BATCHES: WashBatch[] = [
  { id: 'b1', batchNo: 'WS-20260610-001', sender: '王老师', count: 2, expectedReturnDate: '2026-06-12', status: 'returned', createdAt: '2026-06-10T09:00:00Z' },
  { id: 'b2', batchNo: 'WS-20260611-001', sender: '李老师', count: 2, expectedReturnDate: '2026-06-14', status: 'sent', createdAt: '2026-06-11T10:00:00Z' },
  { id: 'b3', batchNo: 'WS-20260608-001', sender: '王老师', count: 1, expectedReturnDate: '2026-06-10', status: 'overdue', createdAt: '2026-06-08T08:00:00Z' },
]

const SEED_BATCH_ITEMS: WashBatchItem[] = [
  { id: 'bi1', batchId: 'b1', coatId: 'c1', returnStatus: 'clean', damageLocation: '', damageNote: '', damagePhotoUrl: '' },
  { id: 'bi2', batchId: 'b1', coatId: 'c2', returnStatus: 'damaged', damageLocation: '袖口', damageNote: '袖口开裂', damagePhotoUrl: '' },
  { id: 'bi3', batchId: 'b2', coatId: 'c5', returnStatus: 'pending', damageLocation: '', damageNote: '', damagePhotoUrl: '' },
  { id: 'bi4', batchId: 'b2', coatId: 'c6', returnStatus: 'pending', damageLocation: '', damageNote: '', damagePhotoUrl: '' },
  { id: 'bi5', batchId: 'b3', coatId: 'c9', returnStatus: 'pending', damageLocation: '', damageNote: '', damagePhotoUrl: '' },
]

const SEED_REPAIRS: RepairRecord[] = [
  { id: 'r1', coatId: 'c7', washBatchItemId: '', damageLocation: '前襟', damageNote: '前襟破洞', damagePhotoUrl: '', status: 'pending', repairedAt: '', repairNote: '', createdAt: '2026-06-09T08:00:00Z' },
  { id: 'r2', coatId: 'c2', washBatchItemId: 'bi2', damageLocation: '袖口', damageNote: '袖口开裂', damagePhotoUrl: '', status: 'pending', repairedAt: '', repairNote: '', createdAt: '2026-06-12T08:00:00Z' },
]

export const useLabStore = create<LabStore>()(
  persist(
    (set, get) => ({
      coats: SEED_COATS,
      washBatches: SEED_BATCHES,
      washBatchItems: SEED_BATCH_ITEMS,
      repairRecords: SEED_REPAIRS,

      addCoat: (coat) => {
        const newCoat: Coat = {
          ...coat,
          id: nanoid(),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ coats: [...s.coats, newCoat] }))
      },

      updateCoat: (id, data) => {
        set((s) => ({
          coats: s.coats.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }))
      },

      deleteCoat: (id) => {
        set((s) => ({ coats: s.coats.filter((c) => c.id !== id) }))
      },

      addWashBatch: (batch, coatIds) => {
        const id = nanoid()
        const batchNo = `WS-${format(new Date(), 'yyyyMMdd')}-${String(get().washBatches.length + 1).padStart(3, '0')}`
        const newBatch: WashBatch = {
          ...batch,
          id,
          batchNo,
          createdAt: new Date().toISOString(),
        }
        const items: WashBatchItem[] = coatIds.map((coatId) => ({
          id: nanoid(),
          batchId: id,
          coatId,
          returnStatus: 'pending',
          damageLocation: '',
          damageNote: '',
          damagePhotoUrl: '',
        }))
        set((s) => ({
          washBatches: [...s.washBatches, newBatch],
          washBatchItems: [...s.washBatchItems, ...items],
          coats: s.coats.map((c) =>
            coatIds.includes(c.id) ? { ...c, status: 'sent' as const } : c
          ),
        }))
      },

      updateBatchStatus: (id, status) => {
        set((s) => ({
          washBatches: s.washBatches.map((b) =>
            b.id === id ? { ...b, status } : b
          ),
        }))
      },

      returnItem: (itemId, returnStatus, damageLocation, damageNote) => {
        const item = get().washBatchItems.find((i) => i.id === itemId)
        if (!item) return

        set((s) => ({
          washBatchItems: s.washBatchItems.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  returnStatus,
                  damageLocation: damageLocation || '',
                  damageNote: damageNote || '',
                }
              : i
          ),
          coats: s.coats.map((c) => {
            if (c.id !== item.coatId) return c
            if (returnStatus === 'clean') return { ...c, status: 'available' as const }
            if (returnStatus === 'damaged') return { ...c, status: 'damaged' as const }
            if (returnStatus === 'missing') return { ...c, status: 'lost' as const }
            return c
          }),
        }))

        if (returnStatus === 'damaged') {
          const coat = get().coats.find((c) => c.id === item.coatId)
          if (coat) {
            get().addRepairRecord(
              item.coatId,
              itemId,
              damageLocation || '其他',
              damageNote || '',
              ''
            )
          }
        }

        const batch = get().washBatches.find((b) => b.id === item.batchId)
        if (batch) {
          const batchItems = get().washBatchItems.filter((i) => i.batchId === batch.id)
          const allReturned = batchItems.every((i) => i.returnStatus !== 'pending')
          if (allReturned) {
            get().updateBatchStatus(batch.id, 'returned')
          }
        }
      },

      addRepairRecord: (coatId, washBatchItemId, damageLocation, damageNote, damagePhotoUrl) => {
        const record: RepairRecord = {
          id: nanoid(),
          coatId,
          washBatchItemId,
          damageLocation,
          damageNote,
          damagePhotoUrl,
          status: 'pending',
          repairedAt: '',
          repairNote: '',
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          repairRecords: [...s.repairRecords, record],
        }))
      },

      repairComplete: (id, repairNote) => {
        const record = get().repairRecords.find((r) => r.id === id)
        if (!record) return

        set((s) => ({
          repairRecords: s.repairRecords.map((r) =>
            r.id === id
              ? { ...r, status: 'repaired' as const, repairedAt: new Date().toISOString(), repairNote }
              : r
          ),
          coats: s.coats.map((c) =>
            c.id === record.coatId ? { ...c, status: 'available' as const } : c
          ),
        }))
      },

      checkOverdue: () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        set((s) => ({
          washBatches: s.washBatches.map((b) => {
            if (b.status === 'sent' && b.expectedReturnDate < today) {
              return { ...b, status: 'overdue' as const }
            }
            return b
          }),
        }))
      },
    }),
    {
      name: 'lab-coat-storage',
    }
  )
)
