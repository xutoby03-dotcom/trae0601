export type AccessoryType = 'tarp' | 'pole' | 'bar' | 'stake' | 'bag';

export const ACCESSORY_META: Record<AccessoryType, { name: string; icon: string }> = {
  tarp: { name: '篷布', icon: 'Layout' },
  pole: { name: '立柱', icon: 'GitBranch' },
  bar: { name: '横杆', icon: 'Minus' },
  stake: { name: '地钉', icon: 'Pin' },
  bag: { name: '收纳袋', icon: 'Package' },
};

export type CanopyStatus = 'available' | 'borrowed' | 'drying' | 'repairing' | 'disabled';

export const CANOPY_STATUS_META: Record<CanopyStatus, { label: string; color: string }> = {
  available: { label: '可借', color: 'bg-emerald-100 text-emerald-700' },
  borrowed: { label: '在借', color: 'bg-blue-100 text-blue-700' },
  drying: { label: '待晾干', color: 'bg-amber-100 text-amber-700' },
  repairing: { label: '维修中', color: 'bg-red-100 text-red-700' },
  disabled: { label: '停用', color: 'bg-gray-100 text-gray-700' },
};

export interface Canopy {
  id: string;
  name: string;
  status: CanopyStatus;
  accessories: Record<AccessoryType, number>;
}

export interface BorrowItem {
  tarp: number;
  pole: number;
  bar: number;
  stake: number;
  bag: number;
}

export interface BorrowRecord {
  id: string;
  canopyId: string;
  activityName: string;
  location: string;
  contact: string;
  deposit: number;
  borrowTime: string;
  dueTime: string;
  returnTime?: string;
  borrowedItems: BorrowItem;
  returnedItems?: BorrowItem;
  isWet?: boolean;
  isOverdue?: boolean;
  status: 'active' | 'returned';
}

export type RepairIssueType = 'hole' | 'bent' | 'missing' | 'other';

export const REPAIR_ISSUE_META: Record<RepairIssueType, { label: string; color: string }> = {
  hole: { label: '破洞', color: 'bg-red-100 text-red-700 border-red-200' },
  bent: { label: '弯杆', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  missing: { label: '缺件', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  other: { label: '其他', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export interface RepairRecord {
  id: string;
  canopyId: string;
  borrowRecordId?: string;
  issueType: RepairIssueType;
  accessoryType?: AccessoryType;
  description: string;
  status: 'pending' | 'fixed';
  createdAt: string;
}
