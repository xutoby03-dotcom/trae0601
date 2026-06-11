export type ShipmentStatus = 'pending' | 'shipping' | 'delivered' | 'followup';

export type ExpressCompany = 'sf' | 'jd' | 'yt' | 'zt' | 'yd' | 'ems' | 'other';

export interface Sample {
  id: string;
  name: string;
  sku: string;
  category: string;
  batch: string;
  stockQuantity: number;
  warningThreshold: number;
  unit: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentOrder {
  id: string;
  customerName: string;
  contactPerson: string;
  contactPhone: string;
  customerAddress: string;
  sampleId: string;
  sampleName: string;
  quantity: number;
  batch: string;
  expressCompany: ExpressCompany;
  trackingNumber: string;
  sender: string;
  sendDate: string | null;
  expectedArrivalDate: string | null;
  actualArrivalDate: string | null;
  status: ShipmentStatus;
  feedback: string;
  needReissue: boolean;
  convertedToOrder: boolean;
  reissueOrderId: string | null;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  sampleId: string;
  shipmentOrderId: string | null;
  operationType: 'in' | 'out' | 'adjust';
  quantityChange: number;
  balanceAfter: number;
  operator: string;
  remark: string;
  createdAt: string;
}

export interface StatisticsData {
  totalShipments: number;
  pendingCount: number;
  shippingCount: number;
  deliveredCount: number;
  followupCount: number;
  conversionRate: number;
  reissueRate: number;
  overdueCount: number;
  topSamples: { sampleName: string; count: number }[];
  monthlyTrend: { month: string; shipments: number; conversions: number }[];
  expressPerformance: { company: string; total: number; overdue: number; rate: number }[];
}

export interface StoreState {
  samples: Sample[];
  shipmentOrders: ShipmentOrder[];
  inventoryLogs: InventoryLog[];
  
  createShipmentOrder: (data: Omit<ShipmentOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => string | null;
  updateShipmentStatus: (id: string, status: ShipmentStatus, data?: Partial<ShipmentOrder>) => void;
  recordFeedback: (id: string, feedback: string, needReissue: boolean, convertedToOrder: boolean) => void;
  markAsFollowup: (id: string) => void;
  
  addSample: (sample: Omit<Sample, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStock: (sampleId: string, quantity: number, operator: string, remark: string) => void;
  
  getOrdersByStatus: (status: ShipmentStatus) => ShipmentOrder[];
  getOverdueOrders: () => ShipmentOrder[];
  getStatistics: (startDate?: string, endDate?: string) => StatisticsData;
  searchOrders: (keyword: string) => ShipmentOrder[];
  
  loadFromStorage: () => void;
  saveToStorage: () => void;
}
