export type MoldType = 'toast_box' | 'pound_cake' | 'mousse_ring' | 'other';
export type MoldMaterial = 'aluminum' | 'stainless_steel' | 'non_stick' | 'silicone' | 'other';
export type MoldStatus = 'available' | 'borrowed' | 'maintenance' | 'damaged' | 'lost';

export interface Mold {
  id: string;
  name: string;
  type: MoldType;
  size: string;
  material: MoldMaterial;
  quantity: number;
  availableQuantity: number;
  applicableProducts: string[];
  purchaseDate: string;
  photoUrl?: string;
  status: MoldStatus;
  createdAt: string;
  updatedAt: string;
  remark?: string;
}

export interface Master {
  id: string;
  name: string;
  phone: string;
  specialty?: string;
  remark?: string;
  borrowCount?: number;
  avatarUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type BorrowStatus = 'borrowed' | 'returned' | 'overdue' | 'exception';

export type ReturnCheckItem = 'deformation' | 'coating_loss' | 'oil_residue' | 'missing_parts';

export interface ReturnInspection {
  id: string;
  borrowRecordId: string;
  hasDeformation: boolean;
  hasCoatingLoss: boolean;
  hasOilResidue: boolean;
  hasMissingParts: boolean;
  remark: string;
  createdAt: string;
}

export interface ReturnCheck {
  id: string;
  borrowId: string;
  returnDate: string;
  checks: Record<ReturnCheckItem, boolean>;
  hasDamage: boolean;
  damageDescription?: string;
  remark?: string;
  createdAt: string;
}

export interface BorrowRecord {
  id: string;
  moldId: string;
  masterId: string;
  orderNo: string;
  expectedReturnDate: string;
  needReleasePaper: boolean;
  actualReturnDate?: string;
  status: BorrowStatus;
  borrowDate: string;
  returnCheck?: ReturnCheck;
  createdAt: string;
  updatedAt: string;
  remark?: string;
}

export interface BorrowRecordWithDetails extends BorrowRecord {
  moldName: string;
  moldType: MoldType;
  moldSize: string;
  masterName: string;
  photoUrl?: string;
  inspection?: ReturnInspection;
  exception?: {
    id: string;
    type: ExceptionType;
    status: ExceptionStatus;
    description: string;
  };
}

export interface ReturnInspection {
  id: string;
  borrowRecordId: string;
  hasDeformation: boolean;
  hasCoatingLoss: boolean;
  hasOilResidue: boolean;
  hasMissingParts: boolean;
  remark: string;
  createdAt: string;
}

export type ExceptionType = 'high_temp' | 'overdue' | 'damage' | 'damage_on_return';
export type ExceptionStatus = 'pending' | 'processing' | 'resolved' | 'scrapped';
export type HandleMethod = 'repair' | 'scrap' | 'other';

export interface ExceptionRecord {
  id: string;
  moldId: string;
  borrowRecordId?: string;
  masterId?: string;
  type: ExceptionType;
  description: string;
  checks?: Record<ReturnCheckItem, boolean>;
  status: ExceptionStatus;
  handlerId?: string;
  handleMethod?: HandleMethod;
  handleRemark?: string;
  handledAt?: string;
  handleNote?: string;
  resolvedDate?: string;
  foundDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExceptionRecordWithDetails extends ExceptionRecord {
  moldName: string;
  moldSize: string;
  masterName?: string;
  photoUrl?: string;
}

export interface DashboardStats {
  totalMolds: number;
  availableMolds: number;
  borrowedMolds: number;
  exceptionMolds: number;
  overdueCount: number;
  conflictCount: number;
}

export interface UsageBySize {
  type: string;
  size: string;
  borrowCount: number;
}

export interface PurchaseSuggestion {
  moldId: string;
  name: string;
  type: string;
  size: string;
  currentQuantity: number;
  suggestQuantity: number;
  reason: string;
}

export interface BorrowConflict {
  moldId: string;
  moldName: string;
  conflicts: Array<{
    borrowId: string;
    masterName: string;
    orderNo: string;
    expectedReturnDate: string;
  }>;
}

export const MoldTypeLabels: Record<MoldType, string> = {
  toast_box: '吐司盒',
  pound_cake: '磅蛋糕模',
  mousse_ring: '慕斯圈',
  other: '其他',
};

export const MoldMaterialLabels: Record<MoldMaterial, string> = {
  aluminum: '铝合金',
  stainless_steel: '不锈钢',
  non_stick: '不粘涂层',
  silicone: '硅胶',
  other: '其他',
};

export const MoldStatusLabels: Record<MoldStatus, string> = {
  available: '可用',
  borrowed: '借用中',
  maintenance: '维护中',
  damaged: '已损坏',
  lost: '已遗失',
};

export const BorrowStatusLabels: Record<BorrowStatus, string> = {
  borrowed: '借用中',
  returned: '已归还',
  overdue: '已逾期',
  exception: '异常',
};

export const ExceptionTypeLabels: Record<ExceptionType, string> = {
  high_temp: '高温损坏',
  overdue: '逾期未还',
  damage: '损坏',
  damage_on_return: '归还时损坏',
};

export const ExceptionStatusLabels: Record<ExceptionStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  scrapped: '已报废',
};
