export type BookStatus = "in_box" | "borrowed" | "overdue" | "damaged";

export interface Book {
  id: string;
  title: string;
  author: string;
  donor: string;
  gradeLevel: string;
  boxId: string;
  coverImage: string;
  status: BookStatus;
  createdAt: string;
}

export type BorrowStatus = "borrowing" | "returned" | "overdue" | "damaged";

export interface BorrowRecord {
  id: string;
  bookId: string;
  borrowerName: string;
  borrowerClass: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  contact: string;
  status: BorrowStatus;
  damageNote?: string;
  damagePhoto?: string;
}

export interface Review {
  id: string;
  bookId: string;
  studentName: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface Box {
  id: string;
  name: string;
  location: string;
}

export const GRADE_LEVELS = [
  "一年级",
  "二年级",
  "三年级",
  "四年级",
  "五年级",
  "六年级",
  "七年级",
  "八年级",
  "九年级",
  "高中",
  "通用",
];

export const STATUS_LABELS: Record<BookStatus, string> = {
  in_box: "在箱",
  borrowed: "借出",
  overdue: "逾期",
  damaged: "破损",
};

export const STATUS_COLORS: Record<BookStatus, { bg: string; text: string; border: string }> = {
  in_box: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  borrowed: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  overdue: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  damaged: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
};
