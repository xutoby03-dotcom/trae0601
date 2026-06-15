export interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

export interface Item {
  id: string;
  orderId: string;
  name: string;
  buyerId: string;
  price: number;
  quantity: number;
  weight: number;
  isReturned: boolean;
  screenshot?: string;
  remark?: string;
}

export type AdjustmentType = 'out_of_stock' | 'refund' | 'additional_tax' | 'other';

export interface Adjustment {
  id: string;
  orderId: string;
  type: AdjustmentType;
  amount: number;
  description: string;
  targetParticipantId?: string;
  createdAt: number;
}

export interface Settlement {
  orderId: string;
  participantId: string;
  itemsTotal: number;
  shippingShare: number;
  taxShare: number;
  adjustmentShare: number;
  totalPayable: number;
  amountPaid: number;
  refundDue: number;
  isPickedUp: boolean;
  isPaid: boolean;
}

export type AllocationMethod = 'by_amount' | 'by_weight';
export type OrderStatus = 'draft' | 'active' | 'completed';

export interface Order {
  id: string;
  platform: string;
  exchangeRate: number;
  trackingNumber: string;
  totalShipping: number;
  totalTax: number;
  participants: Participant[];
  items: Item[];
  adjustments: Adjustment[];
  allocationMethod: AllocationMethod;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}

export interface ParticipantAllocation {
  shipping: number;
  tax: number;
}

export interface AdjustmentTypeOption {
  value: AdjustmentType;
  label: string;
  color: string;
}

export const ADJUSTMENT_TYPES: AdjustmentTypeOption[] = [
  { value: 'out_of_stock', label: '缺货', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'refund', label: '退款', color: 'text-green-600 bg-green-50' },
  { value: 'additional_tax', label: '补税', color: 'text-red-600 bg-red-50' },
  { value: 'other', label: '其他', color: 'text-gray-600 bg-gray-50' },
];

export const PLATFORMS = [
  'Amazon',
  'eBay',
  'Target',
  'Walmart',
  'Sephora',
  'ULTA',
  'Cult Beauty',
  'Lookfantastic',
  'SkinStore',
  'iHerb',
  '其他',
];

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatCurrency = (amount: number, currency: 'CNY' | 'USD' = 'CNY'): string => {
  const symbols = { CNY: '¥', USD: '$' };
  return `${symbols[currency]}${amount.toFixed(2)}`;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
