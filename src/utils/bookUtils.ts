import type { Book, BorrowRecord, BookGroup, User, Review, AppState } from '@/types';
import { daysBetween, isDateOverdue } from './dateUtils';

export const isNewBook = (book: Book): boolean => {
  return book.status === 'available' && daysBetween(book.createdAt) <= 7;
};

export const isHotBook = (book: Book, allBooks: Book[]): boolean => {
  if (allBooks.length === 0) return false;
  const sorted = [...allBooks].sort(
    (a, b) => b.borrowCount + b.reviewCount - (a.borrowCount + a.reviewCount)
  );
  const threshold = Math.max(1, Math.ceil(sorted.length * 0.3));
  const topIds = new Set(sorted.slice(0, threshold).map((b) => b.id));
  return topIds.has(book.id);
};

export const isPendingReturn = (book: Book, records: BorrowRecord[]): boolean => {
  if (book.status !== 'borrowed') return false;
  const lastBorrow = [...records]
    .filter((r) => r.bookId === book.id && r.action === 'borrow')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  if (!lastBorrow) return false;
  const hasReturned = records.some(
    (r) =>
      r.bookId === book.id &&
      r.action === 'return' &&
      new Date(r.createdAt).getTime() > new Date(lastBorrow.createdAt).getTime()
  );
  return !hasReturned;
};

export const isIdleBook = (book: Book): boolean => {
  return book.status === 'available' && daysBetween(book.lastActiveAt) > 30;
};

export const groupBooks = (
  books: Book[],
  group: BookGroup,
  records: BorrowRecord[]
): Book[] => {
  switch (group) {
    case 'new':
      return books.filter(isNewBook);
    case 'hot':
      return books.filter((b) => isHotBook(b, books));
    case 'pending-return':
      return books.filter((b) => isPendingReturn(b, records));
    case 'idle':
      return books.filter(isIdleBook);
    case 'all':
    default:
      return books;
  }
};

export const getBookOverdueInfo = (
  book: Book,
  records: BorrowRecord[]
): { isOverdue: boolean; overdueDays: number; expectedDate?: string } => {
  if (book.status !== 'borrowed') {
    return { isOverdue: false, overdueDays: 0 };
  }
  const lastBorrow = [...records]
    .filter((r) => r.bookId === book.id && r.action === 'borrow')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  if (!lastBorrow || !lastBorrow.expectedReturnDate) {
    return { isOverdue: false, overdueDays: 0 };
  }
  const overdue = isDateOverdue(lastBorrow.expectedReturnDate);
  const days = overdue ? Math.max(0, daysBetween(lastBorrow.expectedReturnDate)) : 0;
  return { isOverdue: overdue, overdueDays: days, expectedDate: lastBorrow.expectedReturnDate };
};

export const getCurrentHolder = (
  book: Book,
  records: BorrowRecord[],
  users: User[]
): User | undefined => {
  if (book.status !== 'borrowed' || !book.currentHolderId) return undefined;
  return users.find((u) => u.id === book.currentHolderId);
};

export const getLender = (book: Book, users: User[]): User | undefined => {
  return users.find((u) => u.id === book.lenderId);
};

export const getBookRecords = (bookId: string, records: BorrowRecord[]): BorrowRecord[] => {
  return [...records]
    .filter((r) => r.bookId === bookId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const getBookReviews = (bookId: string, reviews: Review[]): Review[] => {
  return [...reviews]
    .filter((r) => r.bookId === bookId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const searchBooks = (books: Book[], query: string): Book[] => {
  const q = query.trim().toLowerCase();
  if (!q) return books;
  return books.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
  );
};

export const generateShelfId = (): string => {
  const row = String.fromCharCode(65 + Math.floor(Math.random() * 5));
  const col = Math.floor(Math.random() * 12) + 1;
  return `${row}-${String(col).padStart(2, '0')}`;
};

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

export const ensureCurrentUser = (state: AppState): User => {
  if (state.currentUser) return state.currentUser;
  return state.users[0];
};
