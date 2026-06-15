import { create } from 'zustand';
import type {
  ExchangeRequest,
  InventoryItem,
  ExchangeRecord,
  ClothingType,
  Size,
  RequestStatus,
  OperationType,
} from '@/types';
import { mockRequests, mockInventory, mockRecords } from '@/data/mockData';

interface AppState {
  requests: ExchangeRequest[];
  inventory: InventoryItem[];
  records: ExchangeRecord[];
  selectedClass: string | null;
  selectedClothingType: ClothingType | null;

  addRequest: (
    request: Omit<ExchangeRequest, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  updateRequestStatus: (id: string, status: RequestStatus) => void;
  getInventoryQuantity: (clothingType: ClothingType, size: Size) => number;
  matchStock: (requestId: string) => boolean;
  matchSwap: (requestId: string) => ExchangeRequest | null;
  confirmStockExchange: (requestId: string, operator: string) => void;
  confirmSwapExchange: (
    requestId1: string,
    requestId2: string,
    operator: string
  ) => void;
  markManual: (requestId: string, operator: string, remark?: string) => void;
  updateInventory: (
    clothingType: ClothingType,
    size: Size,
    delta: number,
    operator: string,
    remark?: string
  ) => void;
  addRecord: (record: Omit<ExchangeRecord, 'id' | 'createdAt'>) => void;
  setSelectedClass: (className: string | null) => void;
  setSelectedClothingType: (type: ClothingType | null) => void;
  getClasses: () => string[];
  getShortageByClass: () => Record<
    string,
    Record<ClothingType, Record<Size, number>>
  >;
}

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAppStore = create<AppState>((set, get) => ({
  requests: mockRequests,
  inventory: mockInventory,
  records: mockRecords,
  selectedClass: null,
  selectedClothingType: null,

  addRequest: (request) => {
    const now = new Date().toISOString();
    const newRequest: ExchangeRequest = {
      ...request,
      id: generateId('req'),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      requests: [newRequest, ...state.requests],
    }));
  },

  updateRequestStatus: (id, status) => {
    const now = new Date().toISOString();
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id ? { ...req, status, updatedAt: now } : req
      ),
    }));
  },

  getInventoryQuantity: (clothingType, size) => {
    const item = get().inventory.find(
      (inv) => inv.clothingType === clothingType && inv.size === size
    );
    return item?.quantity || 0;
  },

  matchStock: (requestId) => {
    const request = get().requests.find((r) => r.id === requestId);
    if (!request) return false;
    const quantity = get().getInventoryQuantity(
      request.clothingType,
      request.targetSize
    );
    return quantity > 0 && request.tagStatus === 'intact';
  },

  matchSwap: (requestId) => {
    const request = get().requests.find((r) => r.id === requestId);
    if (!request || request.tagStatus !== 'intact') return null;

    const swapRequest = get().requests.find(
      (r) =>
        r.id !== requestId &&
        r.status === 'pending' &&
        r.tagStatus === 'intact' &&
        r.grade === request.grade &&
        r.clothingType === request.clothingType &&
        r.originalSize === request.targetSize &&
        r.targetSize === request.originalSize
    );
    return swapRequest || null;
  },

  confirmStockExchange: (requestId, operator) => {
    const request = get().requests.find((r) => r.id === requestId);
    if (!request || request.tagStatus !== 'intact') return;

    const now = new Date().toISOString();

    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === requestId
          ? { ...req, status: 'exchanged' as RequestStatus, updatedAt: now }
          : req
      ),
      inventory: state.inventory.map((inv) =>
        inv.clothingType === request.clothingType && inv.size === request.targetSize
          ? { ...inv, quantity: inv.quantity - 1, updatedAt: now }
          : inv
      ),
    }));

    get().addRecord({
      operationType: 'match_stock',
      requestId,
      studentName: request.studentName,
      className: request.className,
      clothingType: request.clothingType,
      originalSize: request.originalSize,
      targetSize: request.targetSize,
      quantity: 1,
      operator,
    });

    get().addRecord({
      operationType: 'exchange_out',
      clothingType: request.clothingType,
      targetSize: request.targetSize,
      quantity: -1,
      operator,
      remark: `库存调换 - ${request.studentName}`,
    });

    get().addRecord({
      operationType: 'exchange_in',
      clothingType: request.clothingType,
      targetSize: request.originalSize,
      quantity: 1,
      operator,
      remark: `回收 - ${request.studentName}`,
    });

    set((state) => {
      const existingItem = state.inventory.find(
        (inv) =>
          inv.clothingType === request.clothingType &&
          inv.size === request.originalSize
      );
      if (existingItem) {
        return {
          inventory: state.inventory.map((inv) =>
            inv.id === existingItem.id
              ? { ...inv, quantity: inv.quantity + 1, updatedAt: now }
              : inv
          ),
        };
      }
      return {
        inventory: [
          ...state.inventory,
          {
            id: generateId('inv'),
            clothingType: request.clothingType,
            size: request.originalSize,
            quantity: 1,
            updatedAt: now,
          },
        ],
      };
    });
  },

  confirmSwapExchange: (requestId1, requestId2, operator) => {
    const req1 = get().requests.find((r) => r.id === requestId1);
    const req2 = get().requests.find((r) => r.id === requestId2);
    if (!req1 || !req2) return;

    const now = new Date().toISOString();

    set((state) => ({
      requests: state.requests.map((req) => {
        if (req.id === requestId1 || req.id === requestId2) {
          return { ...req, status: 'exchanged' as RequestStatus, updatedAt: now };
        }
        return req;
      }),
    }));

    get().addRecord({
      operationType: 'match_swap',
      requestId: requestId1,
      studentName: `${req1.studentName} ↔ ${req2.studentName}`,
      className: `${req1.className} / ${req2.className}`,
      clothingType: req1.clothingType,
      originalSize: req1.originalSize,
      targetSize: req1.targetSize,
      quantity: 1,
      operator,
      remark: `同年级互换撮合：${req1.studentName}(${req1.originalSize}→${req1.targetSize}) ↔ ${req2.studentName}(${req2.originalSize}→${req2.targetSize})`,
    });

    get().addRecord({
      operationType: 'exchange_out',
      requestId: requestId1,
      studentName: req1.studentName,
      className: req1.className,
      clothingType: req1.clothingType,
      originalSize: req1.originalSize,
      targetSize: undefined,
      quantity: 1,
      operator,
      remark: `互换换出：${req1.studentName} 交出 ${req1.originalSize} 码给 ${req2.studentName}`,
    });

    get().addRecord({
      operationType: 'exchange_in',
      requestId: requestId1,
      studentName: req1.studentName,
      className: req1.className,
      clothingType: req1.clothingType,
      originalSize: undefined,
      targetSize: req1.targetSize,
      quantity: 1,
      operator,
      remark: `互换换入：${req1.studentName} 从 ${req2.studentName} 收到 ${req1.targetSize} 码`,
    });

    get().addRecord({
      operationType: 'exchange_out',
      requestId: requestId2,
      studentName: req2.studentName,
      className: req2.className,
      clothingType: req2.clothingType,
      originalSize: req2.originalSize,
      targetSize: undefined,
      quantity: 1,
      operator,
      remark: `互换换出：${req2.studentName} 交出 ${req2.originalSize} 码给 ${req1.studentName}`,
    });

    get().addRecord({
      operationType: 'exchange_in',
      requestId: requestId2,
      studentName: req2.studentName,
      className: req2.className,
      clothingType: req2.clothingType,
      originalSize: undefined,
      targetSize: req2.targetSize,
      quantity: 1,
      operator,
      remark: `互换换入：${req2.studentName} 从 ${req1.studentName} 收到 ${req2.targetSize} 码`,
    });
  },

  markManual: (requestId, operator, remark) => {
    const request = get().requests.find((r) => r.id === requestId);
    if (!request) return;

    const now = new Date().toISOString();

    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === requestId
          ? { ...req, status: 'manual' as RequestStatus, updatedAt: now }
          : req
      ),
    }));

    get().addRecord({
      operationType: 'manual_process',
      requestId,
      studentName: request.studentName,
      className: request.className,
      clothingType: request.clothingType,
      originalSize: request.originalSize,
      targetSize: request.targetSize,
      quantity: 1,
      operator,
      remark: remark || '吊牌问题，登记人工处理',
    });
  },

  updateInventory: (clothingType, size, delta, operator, remark) => {
    const now = new Date().toISOString();
    const operationType: OperationType = delta > 0 ? 'stock_in' : 'stock_out';

    set((state) => {
      const existingItem = state.inventory.find(
        (inv) => inv.clothingType === clothingType && inv.size === size
      );
      if (existingItem) {
        return {
          inventory: state.inventory.map((inv) =>
            inv.id === existingItem.id
              ? { ...inv, quantity: Math.max(0, inv.quantity + delta), updatedAt: now }
              : inv
          ),
        };
      }
      if (delta > 0) {
        return {
          inventory: [
            ...state.inventory,
            {
              id: generateId('inv'),
              clothingType,
              size,
              quantity: delta,
              updatedAt: now,
            },
          ],
        };
      }
      return state;
    });

    get().addRecord({
      operationType,
      clothingType,
      targetSize: size,
      quantity: Math.abs(delta),
      operator,
      remark,
    });
  },

  addRecord: (record) => {
    const newRecord: ExchangeRecord = {
      ...record,
      id: generateId('rec'),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      records: [newRecord, ...state.records],
    }));
  },

  setSelectedClass: (className) => set({ selectedClass: className }),
  setSelectedClothingType: (type) => set({ selectedClothingType: type }),

  getClasses: () => {
    const classes = new Set(get().requests.map((r) => r.className));
    return Array.from(classes).sort();
  },

  getShortageByClass: () => {
    const { requests } = get();
    const shortage: Record<
      string,
      Record<ClothingType, Record<Size, number>>
    > = {};

    const clothingTypes: ClothingType[] = [
      'summer_short',
      'summer_long',
      'winter_coat',
      'sportswear',
    ];
    const sizes: Size[] = ['120', '130', '140', '150', '160', '170', '180', '190'];

    requests
      .filter((r) => r.status === 'pending' || r.status === 'matched')
      .forEach((req) => {
        if (!shortage[req.className]) {
          shortage[req.className] = {} as Record<ClothingType, Record<Size, number>>;
          clothingTypes.forEach((ct) => {
            shortage[req.className][ct] = {} as Record<Size, number>;
            sizes.forEach((s) => {
              shortage[req.className][ct][s] = 0;
            });
          });
        }
        shortage[req.className][req.clothingType][req.targetSize] += 1;
        shortage[req.className][req.clothingType][req.originalSize] -= 1;
      });

    return shortage;
  },
}));
