export type MaterialCategory = 'slogan' | 'lightSticker' | 'ticketHolder' | 'badge';

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  totalQuantity: number;
  remainingQuantity: number;
  cost: number;
  producer: string;
  image: string;
  bagNumber: string;
  description: string;
  createdAt: string;
}

export type MemberStatus = 'pending' | 'picked' | 'proxied';

export interface Member {
  id: string;
  name: string;
  phoneLastFour: string;
  seatSection: string;
  amountDue: number;
  canProxy: boolean;
  pickupPoint: string;
  status: MemberStatus;
  proxyById: string | null;
  pickupTime: string | null;
  queueStartTime: string | null;
  createdAt: string;
}

export interface PickupPoint {
  id: string;
  name: string;
  location: string;
}

export type InventoryLogType = 'reissue' | 'damaged' | 'missing';

export interface InventoryLog {
  id: string;
  materialId: string;
  type: InventoryLogType;
  quantity: number;
  reason: string;
  operator: string;
  createdAt: string;
}

export interface PickupRecord {
  id: string;
  memberId: string;
  pickupPointId: string;
  type: 'self' | 'proxy';
  proxyMemberId: string | null;
  queueStartTime: string;
  pickupTime: string;
  waitDuration: number;
}

export interface PickupPointStats {
  id: string;
  name: string;
  totalPickups: number;
  avgWaitTime: number;
  maxWaitTime: number;
}

export interface ReportData {
  totalMembers: number;
  pickedCount: number;
  pendingCount: number;
  proxiedCount: number;
  totalCost: number;
  avgCostPerPerson: number;
  materials: Material[];
  unpickedMembers: Member[];
  pickupPointStats: PickupPointStats[];
}

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  slogan: '手幅',
  lightSticker: '灯牌贴纸',
  ticketHolder: '票套',
  badge: '徽章',
};

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  pending: '待领取',
  picked: '已领取',
  proxied: '代领',
};

export const INVENTORY_LOG_TYPE_LABELS: Record<InventoryLogType, string> = {
  reissue: '补发',
  damaged: '破损',
  missing: '少带',
};
