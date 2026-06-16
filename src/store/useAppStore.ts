import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Book, Cabinet, BorrowRecord, Donation, RejectReason } from "@/types";
import { APPROPRIATE_CATEGORIES } from "@/types";
import {
  CABINETS,
  INITIAL_BOOKS,
  INITIAL_BORROW_RECORDS,
  INITIAL_DONATIONS,
} from "@/data/mockData";

interface AppState {
  cabinets: Cabinet[];
  books: Book[];
  borrowRecords: BorrowRecord[];
  donations: Donation[];

  borrowBook: (params: {
    bookId: string;
    studentName: string;
    className: string;
    expectedReturnDate: string;
  }) => void;

  returnBook: (params: {
    recordId: string;
    newCabinetId?: string;
  }) => void;

  submitDonation: (donation: Omit<Donation, "id" | "status" | "submitDate">) => void;

  reviewDonation: (params: {
    donationId: string;
    approved: boolean;
    rejectReason?: RejectReason;
    targetCabinetId?: string;
  }) => void;

  markBookDamaged: (bookId: string) => void;
  markBookOffline: (bookId: string) => void;
  reinstateBook: (bookId: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

const today = () => new Date().toISOString().split("T")[0];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      cabinets: CABINETS,
      books: INITIAL_BOOKS,
      borrowRecords: INITIAL_BORROW_RECORDS,
      donations: INITIAL_DONATIONS,

      borrowBook: ({ bookId, studentName, className, expectedReturnDate }) => {
        const book = get().books.find((b) => b.id === bookId);
        if (!book || book.status !== "available") return;

        const record: BorrowRecord = {
          id: generateId(),
          bookId,
          bookTitle: book.title,
          bookCover: book.cover,
          studentName,
          className,
          borrowDate: today(),
          expectedReturnDate,
          originalCabinetId: book.cabinetId,
          status: "borrowed",
        };

        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId ? { ...b, status: "borrowed" as const, borrowCount: b.borrowCount + 1 } : b
          ),
          borrowRecords: [...state.borrowRecords, record],
        }));
      },

      returnBook: ({ recordId, newCabinetId }) => {
        const record = get().borrowRecords.find((r) => r.id === recordId);
        if (!record || record.status === "returned") return;

        const targetCabinetId = newCabinetId || record.originalCabinetId;

        set((state) => ({
          books: state.books.map((b) =>
            b.id === record.bookId
              ? { ...b, status: "available" as const, cabinetId: targetCabinetId }
              : b
          ),
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === recordId
              ? { ...r, status: "returned" as const, actualReturnDate: today() }
              : r
          ),
        }));
      },

      submitDonation: (donation) => {
        const newDonation: Donation = {
          ...donation,
          id: generateId(),
          status: "pending",
          submitDate: today(),
        };
        set((state) => ({
          donations: [...state.donations, newDonation],
        }));
      },

      reviewDonation: ({ donationId, approved, rejectReason, targetCabinetId }) => {
        const donation = get().donations.find((d) => d.id === donationId);
        if (!donation || donation.status !== "pending") return;

        const books = get().books;
        const duplicateCount = books.filter(
          (b) =>
            b.title.toLowerCase() === donation.bookTitle.toLowerCase() &&
            b.author.toLowerCase() === donation.bookAuthor.toLowerCase()
        ).length;
        const isBadCondition =
          donation.bookCondition === "noticeable_damage" ||
          donation.bookCondition === "heavy_marking";
        const isLowGradeInappropriate =
          (donation.suitableGrade === "一年级" ||
            donation.suitableGrade === "二年级") &&
          !(
            APPROPRIATE_CATEGORIES[donation.suitableGrade] || []
          ).includes(donation.category);
        const tooManyDuplicates = duplicateCount >= 3;

        let autoRejectReason: RejectReason | undefined;
        if (isBadCondition) autoRejectReason = "damaged";
        else if (tooManyDuplicates) autoRejectReason = "duplicate";
        else if (isLowGradeInappropriate) autoRejectReason = "inappropriate";

        const shouldApprove = approved && !autoRejectReason;

        if (shouldApprove && targetCabinetId) {
          const newBook: Book = {
            id: generateId(),
            title: donation.bookTitle,
            author: donation.bookAuthor,
            cover: donation.cover,
            suitableGrade: donation.suitableGrade,
            category: donation.category,
            status: "available",
            cabinetId: targetCabinetId,
            donorName: donation.donorName,
            donorClass: donation.donorClass,
            borrowCount: 0,
          };
          set((state) => ({
            books: [...state.books, newBook],
            donations: state.donations.map((d) =>
              d.id === donationId
                ? { ...d, status: "approved" as const, reviewDate: today() }
                : d
            ),
          }));
        } else {
          const finalReason = rejectReason || autoRejectReason || "duplicate";
          set((state) => ({
            donations: state.donations.map((d) =>
              d.id === donationId
                ? {
                    ...d,
                    status: "rejected" as const,
                    rejectReason: finalReason,
                    reviewDate: today(),
                  }
                : d
            ),
          }));
        }
      },

      markBookDamaged: (bookId) => {
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId ? { ...b, status: "damaged" as const } : b
          ),
        }));
      },

      markBookOffline: (bookId) => {
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId ? { ...b, status: "offline" as const } : b
          ),
        }));
      },

      reinstateBook: (bookId) => {
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId ? { ...b, status: "available" as const } : b
          ),
        }));
      },
    }),
    {
      name: "book-drifting-storage",
    }
  )
);
