export type MaterialType = 'sticker' | 'tape' | 'memo' | 'stamp';

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  brand: string;
  theme: string;
  color: string;
  quantity: number;
  price: number;
  storageLocation: string;
  photo: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageRecord {
  id: string;
  journalName: string;
  date: string;
  note: string;
  createdAt: string;
}

export interface UsageItem {
  id: string;
  usageRecordId: string;
  materialId: string;
  quantityUsed: number;
}

export interface Inspiration {
  id: string;
  name: string;
  theme: string;
  note: string;
  coverPhoto: string;
  createdAt: string;
}

export interface InspirationItem {
  id: string;
  inspirationId: string;
  materialId: string;
}

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  sticker: '贴纸',
  tape: '胶带',
  memo: '便签',
  stamp: '印章',
};

export const MATERIAL_TYPE_ICONS: Record<MaterialType, string> = {
  sticker: 'Sticker',
  tape: 'Tape',
  memo: 'StickyNote',
  stamp: 'Stamp',
};

export const LOW_STOCK_THRESHOLD = 2;
export const OVERSTOCK_THRESHOLD = 10;
