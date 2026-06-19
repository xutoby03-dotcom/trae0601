export type BoxCategory = 'large' | 'wardrobe' | 'book';

export type BoxStatus = 'available' | 'reserved' | 'in_use' | 'need_repair' | 'scrapped';

export type BorrowStatus = 'pending' | 'picked_up' | 'returned' | 'cancelled';

export interface Box {
  id: string;
  category: BoxCategory;
  length: number;
  width: number;
  height: number;
  loadCapacity: number;
  source: string;
  usageCount: number;
  status: BoxStatus;
  photo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowRecord {
  id: string;
  boxId: string;
  friendId: string;
  community: string;
  reserveStartDate: string;
  reserveEndDate: string;
  actualPickupDate?: string;
  actualReturnDate?: string;
  status: BorrowStatus;
  dampCheck?: number;
  holeCheck?: number;
  tapeCheck?: number;
  scrapReason?: string;
  createdAt: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  community: string;
  phone: string;
  createdAt: string;
}

export interface MovePlan {
  id: string;
  friendId: string;
  moveDate: string;
  fromCommunity: string;
  toCommunity: string;
  notes: string;
  createdAt: string;
}
