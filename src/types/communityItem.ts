export type ItemStatus = 'available' | 'in_use' | 'needs_cleaning' | 'needs_repair';

export type FragilityLevel = 'low' | 'medium' | 'high';

export interface BorrowRecord {
  id: string;
  itemId: string;
  borrower: string;
  startTime: string;
  endTime: string;
  purpose?: string;
  returned: boolean;
  returnTime?: string;
  cleanedOnReturn: boolean;
  undamagedOnReturn: boolean;
  returnNote?: string;
}

export interface DamageRecord {
  id: string;
  itemId: string;
  reporter: string;
  responsiblePerson: string;
  description: string;
  reportedAt: string;
  compensationPlan: string;
  compensationAmount: number;
  settled: boolean;
  settledAt?: string;
  settledNote?: string;
}

export interface CommunityItem {
  id: string;
  name: string;
  photoUrl?: string;
  purchaser: string;
  price: number;
  purchaseDate?: string;
  storageLocation: string;
  usageRules: string;
  fragility: FragilityLevel;
  status: ItemStatus;
  currentBorrower?: string;
  currentBorrowId?: string;
  totalUsageCount: number;
  lastUsedAt?: string;
  createdAt: string;
}

export interface UsageStats {
  itemId: string;
  usageCount: number;
  lastUsedBy?: string;
  lastUsedAt?: string;
}

export interface CleaningStats {
  person: string;
  totalReturns: number;
  uncleanedReturns: number;
  uncleanedRate: number;
}
