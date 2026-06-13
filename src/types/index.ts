export type MemberLevel = '普通会员' | '银卡会员' | '金卡会员' | '钻石会员';

export type CouponTypeCategory = '立减券' | '满减券' | '折扣券';

export type CouponStatus = 'pending' | 'claimed' | 'used' | 'expired';

export type SendChannel = '短信' | '微信' | 'APP推送' | '门店发放';

export interface Member {
  id: string;
  name: string;
  phone: string;
  birthday: string;
  level: MemberLevel;
  favoriteCategories: string[];
  avatar: string;
  createdAt: string;
}

export interface CouponType {
  id: string;
  name: string;
  type: CouponTypeCategory;
  amount: number;
  threshold: number;
  validDays: number;
  description: string;
  createdAt: string;
}

export interface CouponSnapshot {
  couponName: string;
  couponType: CouponTypeCategory;
  amount: number;
  threshold: number;
  validDays: number;
}

export interface CouponIssue {
  id: string;
  memberId: string;
  couponTypeId: string;
  year: number;
  channel: SendChannel;
  status: CouponStatus;
  issueDate: string;
  expireDate: string;
  claimedDate?: string;
  usedDate?: string;
  orderId?: string;
  orderAmount?: number;
  snapshot: CouponSnapshot;
}

export interface MonthlyStats {
  totalIssued: number;
  totalUsed: number;
  usageRate: number;
  totalOrderAmount: number;
  missedCount: number;
  expiredUnused: number;
}
