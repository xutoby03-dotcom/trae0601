export type ReturnStatus = 'pending' | 'shipment_pending' | 'refund_pending' | 'completed';

export type ColumnType = 'today_must_handle' | 'need_tracking' | 'refund_followup';

export interface ReturnOrder {
  id: string;
  platform: string;
  productName: string;
  buyer: string;
  returnReason: string;
  applicationDeadline: string;
  shipDeadline: string;
  pickupCode: string;
  trackingNumber: string;
  status: ReturnStatus;
  refundPromiseDays: number;
  refundApplyDate?: string;
  packageId?: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export const PLATFORMS = ['淘宝', '京东', '拼多多', '天猫', '抖音', '快手', '其他'] as const;

export const RETURN_REASONS = [
  '尺寸不合适',
  '质量问题',
  '与描述不符',
  '不喜欢/不想要',
  '发错货',
  '七天无理由',
  '其他'
] as const;
