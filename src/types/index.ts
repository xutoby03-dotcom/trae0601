export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatarEmoji: string;
  phone: string;
  colorTag: string;
}

export interface KeyTrustee {
  id: string;
  name: string;
  relation: string;
  phone: string;
  address: string;
  isFamily: boolean;
  familyMemberId?: string;
  movedFlag: boolean;
  moveNote?: string;
}

export type KeyStatus = 'available' | 'borrowed' | 'inactive';

export interface KeyArchive {
  id: string;
  lockName: string;
  lockLocation: string;
  totalQuantity: number;
  trusteeId: string;
  storageLocation: string;
  deliveryDate: string;
  photos: string[];
  status: KeyStatus;
  lastVerifiedDate: string;
  coreReplacedDate?: string;
  oldKeysRecovered?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowRecord {
  id: string;
  keyArchiveId: string;
  borrowerId?: string;
  borrowerName: string;
  reason: string;
  borrowDate: string;
  expectedReturnDate: string;
  needDuplicate: boolean;
  duplicateNote?: string;
  isReturned: boolean;
  returnDate?: string;
  returnReceiverId?: string;
  returnedQuantity?: number;
  tagIntact?: boolean;
  keyRingIntact?: boolean;
  storageReset?: boolean;
  returnNote?: string;
}

export type ReminderType = 'long_unverified' | 'trustee_moved' | 'old_keys_unrecovered';

export interface Reminder {
  id: string;
  type: ReminderType;
  keyArchiveId: string;
  title: string;
  description: string;
  relatedDate: string;
  isRead: boolean;
  isResolved: boolean;
  resolvedDate?: string;
  createdAt: string;
}

export interface AppSettings {
  unverifiedDaysThreshold: number;
  lastScanDate: string;
}

export interface AppState {
  familyMembers: FamilyMember[];
  trustees: KeyTrustee[];
  keyArchives: KeyArchive[];
  borrowRecords: BorrowRecord[];
  reminders: Reminder[];
  settings: AppSettings;
}
