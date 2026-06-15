export type ClothingType = 'summer_short' | 'summer_long' | 'winter_coat' | 'sportswear';

export type Size = '120' | '130' | '140' | '150' | '160' | '170' | '180' | '190';

export type TagStatus = 'intact' | 'removed' | 'damaged';

export type RequestStatus = 'pending' | 'matched' | 'exchanged' | 'manual' | 'cancelled';

export type OperationType =
  | 'exchange_in'
  | 'exchange_out'
  | 'match_stock'
  | 'match_swap'
  | 'manual_process'
  | 'stock_in'
  | 'stock_out';

export interface ExchangeRequest {
  id: string;
  studentName: string;
  className: string;
  grade: number;
  originalSize: Size;
  targetSize: Size;
  clothingType: ClothingType;
  tagStatus: TagStatus;
  photoUrl?: string;
  phone: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  clothingType: ClothingType;
  size: Size;
  quantity: number;
  updatedAt: string;
}

export interface ExchangeRecord {
  id: string;
  operationType: OperationType;
  requestId?: string;
  studentName?: string;
  className?: string;
  clothingType: ClothingType;
  originalSize?: Size;
  targetSize?: Size;
  quantity: number;
  operator: string;
  remark?: string;
  createdAt: string;
}

export const CLOTHING_TYPE_LABELS: Record<ClothingType, string> = {
  summer_short: '夏季短袖',
  summer_long: '夏季长袖',
  winter_coat: '冬季外套',
  sportswear: '运动服',
};

export const SIZE_LIST: Size[] = ['120', '130', '140', '150', '160', '170', '180', '190'];

export const TAG_STATUS_LABELS: Record<TagStatus, string> = {
  intact: '吊牌完整',
  removed: '吊牌已拆',
  damaged: '吊牌损坏',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: '待处理',
  matched: '已匹配',
  exchanged: '已完成',
  manual: '待人工处理',
  cancelled: '已取消',
};

export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  exchange_in: '换入',
  exchange_out: '换出',
  match_stock: '库存匹配',
  match_swap: '互换撮合',
  manual_process: '人工处理',
  stock_in: '入库',
  stock_out: '出库',
};
