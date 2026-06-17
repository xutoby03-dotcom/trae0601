export type UmbrellaStatus = 'pending' | 'claimed' | 'shared' | 'scrapped';

export type SharedFrom = 'auto_expired' | 'manual';

export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export type ShareStatus = 'borrowed' | 'returned';

export interface FoundLocation {
  building: string;
  area: string;
}

export interface Umbrella {
  id: string;
  color: string;
  colorHex: string;
  brand: string;
  features: string[];
  description: string;
  canopyPhoto: string;
  handlePhoto: string;
  foundLocation: FoundLocation;
  foundTime: string;
  storageCell: string;
  status: UmbrellaStatus;
  storagePeriodDays: number;
  createdAt: string;
  updatedAt: string;
  sharedFrom?: SharedFrom;
  sharedAt?: string;
}

export interface ClaimApplication {
  id: string;
  umbrellaId: string;
  applicantClass: string;
  phoneLastFour: string;
  ownershipProof: string;
  status: ClaimStatus;
  createdAt: string;
}

export interface ShareRecord {
  id: string;
  umbrellaId: string;
  borrowerName: string;
  borrowerClass: string;
  borrowerPhone: string;
  borrowLocation: string;
  borrowTime: string;
  returnLocation: string | null;
  returnTime: string | null;
  remark: string | null;
  status: ShareStatus;
}

export interface ScrapRecord {
  id: string;
  umbrellaId: string;
  reason: string;
  operator: string;
  remark: string | null;
  scrapTime: string;
}

export interface UmbrellaFilters {
  color?: string;
  building?: string;
  feature?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: UmbrellaStatus;
}

export interface DashboardStats {
  totalPending: number;
  todayNew: number;
  sharedCount: number;
  scrappedCount: number;
  pendingClaims: number;
}

export interface BuildingStat {
  building: string;
  count: number;
}

export interface SimilarUmbrellaGroup {
  groupId: string;
  umbrellas: Umbrella[];
  similarity: number;
}

export interface CreateUmbrellaData {
  color: string;
  colorHex: string;
  brand: string;
  features: string[];
  description: string;
  canopyPhoto: string;
  handlePhoto: string;
  foundLocation: FoundLocation;
  foundTime: string;
  storageCell: string;
}

export interface CreateClaimData {
  umbrellaId: string;
  applicantClass: string;
  phoneLastFour: string;
  ownershipProof: string;
}

export interface CreateShareRecordData {
  umbrellaId: string;
  borrowerName: string;
  borrowerClass: string;
  borrowerPhone: string;
  borrowLocation: string;
  remark?: string;
}

export interface ReturnShareRecordData {
  returnLocation: string;
  remark?: string;
}

export interface ColorOption {
  name: string;
  hex: string;
}

export interface BuildingOption {
  name: string;
  areas: string[];
}
