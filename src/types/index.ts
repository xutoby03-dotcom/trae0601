export enum OrderStatus {
  EMBRYO_READY = 'embryo_ready',
  FILLING_DONE = 'filling_done',
  CRUSTING = 'crusting',
  PIPING = 'piping',
  CHILLED = 'chilled',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.EMBRYO_READY]: '胚子已备',
  [OrderStatus.FILLING_DONE]: '夹心完成',
  [OrderStatus.CRUSTING]: '抹面中',
  [OrderStatus.PIPING]: '裱花中',
  [OrderStatus.CHILLED]: '冷藏待取',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  OrderStatus.EMBRYO_READY,
  OrderStatus.FILLING_DONE,
  OrderStatus.CRUSTING,
  OrderStatus.PIPING,
  OrderStatus.CHILLED,
];

export interface Chef {
  id: string;
  name: string;
  avatar: string;
  isRookie: boolean;
  skillLevel: number;
}

export enum ContactStatus {
  PENDING = 'pending',
  CONTACTED = 'contacted',
}

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  [ContactStatus.PENDING]: '待联系',
  [ContactStatus.CONTACTED]: '已联系',
};

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  phone: string;
  fullPhone: string;
  size: string;
  flavor: string;
  theme: string;
  complexity: number;
  customerNote: string;
  referenceImageUrl?: string;
  depositPaid: boolean;
  pickupTime: string;
  status: OrderStatus;
  chefId?: string;
  createdAt: string;
  contactStatus: ContactStatus;
  contactTime?: string;
  contactNote?: string;
}

export interface StatusLog {
  id: string;
  orderId: string;
  status: OrderStatus;
  changedAt: string;
  changedBy: string;
}
