import { create } from 'zustand';
import { Product } from '@/types';
import { saveToStorage, loadFromStorage } from '@/utils/storage';
import { generateId } from '@/utils/dateUtils';
import { mockProducts } from '@/data/mockData';

interface ProductState {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  loadProducts: () => void;
}

const STORAGE_KEY = 'yogurt_products';

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],

  loadProducts: () => {
    const stored = loadFromStorage<Product[]>(STORAGE_KEY, []);
    if (stored.length === 0) {
      saveToStorage(STORAGE_KEY, mockProducts);
      set({ products: mockProducts });
    } else {
      set({ products: stored });
    }
  },

  addProduct: (productData) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const products = [...get().products, newProduct];
    saveToStorage(STORAGE_KEY, products);
    set({ products });
  },

  updateProduct: (id, productData) => {
    const products = get().products.map(p =>
      p.id === id
        ? { ...p, ...productData, updatedAt: new Date().toISOString() }
        : p
    );
    saveToStorage(STORAGE_KEY, products);
    set({ products });
  },

  deleteProduct: (id) => {
    const products = get().products.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEY, products);
    set({ products });
  },

  getProductById: (id) => {
    return get().products.find(p => p.id === id);
  },
}));
