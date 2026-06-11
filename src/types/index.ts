export type CardType = "visitor" | "employee";
export type CardStatus = "available" | "in_use" | "overdue" | "lost";
export type RecordStatus = "active" | "returned" | "lost";
export type DepositRefundType = "full" | "none" | "partial";

export interface Card {
  id: string;
  cardNumber: string;
  cardType: CardType;
  accessArea: string;
  deposit: number;
  status: CardStatus;
}

export interface BorrowRecord {
  id: string;
  cardId: string;
  cardNumber: string;
  cardType: CardType;
  borrowerName: string;
  department: string;
  contact: string;
  accessArea: string;
  deposit: number;
  borrowTime: string;
  expectedReturnTime: string;
  actualReturnTime?: string;
  status: RecordStatus;
  lostReason?: string;
  depositRefundType?: DepositRefundType;
  partialRefundAmount?: number;
}

export interface DepartmentStats {
  department: string;
  count: number;
}

export interface DailyStats {
  date: string;
  visitorCount: number;
  employeeCount: number;
}

export interface BorrowFormData {
  cardNumber: string;
  cardType: CardType;
  accessArea: string;
  deposit: number;
  borrowerName: string;
  department: string;
  contact: string;
  borrowTime: string;
  expectedReturnTime: string;
}

export interface LostFormData {
  lostReason: string;
  depositRefundType: DepositRefundType;
  partialRefundAmount?: number;
}
