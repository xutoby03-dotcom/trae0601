import { create } from 'zustand';
import type { StoreState, Sample, ShipmentOrder, InventoryLog, ShipmentStatus, StatisticsData } from './types';
import { generateMockSamples, generateMockShipmentOrders, generateMockInventoryLogs } from './mockData';
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/storage';
import { format, parseISO, isDateInRange } from '@/utils/date';
import { getExpressCompanyName } from '@/utils/express';

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

const getNowStr = () => format(new Date(), 'yyyy-MM-dd HH:mm:ss');

const initializeMockData = () => {
  const samples = generateMockSamples();
  const shipmentOrders = generateMockShipmentOrders(samples);
  const inventoryLogs = generateMockInventoryLogs(samples, shipmentOrders);
  return { samples, shipmentOrders, inventoryLogs };
};

export const useStore = create<StoreState>((set, get) => ({
  samples: [],
  shipmentOrders: [],
  inventoryLogs: [],

  createShipmentOrder: (data) => {
    const state = get();
    const sample = state.samples.find(s => s.id === data.sampleId);
    
    if (!sample || sample.stockQuantity < data.quantity) {
      return null;
    }

    const now = getNowStr();
    const orderId = generateId('order');
    
    const newOrder: ShipmentOrder = {
      ...data,
      id: orderId,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const updatedSamples = state.samples.map(s => 
      s.id === data.sampleId 
        ? { ...s, stockQuantity: s.stockQuantity - data.quantity, updatedAt: now }
        : s
    );

    const newLog: InventoryLog = {
      id: generateId('log'),
      sampleId: data.sampleId,
      shipmentOrderId: orderId,
      operationType: 'out',
      quantityChange: -data.quantity,
      balanceAfter: sample.stockQuantity - data.quantity,
      operator: data.sender,
      remark: `寄样单出库: ${data.customerName}`,
      createdAt: now,
    };

    set({
      shipmentOrders: [newOrder, ...state.shipmentOrders],
      samples: updatedSamples,
      inventoryLogs: [newLog, ...state.inventoryLogs],
    });

    get().saveToStorage();
    return orderId;
  },

  updateShipmentStatus: (id, status, data) => {
    const state = get();
    const now = getNowStr();
    
    const updatedOrders = state.shipmentOrders.map(order =>
      order.id === id
        ? { ...order, status, ...data, updatedAt: now }
        : order
    );

    set({ shipmentOrders: updatedOrders });
    get().saveToStorage();
  },

  recordFeedback: (id, feedback, needReissue, convertedToOrder) => {
    const state = get();
    const now = getNowStr();
    
    const updatedOrders = state.shipmentOrders.map(order =>
      order.id === id
        ? { ...order, feedback, needReissue, convertedToOrder, updatedAt: now }
        : order
    );

    set({ shipmentOrders: updatedOrders });
    get().saveToStorage();
  },

  markAsFollowup: (id) => {
    get().updateShipmentStatus(id, 'followup');
  },

  addSample: (sample) => {
    const state = get();
    const now = getNowStr();
    
    const newSample: Sample = {
      ...sample,
      id: generateId('sample'),
      createdAt: now,
      updatedAt: now,
    };

    const newLog: InventoryLog = {
      id: generateId('log'),
      sampleId: newSample.id,
      shipmentOrderId: null,
      operationType: 'in',
      quantityChange: sample.stockQuantity,
      balanceAfter: sample.stockQuantity,
      operator: '管理员',
      remark: '新增样品入库',
      createdAt: now,
    };

    set({
      samples: [...state.samples, newSample],
      inventoryLogs: [newLog, ...state.inventoryLogs],
    });

    get().saveToStorage();
  },

  updateStock: (sampleId, quantity, operator, remark) => {
    const state = get();
    const sample = state.samples.find(s => s.id === sampleId);
    if (!sample) return;

    const now = getNowStr();
    const newBalance = sample.stockQuantity + quantity;

    const updatedSamples = state.samples.map(s =>
      s.id === sampleId
        ? { ...s, stockQuantity: newBalance, updatedAt: now }
        : s
    );

    const newLog: InventoryLog = {
      id: generateId('log'),
      sampleId,
      shipmentOrderId: null,
      operationType: quantity > 0 ? 'in' : 'out',
      quantityChange: quantity,
      balanceAfter: newBalance,
      operator,
      remark,
      createdAt: now,
    };

    set({
      samples: updatedSamples,
      inventoryLogs: [newLog, ...state.inventoryLogs],
    });

    get().saveToStorage();
  },

  getOrdersByStatus: (status) => {
    return get().shipmentOrders.filter(order => order.status === status);
  },

  getOverdueOrders: () => {
    const state = get();
    const today = new Date();
    
    return state.shipmentOrders.filter(order => {
      if (order.status !== 'shipping' || !order.expectedArrivalDate) return false;
      return parseISO(order.expectedArrivalDate) < today;
    });
  },

  getStatistics: (startDate, endDate) => {
    const state = get();
    const orders = state.shipmentOrders;
    
    const filteredOrders = startDate && endDate
      ? orders.filter(o => isDateInRange(o.createdAt, startDate, endDate))
      : orders;

    const sampleCountMap = new Map<string, number>();
    const monthMap = new Map<string, { shipments: number; conversions: number }>();
    const expressMap = new Map<string, { total: number; overdue: number }>();

    let convertedCount = 0;
    let reissueCount = 0;
    let overdueCount = 0;

    filteredOrders.forEach(order => {
      sampleCountMap.set(order.sampleName, (sampleCountMap.get(order.sampleName) || 0) + order.quantity);
      
      const month = order.createdAt.substring(0, 7);
      const monthData = monthMap.get(month) || { shipments: 0, conversions: 0 };
      monthData.shipments++;
      if (order.convertedToOrder) monthData.conversions++;
      monthMap.set(month, monthData);

      if (order.expressCompany) {
        const expressName = getExpressCompanyName(order.expressCompany);
        const expressData = expressMap.get(expressName) || { total: 0, overdue: 0 };
        expressData.total++;
        if (order.status === 'shipping' && order.expectedArrivalDate) {
          if (parseISO(order.expectedArrivalDate) < new Date()) {
            expressData.overdue++;
            overdueCount++;
          }
        }
        expressMap.set(expressName, expressData);
      }

      if (order.convertedToOrder) convertedCount++;
      if (order.needReissue) reissueCount++;
    });

    const topSamples = Array.from(sampleCountMap.entries())
      .map(([sampleName, count]) => ({ sampleName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const monthlyTrend = Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, shipments: data.shipments, conversions: data.conversions }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const expressPerformance = Array.from(expressMap.entries())
      .map(([company, data]) => ({
        company,
        total: data.total,
        overdue: data.overdue,
        rate: data.total > 0 ? Math.round((data.overdue / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const deliveredCount = filteredOrders.filter(o => o.status === 'delivered' || o.status === 'followup').length;

    return {
      totalShipments: filteredOrders.length,
      pendingCount: filteredOrders.filter(o => o.status === 'pending').length,
      shippingCount: filteredOrders.filter(o => o.status === 'shipping').length,
      deliveredCount,
      followupCount: filteredOrders.filter(o => o.status === 'followup').length,
      conversionRate: deliveredCount > 0 ? Math.round((convertedCount / deliveredCount) * 100) : 0,
      reissueRate: filteredOrders.length > 0 ? Math.round((reissueCount / filteredOrders.length) * 100) : 0,
      overdueCount,
      topSamples,
      monthlyTrend,
      expressPerformance,
    };
  },

  searchOrders: (keyword) => {
    const state = get();
    const lowerKeyword = keyword.toLowerCase();
    
    return state.shipmentOrders.filter(order =>
      order.customerName.toLowerCase().includes(lowerKeyword) ||
      order.sampleName.toLowerCase().includes(lowerKeyword) ||
      order.trackingNumber.toLowerCase().includes(lowerKeyword) ||
      order.contactPerson.toLowerCase().includes(lowerKeyword) ||
      order.contactPhone.includes(lowerKeyword)
    );
  },

  loadFromStorage: () => {
    const data = loadFromLocalStorage();
    if (data) {
      set({
        samples: data.samples as Sample[],
        shipmentOrders: data.shipmentOrders as ShipmentOrder[],
        inventoryLogs: data.inventoryLogs as InventoryLog[],
      });
    } else {
      const mockData = initializeMockData();
      set(mockData);
      saveToLocalStorage(mockData);
    }
  },

  saveToStorage: () => {
    const state = get();
    saveToLocalStorage({
      samples: state.samples,
      shipmentOrders: state.shipmentOrders,
      inventoryLogs: state.inventoryLogs,
    });
  },
}));
