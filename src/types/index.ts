export type BookStatus = "available" | "borrowed" | "damaged" | "offline";

export type DonationStatus = "pending" | "approved" | "rejected";
export type RejectReason = "damaged" | "duplicate" | "inappropriate";
export type BookCondition =
  | "like_new"
  | "minor_crease"
  | "noticeable_damage"
  | "heavy_marking";

export const BOOK_CONDITIONS: {
  value: BookCondition;
  label: string;
  desc: string;
  level: "good" | "warn" | "bad";
}[] = [
  { value: "like_new", label: "完好如新", desc: "封面完好，无笔记折痕", level: "good" },
  { value: "minor_crease", label: "轻微折痕", desc: "少量折痕或签名，不影响阅读", level: "good" },
  { value: "noticeable_damage", label: "明显破损", desc: "封面撕裂、缺页、水渍等", level: "bad" },
  { value: "heavy_marking", label: "涂鸦严重", desc: "大量涂写笔记，影响阅读", level: "bad" },
];

export const BOOK_CONDITION_LABEL: Record<BookCondition, string> = {
  like_new: "完好如新",
  minor_crease: "轻微折痕",
  noticeable_damage: "明显破损",
  heavy_marking: "涂鸦严重",
};

export type BorrowStatus = "borrowed" | "returned" | "overdue";

export interface Cabinet {
  id: string;
  name: string;
  capacity: number;
  location: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  cover: string;
  suitableGrade: string;
  category: string;
  status: BookStatus;
  cabinetId: string;
  donorName: string;
  donorClass: string;
  borrowCount: number;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  studentName: string;
  className: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  originalCabinetId: string;
  status: BorrowStatus;
}

export interface Donation {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  cover: string;
  suitableGrade: string;
  category: string;
  donorName: string;
  donorClass: string;
  bookCondition: BookCondition;
  status: DonationStatus;
  rejectReason?: RejectReason;
  submitDate: string;
  reviewDate?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  grade: string;
}

export const GRADES = [
  "一年级",
  "二年级",
  "三年级",
  "四年级",
  "五年级",
  "六年级",
] as const;

export const CATEGORIES = [
  "儿童文学",
  "科普百科",
  "童话故事",
  "历史故事",
  "成长励志",
  "绘本漫画",
  "自然科学",
  "经典名著",
] as const;

export const APPROPRIATE_CATEGORIES: Record<string, string[]> = {
  一年级: ["绘本漫画", "童话故事", "儿童文学"],
  二年级: ["绘本漫画", "童话故事", "儿童文学", "科普百科"],
  三年级: ["儿童文学", "童话故事", "科普百科", "历史故事", "绘本漫画"],
  四年级: ["儿童文学", "科普百科", "历史故事", "成长励志", "自然科学"],
  五年级: ["儿童文学", "科普百科", "历史故事", "经典名著", "成长励志", "自然科学"],
  六年级: ["儿童文学", "科普百科", "历史故事", "经典名著", "成长励志", "自然科学"],
};
