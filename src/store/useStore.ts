import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Medicine, StockRecord, DisposalRecord, LowStockEvent } from '@/types';
import { uid } from '@/utils/id';
import { addDaysStr, todayStr } from '@/utils/dateUtils';

const mockMedicines: Medicine[] = [
  {
    id: 'm1',
    name: '布洛芬缓释胶囊',
    category: '退烧药',
    emoji: '🤒',
    applicableTo: '成人',
    quantity: 1,
    unit: '盒',
    lowStockThreshold: 2,
    expiryDate: addDaysStr(15),
    openDate: addDaysStr(-30),
    storageLocation: '客厅药箱上层',
    isCommon: true,
    childWarning: true,
    notes: '发烧38.5度以上服用',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'm2',
    name: '999感冒灵颗粒',
    category: '感冒药',
    emoji: '🤧',
    applicableTo: '成人',
    quantity: 8,
    unit: '袋',
    lowStockThreshold: 5,
    expiryDate: addDaysStr(200),
    storageLocation: '客厅药箱中层',
    isCommon: true,
    childWarning: false,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'm3',
    name: '儿童退烧贴',
    category: '退烧药',
    emoji: '👶',
    applicableTo: '儿童',
    quantity: 0,
    unit: '片',
    lowStockThreshold: 4,
    expiryDate: addDaysStr(365),
    storageLocation: '儿童房抽屉',
    isCommon: true,
    childWarning: false,
    notes: '物理降温用',
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
  {
    id: 'm4',
    name: '创可贴（防水）',
    category: '创可贴/敷料',
    emoji: '🩹',
    applicableTo: '全部人群',
    quantity: 3,
    unit: '片',
    lowStockThreshold: 10,
    expiryDate: addDaysStr(400),
    storageLocation: '客厅药箱下层',
    isCommon: true,
    childWarning: false,
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
  },
  {
    id: 'm5',
    name: '碘伏消毒液',
    category: '碘伏/消毒',
    emoji: '🧪',
    applicableTo: '全部人群',
    quantity: 1,
    unit: '瓶',
    lowStockThreshold: 1,
    expiryDate: addDaysStr(-10),
    openDate: addDaysStr(-90),
    storageLocation: '卫生间镜柜',
    isCommon: true,
    childWarning: false,
    createdAt: new Date(Date.now() - 86400000 * 200).toISOString(),
  },
  {
    id: 'm6',
    name: '阿莫西林胶囊',
    category: '消炎药',
    emoji: '💊',
    applicableTo: '成人',
    quantity: 2,
    unit: '盒',
    lowStockThreshold: 1,
    expiryDate: addDaysStr(8),
    storageLocation: '客厅药箱上层',
    isCommon: false,
    childWarning: true,
    notes: '抗生素，需遵医嘱',
    createdAt: new Date(Date.now() - 86400000 * 150).toISOString(),
  },
  {
    id: 'm7',
    name: '蒙脱石散',
    category: '肠胃药',
    emoji: '🫃',
    applicableTo: '全部人群',
    quantity: 6,
    unit: '袋',
    lowStockThreshold: 3,
    expiryDate: addDaysStr(500),
    storageLocation: '客厅药箱中层',
    isCommon: true,
    childWarning: false,
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'm8',
    name: '云南白药气雾剂',
    category: '外用药',
    emoji: '🧴',
    applicableTo: '成人',
    quantity: 1,
    unit: '瓶',
    lowStockThreshold: 1,
    expiryDate: addDaysStr(25),
    storageLocation: '运动包',
    isCommon: false,
    childWarning: true,
    notes: '跌打损伤',
    createdAt: new Date(Date.now() - 86400000 * 100).toISOString(),
  },
  {
    id: 'm9',
    name: '维生素C泡腾片',
    category: '保健品',
    emoji: '💪',
    applicableTo: '全部人群',
    quantity: 15,
    unit: '片',
    lowStockThreshold: 5,
    expiryDate: addDaysStr(180),
    storageLocation: '客厅茶几',
    isCommon: true,
    childWarning: false,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'm10',
    name: '藿香正气水',
    category: '肠胃药',
    emoji: '☀️',
    applicableTo: '成人',
    quantity: 2,
    unit: '盒',
    lowStockThreshold: 1,
    expiryDate: addDaysStr(-5),
    storageLocation: '客厅药箱上层',
    isCommon: false,
    childWarning: true,
    createdAt: new Date(Date.now() - 86400000 * 400).toISOString(),
  },
];

const mockStockRecords: StockRecord[] = [
  { id: 's1', medicineId: 'm1', type: 'use', quantity: 1, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 's2', medicineId: 'm1', type: 'restock', quantity: 2, unitPrice: 25, purchaseChannel: '京东', purchaseDate: addDaysStr(-60), timestamp: new Date(Date.now() - 86400000 * 60).toISOString() },
  { id: 's3', medicineId: 'm2', type: 'use', quantity: 2, timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 's4', medicineId: 'm3', type: 'use', quantity: 2, timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 's5', medicineId: 'm3', type: 'use', quantity: 4, timestamp: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 's6', medicineId: 'm4', type: 'use', quantity: 5, timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 's7', medicineId: 'm7', type: 'use', quantity: 2, timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 's8', medicineId: 'm2', type: 'restock', quantity: 10, unitPrice: 18, purchaseChannel: '线下药店', purchaseDate: addDaysStr(-30), timestamp: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 's9', medicineId: 'm9', type: 'use', quantity: 5, timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 's10', medicineId: 'm4', type: 'restock', quantity: 20, unitPrice: 12, purchaseChannel: '淘宝/天猫', purchaseDate: addDaysStr(-120), timestamp: new Date(Date.now() - 86400000 * 120).toISOString() },
];

const mockLowStockEvents: LowStockEvent[] = [
  { id: 'lse1', medicineId: 'm1', previousQuantity: 2, newQuantity: 1, threshold: 2, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'lse2', medicineId: 'm3', previousQuantity: 2, newQuantity: 0, threshold: 4, timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'lse3', medicineId: 'm3', previousQuantity: 6, newQuantity: 2, threshold: 4, timestamp: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'lse4', medicineId: 'm4', previousQuantity: 8, newQuantity: 3, threshold: 10, timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 'lse5', medicineId: 'm4', previousQuantity: 15, newQuantity: 10, threshold: 10, timestamp: new Date(Date.now() - 86400000 * 14).toISOString() },
  { id: 'lse6', medicineId: 'm5', previousQuantity: 2, newQuantity: 1, threshold: 1, timestamp: new Date(Date.now() - 86400000 * 45).toISOString() },
];

interface StoreState {
  medicines: Medicine[];
  stockRecords: StockRecord[];
  disposalRecords: DisposalRecord[];
  lowStockEvents: LowStockEvent[];
  addMedicine: (data: Omit<Medicine, 'id' | 'createdAt'>) => void;
  updateMedicine: (id: string, data: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  useMedicine: (medicineId: string, quantity: number) => void;
  restockMedicine: (medicineId: string, quantity: number, unitPrice?: number, purchaseChannel?: string, purchaseDate?: string) => void;
  disposeMedicine: (medicineId: string, action: 'discard' | 'return' | 'other', notes?: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      medicines: mockMedicines,
      stockRecords: mockStockRecords,
      disposalRecords: [],
      lowStockEvents: mockLowStockEvents,

      addMedicine: (data) =>
        set((state) => ({
          medicines: [
            ...state.medicines,
            { ...data, id: uid(), createdAt: new Date().toISOString() },
          ],
        })),

      updateMedicine: (id, data) =>
        set((state) => ({
          medicines: state.medicines.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        })),

      deleteMedicine: (id) =>
        set((state) => ({
          medicines: state.medicines.filter((m) => m.id !== id),
          stockRecords: state.stockRecords.filter((r) => r.medicineId !== id),
          disposalRecords: state.disposalRecords.filter((r) => r.medicineId !== id),
          lowStockEvents: state.lowStockEvents.filter((e) => e.medicineId !== id),
        })),

      useMedicine: (medicineId, quantity) =>
        set((state) => {
          const medicine = state.medicines.find((m) => m.id === medicineId);
          if (!medicine) return state;

          const prevQty = medicine.quantity;
          const newQty = Math.max(0, prevQty - quantity);
          const wasAboveThreshold = prevQty > medicine.lowStockThreshold;
          const isNowAtOrBelow = newQty <= medicine.lowStockThreshold;

          const newLowStockEvent: LowStockEvent | null =
            wasAboveThreshold && isNowAtOrBelow
              ? {
                  id: uid(),
                  medicineId,
                  previousQuantity: prevQty,
                  newQuantity: newQty,
                  threshold: medicine.lowStockThreshold,
                  timestamp: new Date().toISOString(),
                }
              : null;

          return {
            medicines: state.medicines.map((m) =>
              m.id === medicineId ? { ...m, quantity: newQty } : m
            ),
            stockRecords: [
              ...state.stockRecords,
              {
                id: uid(),
                medicineId,
                type: 'use',
                quantity,
                timestamp: new Date().toISOString(),
              },
            ],
            ...(newLowStockEvent
              ? { lowStockEvents: [...state.lowStockEvents, newLowStockEvent] }
              : {}),
          };
        }),

      restockMedicine: (medicineId, quantity, unitPrice, purchaseChannel, purchaseDate) =>
        set((state) => ({
          medicines: state.medicines.map((m) =>
            m.id === medicineId ? { ...m, quantity: m.quantity + quantity } : m
          ),
          stockRecords: [
            ...state.stockRecords,
            {
              id: uid(),
              medicineId,
              type: 'restock',
              quantity,
              unitPrice,
              purchaseChannel,
              purchaseDate: purchaseDate || todayStr(),
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      disposeMedicine: (medicineId, action, notes) =>
        set((state) => ({
          medicines: state.medicines.map((m) =>
            m.id === medicineId ? { ...m, disposed: true } : m
          ),
          disposalRecords: [
            ...state.disposalRecords,
            {
              id: uid(),
              medicineId,
              action,
              notes,
              timestamp: new Date().toISOString(),
            },
          ],
        })),
    }),
    {
      name: 'medicine-cabinet-storage',
    }
  )
);
