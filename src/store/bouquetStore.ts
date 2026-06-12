import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Bouquet } from '@/types';
import { mockBouquets } from '@/utils/mock';

interface BouquetStore {
  bouquets: Bouquet[];
  addBouquet: (bouquet: Omit<Bouquet, 'id' | 'createdAt' | 'reservedCount'>) => void;
  updateBouquet: (id: string, updates: Partial<Bouquet>) => void;
  deleteBouquet: (id: string) => void;
  getBouquetById: (id: string) => Bouquet | undefined;
  updateReservedCount: (id: string, delta: number) => void;
  decreaseStock: (id: string, quantity: number) => void;
}

export const useBouquetStore = create<BouquetStore>()(
  persist(
    (set, get) => ({
      bouquets: mockBouquets,
      
      addBouquet: (bouquet) => set((state) => ({
        bouquets: [...state.bouquets, {
          ...bouquet,
          id: `bq${Date.now()}`,
          reservedCount: 0,
          createdAt: new Date().toISOString(),
        }],
      })),
      
      updateBouquet: (id, updates) => set((state) => ({
        bouquets: state.bouquets.map(b => 
          b.id === id ? { ...b, ...updates } : b
        ),
      })),
      
      deleteBouquet: (id) => set((state) => ({
        bouquets: state.bouquets.filter(b => b.id !== id),
      })),
      
      getBouquetById: (id) => {
        return get().bouquets.find(b => b.id === id);
      },
      
      updateReservedCount: (id, delta) => set((state) => ({
        bouquets: state.bouquets.map(b =>
          b.id === id ? { ...b, reservedCount: Math.max(0, b.reservedCount + delta) } : b
        ),
      })),
      
      decreaseStock: (id, quantity) => set((state) => ({
        bouquets: state.bouquets.map(b =>
          b.id === id ? { 
            ...b, 
            stock: Math.max(0, b.stock - quantity),
            reservedCount: Math.max(0, b.reservedCount - quantity),
          } : b
        ),
      })),
    }),
    {
      name: 'bouquet-storage',
    }
  )
);
