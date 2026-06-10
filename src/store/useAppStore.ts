import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppState,
  Book,
  BorrowRecord,
  Review,
  User,
  LendType,
  BookStatus,
  BookCondition,
  BookCategory,
} from '@/types';
import { createMockData } from '@/data/mockData';
import { generateId, ensureCurrentUser } from '@/utils/bookUtils';
import { todayISO } from '@/utils/dateUtils';

interface AppActions {
  setCurrentUser: (user: User) => void;
  updateUserNickname: (nickname: string) => void;
  addBook: (data: Omit<Book, 'id' | 'borrowCount' | 'reviewCount' | 'createdAt' | 'lastActiveAt' | 'status'> & {
    title: string;
    author: string;
    category: BookCategory;
    condition: BookCondition;
    shelfId: string;
    coverUrl: string;
    lenderId: string;
    lendType: LendType;
  }) => Book;
  borrowBook: (bookId: string, expectedReturnDate: string, userId?: string) => void;
  returnBook: (bookId: string, userId?: string) => void;
  claimBook: (bookId: string, userId?: string) => void;
  addReview: (bookId: string, content: string, recommendReason?: string, rating?: number) => void;
  refreshOverdueStatus: () => void;
}

const initialState = createMockData();

const refreshOverdue = (records: BorrowRecord[], books: Book[]): { records: BorrowRecord[]; books: Book[] } => {
  const now = todayISO();
  const newRecords = records.map((r) => {
    if (r.action !== 'borrow' || !r.expectedReturnDate) return r;
    const hasReturned = records.some(
      (rr) =>
        rr.action === 'return' &&
        rr.bookId === r.bookId &&
        rr.userId === r.userId &&
        new Date(rr.createdAt).getTime() > new Date(r.createdAt).getTime()
    );
    if (hasReturned) return { ...r, isOverdue: false };
    const isOverdue = new Date(r.expectedReturnDate).getTime() < new Date(now).getTime();
    return { ...r, isOverdue };
  });
  return { records: newRecords, books };
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentUser: (user) => set({ currentUser: user }),

      updateUserNickname: (nickname) => {
        const { currentUser, users } = get();
        if (!currentUser) return;
        const newUser: User = { ...currentUser, nickname };
        const newUsers = users.map((u) => (u.id === currentUser.id ? newUser : u));
        set({ currentUser: newUser, users: newUsers });
      },

      addBook: (data) => {
        const now = todayISO();
        const newBook: Book = {
          id: generateId('book'),
          borrowCount: 0,
          reviewCount: 0,
          createdAt: now,
          lastActiveAt: now,
          status: 'available' as BookStatus,
          ...data,
        };
        const registerRecord: BorrowRecord = {
          id: generateId('rec'),
          bookId: newBook.id,
          userId: data.lenderId,
          action: 'register',
          isOverdue: false,
          createdAt: now,
        };
        set((state) => ({
          books: [newBook, ...state.books],
          borrowRecords: [registerRecord, ...state.borrowRecords],
        }));
        return newBook;
      },

      borrowBook: (bookId, expectedReturnDate, userId) => {
        const state = get();
        const uid = userId || ensureCurrentUser(state).id;
        const now = todayISO();
        const borrowRecord: BorrowRecord = {
          id: generateId('rec'),
          bookId,
          userId: uid,
          action: 'borrow',
          borrowDate: now,
          expectedReturnDate,
          isOverdue: false,
          createdAt: now,
        };
        set((s) => ({
          books: s.books.map((b) =>
            b.id === bookId
              ? { ...b, status: 'borrowed' as BookStatus, currentHolderId: uid, borrowCount: b.borrowCount + 1, lastActiveAt: now }
              : b
          ),
          borrowRecords: [borrowRecord, ...s.borrowRecords],
        }));
      },

      returnBook: (bookId, userId) => {
        const state = get();
        const uid = userId || ensureCurrentUser(state).id;
        const now = todayISO();
        const returnRecord: BorrowRecord = {
          id: generateId('rec'),
          bookId,
          userId: uid,
          action: 'return',
          actualReturnDate: now,
          isOverdue: false,
          createdAt: now,
        };
        set((s) => ({
          books: s.books.map((b) =>
            b.id === bookId
              ? { ...b, status: 'available' as BookStatus, currentHolderId: undefined, lastActiveAt: now }
              : b
          ),
          borrowRecords: [returnRecord, ...s.borrowRecords],
        }));
      },

      claimBook: (bookId, userId) => {
        const state = get();
        const uid = userId || ensureCurrentUser(state).id;
        const now = todayISO();
        const claimRecord: BorrowRecord = {
          id: generateId('rec'),
          bookId,
          userId: uid,
          action: 'claim',
          isOverdue: false,
          createdAt: now,
        };
        set((s) => ({
          books: s.books.map((b) =>
            b.id === bookId ? { ...b, status: 'gifted' as BookStatus, lastActiveAt: now } : b
          ),
          borrowRecords: [claimRecord, ...s.borrowRecords],
        }));
      },

      addReview: (bookId, content, recommendReason, rating) => {
        const state = get();
        const user = ensureCurrentUser(state);
        const now = todayISO();
        const newReview: Review = {
          id: generateId('rev'),
          bookId,
          userId: user.id,
          content,
          recommendReason,
          rating,
          createdAt: now,
        };
        set((s) => ({
          reviews: [newReview, ...s.reviews],
          books: s.books.map((b) => (b.id === bookId ? { ...b, reviewCount: b.reviewCount + 1 } : b)),
        }));
      },

      refreshOverdueStatus: () => {
        const { borrowRecords, books } = get();
        const refreshed = refreshOverdue(borrowRecords, books);
        set({ borrowRecords: refreshed.records, books: refreshed.books });
      },
    }),
    {
      name: 'bookShelfAppState',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.books.length > 0) {
          state.refreshOverdueStatus();
        }
      },
    }
  )
);
