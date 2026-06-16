import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BoxStatus = 'in_stock' | 'in_use' | 'used_up' | 'suspended'
export type ProblemType = 'leak' | 'burst' | 'loose'
export type BatchStatus = 'normal' | 'suspended'

export interface Box {
  id: string
  supplier: string
  specification: string
  batchNo: string
  boxNo: string
  cupType: string
  arrivalDate: string
  station: string
  status: BoxStatus
  createdAt: string
}

export interface Station {
  id: string
  name: string
  currentBoxId: string | null
  startedAt: string | null
  consumedCount: number
}

export interface Order {
  id: string
  orderNo: string
  boxId: string
  stationId: string
  createdAt: string
}

export interface Complaint {
  id: string
  orderNo: string
  orderBoxId: string
  problemType: ProblemType
  createdAt: string
}

export interface BatchInfo {
  batchNo: string
  supplier: string
  status: BatchStatus
}

interface StoreState {
  boxes: Box[]
  stations: Station[]
  orders: Order[]
  complaints: Complaint[]
  batches: BatchInfo[]

  addBox: (box: Omit<Box, 'id' | 'createdAt' | 'status'>) => void
  startUsingBox: (stationId: string, boxId: string) => void
  suspendBatch: (batchNo: string) => void
  resumeBatch: (batchNo: string) => void
  addOrder: (orderNo: string, stationId: string) => void
  addComplaint: (orderNo: string, problemType: ProblemType) => void
  getBoxById: (id: string) => Box | undefined
  getStationById: (id: string) => Station | undefined
  getOrdersByBatchNo: (batchNo: string) => Order[]
  getComplaintsByBatchNo: (batchNo: string) => Complaint[]
  getBatchStats: () => { batchNo: string; supplier: string; totalBoxes: number; inStockBoxes: number; inUseBoxes: number; complaintCount: number; complaintRate: number; turnoverDays: number }[]
  getSupplierStats: () => { supplier: string; totalBoxes: number; complaintCount: number; complaintRate: number }[]
  resetStore: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 10)

const today = new Date()
const dateStr = (daysAgo: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

const INITIAL_BOXES: Box[] = [
  { id: 'bx001', supplier: '鑫达包装', specification: '90mm 平盖', batchNo: 'XD-2026-0512', boxNo: 'XD-0512-01', cupType: '中杯/大杯', arrivalDate: dateStr(30), station: '吧台A', status: 'used_up', createdAt: dateStr(30) + 'T08:00:00' },
  { id: 'bx002', supplier: '鑫达包装', specification: '90mm 平盖', batchNo: 'XD-2026-0512', boxNo: 'XD-0512-02', cupType: '中杯/大杯', arrivalDate: dateStr(30), station: '吧台B', status: 'used_up', createdAt: dateStr(30) + 'T08:05:00' },
  { id: 'bx003', supplier: '鑫达包装', specification: '90mm 平盖', batchNo: 'XD-2026-0520', boxNo: 'XD-0520-01', cupType: '中杯/大杯', arrivalDate: dateStr(18), station: '吧台A', status: 'in_use', createdAt: dateStr(18) + 'T09:00:00' },
  { id: 'bx004', supplier: '鑫达包装', specification: '90mm 平盖', batchNo: 'XD-2026-0520', boxNo: 'XD-0520-02', cupType: '中杯/大杯', arrivalDate: dateStr(18), station: '吧台B', status: 'in_use', createdAt: dateStr(18) + 'T09:05:00' },
  { id: 'bx005', supplier: '嘉诚塑业', specification: '90mm 穹顶盖', batchNo: 'JC-2026-0525', boxNo: 'JC-0525-01', cupType: '大杯/超大杯', arrivalDate: dateStr(10), station: '吧台C', status: 'in_use', createdAt: dateStr(10) + 'T10:00:00' },
  { id: 'bx006', supplier: '嘉诚塑业', specification: '90mm 穹顶盖', batchNo: 'JC-2026-0525', boxNo: 'JC-0525-02', cupType: '大杯/超大杯', arrivalDate: dateStr(10), station: '', status: 'in_stock', createdAt: dateStr(10) + 'T10:05:00' },
]

const INITIAL_STATIONS: Station[] = [
  { id: 'st001', name: '吧台A', currentBoxId: 'bx003', startedAt: dateStr(15) + 'T07:30:00', consumedCount: 87 },
  { id: 'st002', name: '吧台B', currentBoxId: 'bx004', startedAt: dateStr(12) + 'T08:00:00', consumedCount: 64 },
  { id: 'st003', name: '吧台C', currentBoxId: 'bx005', startedAt: dateStr(8) + 'T09:00:00', consumedCount: 42 },
]

const orderTimeStr = (daysAgo: number, hour: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, Math.floor(Math.random() * 60), 0)
  return d.toISOString()
}

const INITIAL_ORDERS: Order[] = [
  { id: 'od001', orderNo: 'DD20260601001', boxId: 'bx003', stationId: 'st001', createdAt: orderTimeStr(15, 10) },
  { id: 'od002', orderNo: 'DD20260601002', boxId: 'bx003', stationId: 'st001', createdAt: orderTimeStr(14, 11) },
  { id: 'od003', orderNo: 'DD20260602003', boxId: 'bx004', stationId: 'st002', createdAt: orderTimeStr(13, 14) },
  { id: 'od004', orderNo: 'DD20260603004', boxId: 'bx003', stationId: 'st001', createdAt: orderTimeStr(12, 9) },
  { id: 'od005', orderNo: 'DD20260603005', boxId: 'bx005', stationId: 'st003', createdAt: orderTimeStr(12, 15) },
  { id: 'od006', orderNo: 'DD20260604006', boxId: 'bx004', stationId: 'st002', createdAt: orderTimeStr(11, 10) },
  { id: 'od007', orderNo: 'DD20260604007', boxId: 'bx003', stationId: 'st001', createdAt: orderTimeStr(11, 16) },
  { id: 'od008', orderNo: 'DD20260605008', boxId: 'bx005', stationId: 'st003', createdAt: orderTimeStr(10, 11) },
  { id: 'od009', orderNo: 'DD20260605009', boxId: 'bx004', stationId: 'st002', createdAt: orderTimeStr(10, 13) },
  { id: 'od010', orderNo: 'DD20260606010', boxId: 'bx003', stationId: 'st001', createdAt: orderTimeStr(9, 10) },
  { id: 'od011', orderNo: 'DD20260606011', boxId: 'bx005', stationId: 'st003', createdAt: orderTimeStr(9, 14) },
  { id: 'od012', orderNo: 'DD20260607012', boxId: 'bx004', stationId: 'st002', createdAt: orderTimeStr(8, 9) },
  { id: 'od013', orderNo: 'DD20260607013', boxId: 'bx003', stationId: 'st001', createdAt: orderTimeStr(8, 15) },
  { id: 'od014', orderNo: 'DD20260608014', boxId: 'bx005', stationId: 'st003', createdAt: orderTimeStr(7, 10) },
  { id: 'od015', orderNo: 'DD20260608015', boxId: 'bx004', stationId: 'st002', createdAt: orderTimeStr(7, 16) },
  { id: 'od016', orderNo: 'DD20260609016', boxId: 'bx003', stationId: 'st001', createdAt: orderTimeStr(6, 11) },
  { id: 'od017', orderNo: 'DD20260609017', boxId: 'bx005', stationId: 'st003', createdAt: orderTimeStr(6, 14) },
  { id: 'od018', orderNo: 'DD20260610018', boxId: 'bx004', stationId: 'st002', createdAt: orderTimeStr(5, 9) },
  { id: 'od019', orderNo: 'DD20260610019', boxId: 'bx003', stationId: 'st001', createdAt: orderTimeStr(5, 13) },
  { id: 'od020', orderNo: 'DD20260611020', boxId: 'bx005', stationId: 'st003', createdAt: orderTimeStr(4, 10) },
]

const INITIAL_COMPLAINTS: Complaint[] = [
  { id: 'cp001', orderNo: 'DD20260601001', orderBoxId: 'bx003', problemType: 'leak', createdAt: orderTimeStr(14, 18) },
  { id: 'cp002', orderNo: 'DD20260603005', orderBoxId: 'bx005', problemType: 'burst', createdAt: orderTimeStr(11, 20) },
  { id: 'cp003', orderNo: 'DD20260604006', orderBoxId: 'bx004', problemType: 'loose', createdAt: orderTimeStr(10, 19) },
  { id: 'cp004', orderNo: 'DD20260606010', orderBoxId: 'bx003', problemType: 'leak', createdAt: orderTimeStr(8, 17) },
  { id: 'cp005', orderNo: 'DD20260608014', orderBoxId: 'bx005', problemType: 'burst', createdAt: orderTimeStr(6, 21) },
]

const INITIAL_BATCHES: BatchInfo[] = [
  { batchNo: 'XD-2026-0512', supplier: '鑫达包装', status: 'normal' },
  { batchNo: 'XD-2026-0520', supplier: '鑫达包装', status: 'normal' },
  { batchNo: 'JC-2026-0525', supplier: '嘉诚塑业', status: 'normal' },
]

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      boxes: INITIAL_BOXES,
      stations: INITIAL_STATIONS,
      orders: INITIAL_ORDERS,
      complaints: INITIAL_COMPLAINTS,
      batches: INITIAL_BATCHES,

      addBox: (boxData) => {
        const box: Box = {
          ...boxData,
          id: 'bx' + generateId(),
          status: 'in_stock',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          boxes: [box, ...state.boxes],
          batches: state.batches.some((b) => b.batchNo === boxData.batchNo)
            ? state.batches
            : [...state.batches, { batchNo: boxData.batchNo, supplier: boxData.supplier, status: 'normal' }],
        }))
      },

      startUsingBox: (stationId, boxId) => {
        set((state) => {
          const station = state.stations.find((s) => s.id === stationId)
          const newStations = state.stations.map((s) => {
            if (s.id === stationId) {
              return { ...s, currentBoxId: boxId, startedAt: new Date().toISOString(), consumedCount: 0 }
            }
            return s
          })
          const oldBoxId = station?.currentBoxId
          const newBoxes = state.boxes.map((b) => {
            if (b.id === boxId) return { ...b, status: 'in_use' as BoxStatus, station: state.stations.find((s) => s.id === stationId)?.name || '' }
            if (oldBoxId && b.id === oldBoxId) return { ...b, status: 'used_up' as BoxStatus }
            return b
          })
          return { boxes: newBoxes, stations: newStations }
        })
      },

      suspendBatch: (batchNo) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.batchNo === batchNo ? { ...b, status: 'suspended' as BatchStatus } : b
          ),
          boxes: state.boxes.map((b) =>
            b.batchNo === batchNo ? { ...b, status: 'suspended' as BoxStatus } : b
          ),
          stations: state.stations.map((s) => {
            const currentBox = state.boxes.find((b) => b.id === s.currentBoxId)
            if (currentBox && currentBox.batchNo === batchNo) {
              return { ...s, currentBoxId: null, startedAt: null }
            }
            return s
          }),
        }))
      },

      resumeBatch: (batchNo) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.batchNo === batchNo ? { ...b, status: 'normal' as BatchStatus } : b
          ),
          boxes: state.boxes.map((b) =>
            b.batchNo === batchNo && b.status === 'suspended' ? { ...b, status: 'in_stock' as BoxStatus } : b
          ),
        }))
      },

      addOrder: (orderNo, stationId) => {
        const station = get().stations.find((s) => s.id === stationId)
        if (!station?.currentBoxId) return
        const order: Order = {
          id: 'od' + generateId(),
          orderNo,
          boxId: station.currentBoxId,
          stationId,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          orders: [order, ...state.orders],
          stations: state.stations.map((s) =>
            s.id === stationId ? { ...s, consumedCount: s.consumedCount + 1 } : s
          ),
        }))
      },

      addComplaint: (orderNo, problemType) => {
        const order = get().orders.find((o) => o.orderNo === orderNo)
        if (!order) return
        const complaint: Complaint = {
          id: 'cp' + generateId(),
          orderNo,
          orderBoxId: order.boxId,
          problemType,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          complaints: [complaint, ...state.complaints],
        }))
      },

      getBoxById: (id) => get().boxes.find((b) => b.id === id),

      getStationById: (id) => get().stations.find((s) => s.id === id),

      getOrdersByBatchNo: (batchNo) => {
        const boxIds = get().boxes.filter((b) => b.batchNo === batchNo).map((b) => b.id)
        return get().orders.filter((o) => boxIds.includes(o.boxId))
      },

      getComplaintsByBatchNo: (batchNo) => {
        const boxIds = get().boxes.filter((b) => b.batchNo === batchNo).map((b) => b.id)
        return get().complaints.filter((c) => boxIds.includes(c.orderBoxId))
      },

      getBatchStats: () => {
        const { boxes, orders, complaints } = get()
        return get().batches.map((batch) => {
          const batchBoxes = boxes.filter((b) => b.batchNo === batch.batchNo)
          const batchBoxIds = batchBoxes.map((b) => b.id)
          const batchOrders = orders.filter((o) => batchBoxIds.includes(o.boxId))
          const batchComplaints = complaints.filter((c) => batchBoxIds.includes(c.orderBoxId))
          const totalOrders = batchOrders.length || 1
          const earliestArrival = batchBoxes.reduce((min, b) => (b.arrivalDate < min ? b.arrivalDate : min), batchBoxes[0]?.arrivalDate || '')
          const turnoverDays = earliestArrival ? Math.max(1, Math.floor((Date.now() - new Date(earliestArrival).getTime()) / 86400000)) : 0
          return {
            batchNo: batch.batchNo,
            supplier: batch.supplier,
            totalBoxes: batchBoxes.length,
            inStockBoxes: batchBoxes.filter((b) => b.status === 'in_stock').length,
            inUseBoxes: batchBoxes.filter((b) => b.status === 'in_use').length,
            complaintCount: batchComplaints.length,
            complaintRate: batchComplaints.length / totalOrders,
            turnoverDays,
          }
        })
      },

      getSupplierStats: () => {
        const { boxes, complaints, orders } = get()
        const suppliers = [...new Set(boxes.map((b) => b.supplier))]
        return suppliers.map((supplier) => {
          const supplierBoxes = boxes.filter((b) => b.supplier === supplier)
          const supplierBoxIds = supplierBoxes.map((b) => b.id)
          const supplierOrders = orders.filter((o) => supplierBoxIds.includes(o.boxId))
          const supplierComplaints = complaints.filter((c) => supplierBoxIds.includes(c.orderBoxId))
          const totalOrders = supplierOrders.length || 1
          return {
            supplier,
            totalBoxes: supplierBoxes.length,
            complaintCount: supplierComplaints.length,
            complaintRate: supplierComplaints.length / totalOrders,
          }
        }).sort((a, b) => a.complaintRate - b.complaintRate)
      },

      resetStore: () => {
        set({
          boxes: INITIAL_BOXES,
          stations: INITIAL_STATIONS,
          orders: INITIAL_ORDERS,
          complaints: INITIAL_COMPLAINTS,
          batches: INITIAL_BATCHES,
        })
      },
    }),
    {
      name: 'lid-tracker-store',
    }
  )
)
