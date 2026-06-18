export interface Book {
  id: string;
  title: string;
  ageRange: string;
  themes: string[];
  pages: number;
  hasMechanism: boolean;
  damageLocation: string;
  coverUrl: string;
  status: 'available' | 'borrowed' | 'damaged';
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  childAge: number;
  contact: string;
}

export interface DamageCheck {
  missingPages: boolean;
  doodles: boolean;
  tornPages: boolean;
  stickers: boolean;
  accessories: boolean;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  familyId: string;
  childAge: number;
  borrowDate: string;
  expectedReturnDate: string;
  willingToExchange: boolean;
  actualReturnDate?: string;
  damageCheck?: DamageCheck;
  damageNotes?: string;
  status: 'borrowed' | 'returned' | 'overdue';
}

export interface RecommendResult {
  book: Book;
  score: number;
  reasons: string[];
}

export const AGE_RANGES = ['0-2岁', '3-4岁', '5-6岁', '7-8岁', '9-12岁'];

export const THEMES = [
  '自然科学', '动物世界', '童话故事', '认知启蒙', '习惯养成',
  '情绪管理', '社交友谊', '安全教育', '艺术审美', '数学逻辑',
  '历史文化', '地理旅行', '创意想象', '亲情温暖', '勇敢成长'
];
