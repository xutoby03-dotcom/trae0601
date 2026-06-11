export type Category =
  | '退烧药'
  | '感冒药'
  | '消炎药'
  | '肠胃药'
  | '外用药'
  | '创可贴/敷料'
  | '碘伏/消毒'
  | '保健品'
  | '其他';

export type ApplicableTo =
  | '全部人群'
  | '成人'
  | '儿童'
  | '老年人'
  | '孕妇禁用'
  | '特定人群';

export interface Medicine {
  id: string;
  name: string;
  category: Category;
  emoji: string;
  applicableTo: ApplicableTo;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  expiryDate: string;
  openDate?: string;
  storageLocation: string;
  image?: string;
  isCommon: boolean;
  childWarning: boolean;
  notes?: string;
  createdAt: string;
  disposed?: boolean;
}

export interface StockRecord {
  id: string;
  medicineId: string;
  type: 'use' | 'restock';
  quantity: number;
  unitPrice?: number;
  purchaseChannel?: string;
  purchaseDate?: string;
  timestamp: string;
}

export interface DisposalRecord {
  id: string;
  medicineId: string;
  action: 'discard' | 'return' | 'other';
  notes?: string;
  timestamp: string;
}

export interface LowStockEvent {
  id: string;
  medicineId: string;
  previousQuantity: number;
  newQuantity: number;
  threshold: number;
  timestamp: string;
}

export const CATEGORY_EMOJI: Record<Category, string> = {
  '退烧药': '🤒',
  '感冒药': '🤧',
  '消炎药': '💊',
  '肠胃药': '🫃',
  '外用药': '🧴',
  '创可贴/敷料': '🩹',
  '碘伏/消毒': '🧪',
  '保健品': '💪',
  '其他': '📦',
};

export const CATEGORY_LIST: Category[] = [
  '退烧药',
  '感冒药',
  '消炎药',
  '肠胃药',
  '外用药',
  '创可贴/敷料',
  '碘伏/消毒',
  '保健品',
  '其他',
];

export const APPLICABLE_TO_LIST: ApplicableTo[] = [
  '全部人群',
  '成人',
  '儿童',
  '老年人',
  '孕妇禁用',
  '特定人群',
];

export const PURCHASE_CHANNELS = [
  '京东',
  '淘宝/天猫',
  '拼多多',
  '美团/饿了么',
  '线下药店',
  '医院',
  '其他',
];
