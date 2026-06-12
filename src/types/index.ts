export type ItemCategory = '肉类' | '海鲜' | '蔬菜' | '主食' | '饮品' | '调料' | '耗材';
export type ItemStatus = '未认领' | '已认领' | '已买到' | '临时缺货';

export interface ClaimInfo {
  buyer: string;
  actualQuantity: string;
  cost: number;
  estimatedArrival: string;
  receiptPhoto?: string;
}

export interface SubstituteInfo {
  originalName: string;
  substituteName: string;
  substituteCost: number;
  substituteQuantity: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: ItemCategory;
  budget: number;
  suggestedQuantity: string;
  needsRefrigeration: boolean;
  referenceImage: string;
  status: ItemStatus;
  claim?: ClaimInfo;
  substitute?: SubstituteInfo;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
}

export const CATEGORY_LIST: ItemCategory[] = ['肉类', '海鲜', '蔬菜', '主食', '饮品', '调料', '耗材'];
export const STATUS_LIST: ItemStatus[] = ['未认领', '已认领', '已买到', '临时缺货'];

export const CATEGORY_EMOJI: Record<ItemCategory, string> = {
  '肉类': '🥩',
  '海鲜': '🦐',
  '蔬菜': '🥬',
  '主食': '🍞',
  '饮品': '🥤',
  '调料': '🧂',
  '耗材': '🔥',
};

export const STATUS_COLOR: Record<ItemStatus, string> = {
  '未认领': '#E8652E',
  '已认领': '#4AA8D8',
  '已买到': '#5A8F5C',
  '临时缺货': '#D94F4F',
};
