import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Book, BorrowRecord, Review, Box, BookStatus } from "@/types";
import { mockBooks, mockBorrowRecords, mockReviews, mockBoxes } from "@/data/mockData";

interface BookStore {
  books: Book[];
  borrowRecords: BorrowRecord[];
  reviews: Review[];
  boxes: Box[];

  addBook: (book: Omit<Book, "id" | "createdAt">) => void;
  updateBook: (id: string, book: Partial<Book>) => void;
  deleteBook: (id: string) => void;

  borrowBook: (data: {
    bookId: string;
    borrowerName: string;
    borrowerClass: string;
    expectedReturnDate: string;
    contact: string;
  }) => void;

  returnBook: (recordId: string) => void;

  returnDamagedBook: (recordId: string, damageNote: string, damagePhoto?: string) => void;

  addReview: (data: { bookId: string; studentName: string; rating: number; content: string }) => void;

  getBooksByStatus: (status: BookStatus) => Book[];
  getBorrowRecordsByBook: (bookId: string) => BorrowRecord[];
  getReviewsByBook: (bookId: string) => Review[];
  getActiveBorrowRecord: (bookId: string) => BorrowRecord | undefined;
  getPopularCategories: () => { grade: string; count: number }[];
  getBoxTurnoverRate: () => { box: Box; borrowCount: number; avgDays: number }[];
  checkAndUpdateOverdue: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      books: mockBooks,
      borrowRecords: mockBorrowRecords,
      reviews: mockReviews,
      boxes: mockBoxes,

      addBook: (book) =>
        set((state) => ({
          books: [
            ...state.books,
            { ...book, id: generateId(), createdAt: new Date().toISOString().split("T")[0] },
          ],
        })),

      updateBook: (id, book) =>
        set((state) => ({
          books: state.books.map((b) => (b.id === id ? { ...b, ...book } : b)),
        })),

      deleteBook: (id) =>
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
          borrowRecords: state.borrowRecords.filter((r) => r.bookId !== id),
          reviews: state.reviews.filter((r) => r.bookId !== id),
        })),

      borrowBook: ({ bookId, borrowerName, borrowerClass, expectedReturnDate, contact }) => {
        const today = new Date().toISOString().split("T")[0];
        set((state) => ({
          borrowRecords: [
            ...state.borrowRecords,
            {
              id: generateId(),
              bookId,
              borrowerName,
              borrowerClass,
              borrowDate: today,
              expectedReturnDate,
              contact,
              status: "borrowing",
            },
          ],
          books: state.books.map((b) => (b.id === bookId ? { ...b, status: "borrowed" } : b)),
        }));
      },

      returnBook: (recordId) =>
        set((state) => {
          const record = state.borrowRecords.find((r) => r.id === recordId);
          const today = new Date().toISOString().split("T")[0];
          return {
            borrowRecords: state.borrowRecords.map((r) =>
              r.id === recordId ? { ...r, status: "returned", actualReturnDate: today } : r
            ),
            books: record ? state.books.map((b) => (b.id === record.bookId ? { ...b, status: "in_box" } : b)) : state.books,
          };
        }),

      returnDamagedBook: (recordId, damageNote, damagePhoto) =>
        set((state) => {
          const record = state.borrowRecords.find((r) => r.id === recordId);
          const today = new Date().toISOString().split("T")[0];
          return {
            borrowRecords: state.borrowRecords.map((r) =>
              r.id === recordId
                ? { ...r, status: "damaged", actualReturnDate: today, damageNote, damagePhoto }
                : r
            ),
            books: record ? state.books.map((b) => (b.id === record.bookId ? { ...b, status: "damaged" } : b)) : state.books,
          };
        }),

      addReview: ({ bookId, studentName, rating, content }) =>
        set((state) => ({
          reviews: [
            ...state.reviews,
            {
              id: generateId(),
              bookId,
              studentName,
              rating,
              content,
              createdAt: new Date().toISOString().split("T")[0],
            },
          ],
        })),

      getBooksByStatus: (status) => get().books.filter((b) => b.status === status),

      getBorrowRecordsByBook: (bookId) =>
        get()
          .borrowRecords.filter((r) => r.bookId === bookId)
          .sort((a, b) => b.borrowDate.localeCompare(a.borrowDate)),

      getReviewsByBook: (bookId) =>
        get()
          .reviews.filter((r) => r.bookId === bookId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

      getActiveBorrowRecord: (bookId) =>
        get().borrowRecords.find((r) => r.bookId === bookId && (r.status === "borrowing" || r.status === "overdue")),

      getPopularCategories: () => {
        const { books, borrowRecords } = get();
        const gradeCount: Record<string, number> = {};
        borrowRecords.forEach((record) => {
          const book = books.find((b) => b.id === record.bookId);
          if (book) {
            gradeCount[book.gradeLevel] = (gradeCount[book.gradeLevel] || 0) + 1;
          }
        });
        return Object.entries(gradeCount)
          .map(([grade, count]) => ({ grade, count }))
          .sort((a, b) => b.count - a.count);
      },

      getBoxTurnoverRate: () => {
        const { books, borrowRecords, boxes } = get();
        return boxes
          .map((box) => {
            const boxBooks = books.filter((b) => b.boxId === box.id);
            const boxRecords = borrowRecords.filter((r) => boxBooks.some((b) => b.id === r.bookId));
            let totalDays = 0;
            let completedCount = 0;
            boxRecords.forEach((r) => {
              if (r.actualReturnDate) {
                const borrow = new Date(r.borrowDate);
                const ret = new Date(r.actualReturnDate);
                totalDays += Math.ceil((ret.getTime() - borrow.getTime()) / (1000 * 60 * 60 * 24));
                completedCount++;
              }
            });
            return {
              box,
              borrowCount: boxRecords.length,
              avgDays: completedCount > 0 ? Math.round((totalDays / completedCount) * 10) / 10 : 0,
            };
          })
          .sort((a, b) => {
            if (b.borrowCount !== a.borrowCount) {
              return b.borrowCount - a.borrowCount;
            }
            if (a.avgDays === 0 && b.avgDays === 0) return 0;
            if (a.avgDays === 0) return 1;
            if (b.avgDays === 0) return -1;
            return a.avgDays - b.avgDays;
          });
      },

      checkAndUpdateOverdue: () => {
        const today = new Date().toISOString().split("T")[0];
        set((state) => {
          const overdueRecords = state.borrowRecords.filter(
            (r) => r.status === "borrowing" && r.expectedReturnDate < today
          );
          const overdueBookIds = overdueRecords.map((r) => r.bookId);
          return {
            borrowRecords: state.borrowRecords.map((r) =>
              r.status === "borrowing" && r.expectedReturnDate < today ? { ...r, status: "overdue" } : r
            ),
            books: state.books.map((b) =>
              overdueBookIds.includes(b.id) && b.status === "borrowed" ? { ...b, status: "overdue" } : b
            ),
          };
        });
      },
    }),
    {
      name: "book-drifting-store",
    }
  )
);
