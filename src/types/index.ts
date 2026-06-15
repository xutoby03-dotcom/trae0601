export type TableStatus = 'available' | 'borrowed' | 'maintenance';

export type IssueType = 'overdue' | 'missing_parts' | 'desktop_damaged' | 'position_mismatch';

export interface FoldingTable {
  id: string;
  size: string;
  storageCabinet: string;
  scratchCount: number;
  footPadCount: number;
  totalFootPads: number;
  photo: string;
  status: TableStatus;
  issueTags: IssueType[];
  hasTablecloth: boolean;
}

export interface BorrowRecord {
  id: string;
  tableId: string;
  residentName: string;
  residentRoom: string;
  purpose: string;
  moveTo: string;
  expectedReturn: string;
  withTablecloth: boolean;
  borrowTime: string;
  status: 'active' | 'returned' | 'overdue';
}

export interface ReturnRecord {
  id: string;
  borrowId: string;
  desktopOk: boolean;
  desktopNote: string;
  legsOk: boolean;
  legsNote: string;
  lockOk: boolean;
  lockNote: string;
  tableclothReturned: boolean;
  positionCorrect: boolean;
  overallStatus: 'ok' | 'minor' | 'damaged';
  returnTime: string;
}

export interface BorrowFormData {
  residentName: string;
  residentRoom: string;
  purpose: string;
  moveTo: string;
  expectedReturn: string;
  withTablecloth: boolean;
}

export interface ReturnCheckData {
  desktopOk: boolean;
  desktopNote: string;
  legsOk: boolean;
  legsNote: string;
  lockOk: boolean;
  lockNote: string;
  tableclothReturned: boolean;
  positionCorrect: boolean;
}
