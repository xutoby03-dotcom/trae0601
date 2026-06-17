export type SecurityLevel = '普通' | '内部' | '机密' | '绝密';
export type BoxStatus = '在库' | '借出' | '异常';
export type BorrowStatus = '待审批' | '已通过' | '已驳回' | '借出中' | '已归还' | '已逾期';
export type UserRole = 'employee' | 'admin' | 'manager' | 'auditor';

export interface ArchivePhoto {
  id: string;
  archiveBoxId: string;
  photoType: '外观' | '封条' | '文件';
  photoUrl: string;
  createdAt: string;
}

export interface ArchiveBox {
  id: string;
  boxNumber: string;
  contractNumber?: string;
  clientName?: string;
  cabinetLocation: string;
  year: number;
  department: string;
  securityLevel: SecurityLevel;
  custodian: string;
  sealNumber: string;
  pageCount: number;
  status: BoxStatus;
  auditDate?: string;
  currentBorrowId?: string;
  photos: ArchivePhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface ReturnCheck {
  id: string;
  borrowRecordId: string;
  registeredSealNumber: string;
  actualSealNumber: string;
  sealIntact: boolean;
  sealRemark?: string;
  registeredPageCount: number;
  actualPageCount: number;
  pageDiff: number;
  pagesComplete: boolean;
  missingPages?: string;
  cabinetCorrect: boolean;
  checkerId: string;
  checkerName: string;
  remarks?: string;
  checkedAt: string;
}

export interface BorrowRecord {
  id: string;
  archiveBoxId: string;
  boxNumber: string;
  borrowerId: string;
  borrowerName: string;
  borrowerDepartment: string;
  purpose: string;
  expectedReturnDate: string;
  allowTakeOut: boolean;
  status: BorrowStatus;
  needsManagerApproval: boolean;
  managerApproved?: boolean;
  approverId?: string;
  approverName?: string;
  approvalRemark?: string;
  approvedAt?: string;
  borrowedAt?: string;
  returnedAt?: string;
  returnCheck?: ReturnCheck;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  realName: string;
  department: string;
  role: UserRole;
}

export interface SearchFilters {
  contractNumber?: string;
  clientName?: string;
  year?: number | string;
  cabinetLocation?: string;
  securityLevel?: SecurityLevel | '';
  status?: BoxStatus | '';
  department?: string;
}
