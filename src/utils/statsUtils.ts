import type { Book, BorrowRecord, User, Review, BookCategory } from '@/types';
import { isDateOverdue, daysBetween } from './dateUtils';

export interface StatsOverview {
  totalRegistered: number;
  inCirculation: number;
  totalReturned: number;
  overdueCount: number;
}

export interface CategoryStat {
  category: BookCategory;
  count: number;
  percentage: number;
}

export interface OverdueRank {
  user: User;
  overdueCount: number;
  totalOverdueDays: number;
}

export interface UserStats {
  registeredCount: number;
  borrowedCount: number;
  overdueCount: number;
  reviewCount: number;
}

export const calcOverview = (
  books: Book[],
  records: BorrowRecord[]
): StatsOverview => {
  const totalRegistered = books.length;
  const inCirculation = books.filter((b) => b.status === 'borrowed').length;
  const totalReturned = records.filter((r) => r.action === 'return').length;

  const overdueCount = records.filter((r) => {
    if (r.action !== 'borrow' || !r.expectedReturnDate) return false;
    const hasReturned = records.some(
      (rr) =>
        rr.action === 'return' &&
        rr.bookId === r.bookId &&
        rr.userId === r.userId &&
        new Date(rr.createdAt).getTime() > new Date(r.createdAt).getTime()
    );
    return !hasReturned && isDateOverdue(r.expectedReturnDate);
  }).length;

  return { totalRegistered, inCirculation, totalReturned, overdueCount };
};

export const calcCategoryStats = (books: Book[]): CategoryStat[] => {
  const counts = new Map<BookCategory, number>();
  books.forEach((b) => {
    counts.set(b.category, (counts.get(b.category) || 0) + 1);
  });
  const total = books.length || 1;
  return Array.from(counts.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
};

export const calcOverdueRank = (
  users: User[],
  records: BorrowRecord[]
): OverdueRank[] => {
  const userStats = new Map<string, { count: number; days: number }>();

  records.forEach((r) => {
    if (r.action !== 'borrow' || !r.expectedReturnDate) return;
    const hasReturned = records.some(
      (rr) =>
        rr.action === 'return' &&
        rr.bookId === r.bookId &&
        rr.userId === r.userId &&
        new Date(rr.createdAt).getTime() > new Date(r.createdAt).getTime()
    );
    if (!hasReturned && isDateOverdue(r.expectedReturnDate)) {
      const existing = userStats.get(r.userId) || { count: 0, days: 0 };
      userStats.set(r.userId, {
        count: existing.count + 1,
        days: existing.days + Math.max(0, daysBetween(r.expectedReturnDate)),
      });
    }
  });

  return users
    .map((u) => {
      const s = userStats.get(u.id) || { count: 0, days: 0 };
      return { user: u, overdueCount: s.count, totalOverdueDays: s.days };
    })
    .filter((r) => r.overdueCount > 0)
    .sort((a, b) => b.overdueCount - a.overdueCount || b.totalOverdueDays - a.totalOverdueDays);
};

export const calcUserStats = (
  userId: string,
  books: Book[],
  records: BorrowRecord[],
  reviews: Review[]
): UserStats => {
  return {
    registeredCount: books.filter((b) => b.lenderId === userId).length,
    borrowedCount: records.filter((r) => r.userId === userId && r.action === 'borrow').length,
    overdueCount: records.filter((r) => {
      if (r.userId !== userId || r.action !== 'borrow' || !r.expectedReturnDate) return false;
      const hasReturned = records.some(
        (rr) =>
          rr.action === 'return' &&
          rr.bookId === r.bookId &&
          rr.userId === userId &&
          new Date(rr.createdAt).getTime() > new Date(r.createdAt).getTime()
      );
      return !hasReturned && isDateOverdue(r.expectedReturnDate);
    }).length,
    reviewCount: reviews.filter((r) => r.userId === userId).length,
  };
};
