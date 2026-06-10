export interface User {
  id: string;
  nickname: string;
  avatar?: string;
  createdAt: string;
}

export type BookCondition = '全新' | '九成新' | '八成新' | '七成新' | '有磨损';

export type LendType = 'borrow' | 'gift';

export type BookStatus = 'available' | 'borrowed' | 'gifted';

export type BookCategory =
  | '文学小说'
  | '科技编程'
  | '历史传记'
  | '心理成长'
  | '艺术设计'
  | '商业管理'
  | '生活休闲'
  | '儿童绘本'
  | '其他';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  condition: BookCondition;
  shelfId: string;
  coverUrl: string;
  lenderId: string;
  lendType: LendType;
  status: BookStatus;
  currentHolderId?: string;
  borrowCount: number;
  reviewCount: number;
  createdAt: string;
  lastActiveAt: string;
}

export type BorrowAction = 'register' | 'borrow' | 'return' | 'claim';

export interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  action: BorrowAction;
  borrowDate?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  isOverdue: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  content: string;
  recommendReason?: string;
  rating?: number;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  books: Book[];
  borrowRecords: BorrowRecord[];
  reviews: Review[];
}

export type BookGroup = 'new' | 'hot' | 'pending-return' | 'idle' | 'all';

export const BOOK_CATEGORIES: BookCategory[] = [
  '文学小说',
  '科技编程',
  '历史传记',
  '心理成长',
  '艺术设计',
  '商业管理',
  '生活休闲',
  '儿童绘本',
  '其他',
];

export const BOOK_CONDITIONS: BookCondition[] = [
  '全新',
  '九成新',
  '八成新',
  '七成新',
  '有磨损',
];

export const CATEGORY_COLORS: Record<BookCategory, { spine: string; bg: string; text: string }> = {
  '文学小说': { spine: 'bg-rose-600', bg: 'bg-rose-50', text: 'text-rose-700' },
  '科技编程': { spine: 'bg-sky-600', bg: 'bg-sky-50', text: 'text-sky-700' },
  '历史传记': { spine: 'bg-amber-700', bg: 'bg-amber-50', text: 'text-amber-700' },
  '心理成长': { spine: 'bg-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  '艺术设计': { spine: 'bg-purple-600', bg: 'bg-purple-50', text: 'text-purple-700' },
  '商业管理': { spine: 'bg-slate-600', bg: 'bg-slate-50', text: 'text-slate-700' },
  '生活休闲': { spine: 'bg-teal-600', bg: 'bg-teal-50', text: 'text-teal-700' },
  '儿童绘本': { spine: 'bg-pink-500', bg: 'bg-pink-50', text: 'text-pink-700' },
  '其他': { spine: 'bg-wood-600', bg: 'bg-wood-50', text: 'text-wood-700' },
};
