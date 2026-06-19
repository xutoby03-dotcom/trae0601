import { create } from 'zustand';
import { Sale, SaleItem } from '@/types';
import { saveToStorage, loadFromStorage } from '@/utils/storage';
import { generateId } from '@/utils/dateUtils';
import { mockSales } from '@/data/mockData';

interface SaleState {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => void;
  getSalesByDate: (date: string) => Sale[];
  getSalesByDateRange: (startDate: string, endDate: string) => Sale[];
  loadSales: () => void;
}

const STORAGE_KEY = 'yogurt_sales';

export const useSaleStore = create<SaleState>((set, get) => ({
  sales: [],

  loadSales: () => {
    const stored = loadFromStorage<Sale[]>(STORAGE_KEY, []);
    if (stored.length === 0) {
      saveToStorage(STORAGE_KEY, mockSales);
      set({ sales: mockSales });
    } else {
      set({ sales: stored });
    }
  },

  addSale: (saleData) => {
    const newSale: Sale = {
      ...saleData,
      id: generateId(),
    };
    const sales = [newSale, ...get().sales];
    saveToStorage(STORAGE_KEY, sales);
    set({ sales });
  },

  getSalesByDate: (date) => {
    return get().sales.filter(s => s.saleTime.startsWith(date));
  },

  getSalesByDateRange: (startDate, endDate) => {
    return get().sales.filter(s => {
      const saleDate = s.saleTime.slice(0, 10);
      return saleDate >= startDate && saleDate <= endDate;
    });
  },
}));
