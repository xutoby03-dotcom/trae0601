import { create } from 'zustand';
import type { Product, ProductBatch, BatchUrgency } from '@/types';
import { getStorage, setStorage } from '@/utils/storage';
import { mockProducts, mockBatches } from '@/data/mockData';
import { generateId, getDaysUntil } from '@/utils/date';

interface ProductState {
  products: Product[];
  batches: ProductBatch[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addBatch: (batch: Omit<ProductBatch, 'id' | 'createdAt'>) => void;
  updateBatchStock: (batchId: string, delta: number) => void;
  getProductById: (id: string) => Product | undefined;
  getBatchById: (id: string) => ProductBatch | undefined;
  getBatchesByProductId: (productId: string) => ProductBatch[];
  getBatchUrgency: (batch: ProductBatch) => BatchUrgency;
  getSortedBatchesByProductId: (productId: string) => ProductBatch[];
  getNearExpiryBatches: () => ProductBatch[];
}

const STORAGE_KEY = 'products';
const BATCH_STORAGE_KEY = 'batches';

export const useProductStore = create<ProductState>((set, get) => {
  const storedProducts = getStorage<Product[]>(STORAGE_KEY, []);
  const storedBatches = getStorage<ProductBatch[]>(BATCH_STORAGE_KEY, []);
  
  const initialProducts = storedProducts.length > 0 ? storedProducts : mockProducts;
  const initialBatches = storedBatches.length > 0 ? storedBatches : mockBatches;

  if (storedProducts.length === 0) {
    setStorage(STORAGE_KEY, initialProducts);
  }
  if (storedBatches.length === 0) {
    setStorage(BATCH_STORAGE_KEY, initialBatches);
  }

  return {
    products: initialProducts,
    batches: initialBatches,

    addProduct: (product) => {
      const newProduct: Product = {
        ...product,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => {
        const products = [...state.products, newProduct];
        setStorage(STORAGE_KEY, products);
        return { products };
      });
    },

    updateProduct: (id, data) => {
      set((state) => {
        const products = state.products.map((p) =>
          p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
        );
        setStorage(STORAGE_KEY, products);
        return { products };
      });
    },

    deleteProduct: (id) => {
      set((state) => {
        const products = state.products.filter((p) => p.id !== id);
        const batches = state.batches.filter((b) => b.productId !== id);
        setStorage(STORAGE_KEY, products);
        setStorage(BATCH_STORAGE_KEY, batches);
        return { products, batches };
      });
    },

    addBatch: (batch) => {
      const newBatch: ProductBatch = {
        ...batch,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        const batches = [...state.batches, newBatch];
        setStorage(BATCH_STORAGE_KEY, batches);
        return { batches };
      });
    },

    updateBatchStock: (batchId, delta) => {
      set((state) => {
        const batches = state.batches.map((b) =>
          b.id === batchId ? { ...b, stock: Math.max(0, b.stock + delta) } : b
        );
        setStorage(BATCH_STORAGE_KEY, batches);
        return { batches };
      });
    },

    getProductById: (id) => {
      return get().products.find((p) => p.id === id);
    },

    getBatchById: (id) => {
      return get().batches.find((b) => b.id === id);
    },

    getBatchesByProductId: (productId) => {
      return get().batches.filter((b) => b.productId === productId);
    },

    getBatchUrgency: (batch) => {
      const days = getDaysUntil(batch.expiryDate);
      if (days <= 0) return 'expired';
      if (days <= 3) return 'urgent';
      if (days <= 7) return 'near';
      return 'normal';
    },

    getSortedBatchesByProductId: (productId) => {
      const batches = get().getBatchesByProductId(productId);
      const urgencyOrder = { expired: 0, urgent: 1, near: 2, normal: 3 };
      return [...batches].sort((a, b) => {
        const urgencyA = urgencyOrder[get().getBatchUrgency(a)];
        const urgencyB = urgencyOrder[get().getBatchUrgency(b)];
        if (urgencyA !== urgencyB) return urgencyA - urgencyB;
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });
    },

    getNearExpiryBatches: () => {
      return get().batches.filter((b) => {
        const urgency = get().getBatchUrgency(b);
        return urgency === 'near' || urgency === 'urgent';
      });
    },
  };
});
