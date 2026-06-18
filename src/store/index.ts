import { create } from 'zustand';
import type { Book, Family, BorrowRecord, DamageCheck } from '../types';
import { saveToStorage, loadFromStorage, generateId, today } from '../utils/storage';
import { mockBooks, mockFamilies, mockBorrowRecords } from '../utils/mock';

interface AppState {
  books: Book[];
  families: Family[];
  borrowRecords: BorrowRecord[];
  selectedFamilyId: string | null;

  initData: () => void;
  addBook: (book: Omit<Book, 'id' | 'createdAt'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  addFamily: (family: Omit<Family, 'id'>) => Family;
  updateFamily: (id: string, updates: Partial<Family>) => void;
  setSelectedFamily: (id: string | null) => void;
  createBorrowRecord: (data: {
    bookId: string; familyId: string; childAge: number; borrowDate: string; expectedReturnDate: string; willingToExchange: boolean;
  }) => void;
  returnBook: (recordId: string, damageCheck: DamageCheck, damageNotes: string) => void;
  updateOverdueStatus: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  books: [],
  families: [],
  borrowRecords: [],
  selectedFamilyId: null,

  initData: () => {
    const storedBooks = loadFromStorage<Book[]>('books', []);
    const storedFamilies = loadFromStorage<Family[]>('families', []);
    const storedRecords = loadFromStorage<BorrowRecord[]>('borrowRecords', []);
    const storedFamilyId = loadFromStorage<string | null>('selectedFamilyId', null);

    if (storedBooks.length === 0 && storedFamilies.length === 0 && storedRecords.length === 0) {
      saveToStorage('books', mockBooks);
      saveToStorage('families', mockFamilies);
      saveToStorage('borrowRecords', mockBorrowRecords);
      set({ books: mockBooks, families: mockFamilies, borrowRecords: mockBorrowRecords, selectedFamilyId: mockFamilies[0].id });
      saveToStorage('selectedFamilyId', mockFamilies[0].id);
    } else {
      set({ books: storedBooks, families: storedFamilies, borrowRecords: storedRecords, selectedFamilyId: storedFamilyId });
    }

    setTimeout(() => get().updateOverdueStatus(), 0);
  },

  addBook: (book) => {
    const newBook: Book = {
      ...book,
      id: generateId(),
      createdAt: today(),
    };
    const books = [...get().books, newBook];
    saveToStorage('books', books);
    set({ books });
  },

  updateBook: (id, updates) => {
    const books = get().books.map((b) => (b.id === id ? { ...b, ...updates } : b));
    saveToStorage('books', books);
    set({ books });
  },

  deleteBook: (id) => {
    const books = get().books.filter((b) => b.id !== id);
    saveToStorage('books', books);
    set({ books });
  },

  addFamily: (family) => {
    const newFamily: Family = { ...family, id: generateId() };
    const families = [...get().families, newFamily];
    saveToStorage('families', families);
    set({ families });
    return newFamily;
  },

  updateFamily: (id, updates) => {
    const families = get().families.map((f) => (f.id === id ? { ...f, ...updates } : f));
    saveToStorage('families', families);
    set({ families });
  },

  setSelectedFamily: (id) => {
    saveToStorage('selectedFamilyId', id);
    set({ selectedFamilyId: id });
  },

  createBorrowRecord: (data) => {
    const newRecord: BorrowRecord = {
      ...data,
      id: generateId(),
      status: 'borrowed',
    };
    const borrowRecords = [...get().borrowRecords, newRecord];
    saveToStorage('borrowRecords', borrowRecords);
    set({ borrowRecords });

    const books = get().books.map((b) => (b.id === data.bookId ? { ...b, status: 'borrowed' as const } : b));
    saveToStorage('books', books);
    set({ books });
  },

  returnBook: (recordId, damageCheck, damageNotes) => {
    const record = get().borrowRecords.find((r) => r.id === recordId);
    if (!record) return;

    const borrowRecords = get().borrowRecords.map((r) =>
      r.id === recordId
        ? {
            ...r,
            status: 'returned' as const,
            actualReturnDate: today(),
            damageCheck,
            damageNotes,
          }
        : r
    );
    saveToStorage('borrowRecords', borrowRecords);

    const hasDamage = Object.values(damageCheck).some(Boolean) || damageNotes.trim().length > 0;
    const books = get().books.map((b) =>
      b.id === record.bookId
        ? {
            ...b,
            status: hasDamage ? 'damaged' as const : 'available' as const,
            damageLocation: hasDamage && damageNotes ? damageNotes : b.damageLocation,
          }
        : b
    );
    saveToStorage('books', books);
    set({ borrowRecords, books });
  },

  updateOverdueStatus: () => {
    const todayStr = today();
    const borrowRecords = get().borrowRecords.map((r) => {
      if (r.status === 'borrowed' && r.expectedReturnDate < todayStr) {
        return { ...r, status: 'overdue' as const };
      }
      return r;
    });
    saveToStorage('borrowRecords', borrowRecords);
    set({ borrowRecords });
  },
}));
