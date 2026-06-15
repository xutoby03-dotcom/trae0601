import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Medicine, PurchaseItem, BuildingStats, Cabinet } from '@/types';
import { BUILDING_NAMES } from '@/types';
import { mockMedicines, mockCabinets } from '@/utils/mockData';
import { generateId, getMedicineStatus } from '@/utils/statusUtils';
import { isExpired, isExpiringSoon } from '@/utils/dateUtils';

interface MedicineState {
  medicines: Medicine[];
  initData: () => void;
  getMedicinesByCabinet: (cabinetId: string) => Medicine[];
  getMedicineById: (id: string) => Medicine | undefined;
  updateQuantity: (id: string, delta: number, supplier?: string) => void;
  checkExpiry: () => void;
  getPurchaseList: () => PurchaseItem[];
  getBuildingStats: () => BuildingStats[];
  getExpiringSoon: (days?: number) => Medicine[];
  getTotalMedicines: () => number;
  getExpiredCount: () => number;
  getLowStockCount: () => number;
  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt' | 'isExpired'>) => void;
}

export const useMedicineStore = create<MedicineState>()(
  persist(
    (set, get) => ({
      medicines: [],
      
      initData: () => {
        const { medicines } = get();
        if (medicines.length === 0) {
          const processedMedicines = mockMedicines.map(m => ({
            ...m,
            isExpired: isExpired(m.expiryDate),
          }));
          set({ medicines: processedMedicines });
        } else {
          get().checkExpiry();
        }
      },
      
      getMedicinesByCabinet: (cabinetId) => {
        return get().medicines.filter(m => m.cabinetId === cabinetId);
      },
      
      getMedicineById: (id) => {
        return get().medicines.find(m => m.id === id);
      },
      
      updateQuantity: (id, delta, supplier) => {
        set(state => ({
          medicines: state.medicines.map(m => {
            if (m.id === id) {
              const newQuantity = Math.max(0, m.currentQuantity + delta);
              return {
                ...m,
                currentQuantity: newQuantity,
                lastSupplier: supplier || m.lastSupplier,
              };
            }
            return m;
          }),
        }));
      },
      
      checkExpiry: () => {
        set(state => ({
          medicines: state.medicines.map(m => ({
            ...m,
            isExpired: isExpired(m.expiryDate),
          })),
        }));
      },
      
      getPurchaseList: () => {
        const { medicines } = get();
        const cabinets: Cabinet[] = mockCabinets;
        const purchaseItems: PurchaseItem[] = [];
        
        medicines.forEach(m => {
          const status = getMedicineStatus(m);
          if (status === 'insufficient' && !m.isExpired) {
            const cabinet = cabinets.find(c => c.id === m.cabinetId);
            if (cabinet) {
              purchaseItems.push({
                medicineId: m.id,
                medicineName: m.name,
                cabinetId: m.cabinetId,
                cabinetName: cabinet.name,
                building: cabinet.building,
                currentQuantity: m.currentQuantity,
                minimumQuantity: m.minimumQuantity,
                gap: m.minimumQuantity - m.currentQuantity,
              });
            }
          }
        });
        
        return purchaseItems.sort((a, b) => b.gap - a.gap);
      },
      
      getBuildingStats: () => {
        const { medicines } = get();
        const cabinets: Cabinet[] = mockCabinets;
        const statsMap = new Map();
        
        cabinets.forEach(cabinet => {
          statsMap.set(cabinet.building, {
            building: cabinet.building,
            buildingName: BUILDING_NAMES[cabinet.building],
            lowStockCount: 0,
            expiredCount: 0,
            expiringSoonCount: 0,
            totalMedicines: 0,
          });
        });
        
        medicines.forEach(m => {
          const cabinet = cabinets.find(c => c.id === m.cabinetId);
          if (!cabinet) return;
          
          const stats = statsMap.get(cabinet.building);
          if (!stats) return;
          
          stats.totalMedicines++;
          
          const status = getMedicineStatus(m);
          if (status === 'insufficient') {
            stats.lowStockCount++;
          }
          if (m.isExpired) {
            stats.expiredCount++;
          }
          if (isExpiringSoon(m.expiryDate) && !m.isExpired) {
            stats.expiringSoonCount++;
          }
        });
        
        return Array.from(statsMap.values());
      },
      
      getExpiringSoon: (days = 30) => {
        const { medicines } = get();
        return medicines.filter(m => isExpiringSoon(m.expiryDate, days) && !m.isExpired);
      },
      
      getTotalMedicines: () => {
        return get().medicines.reduce((sum, m) => sum + m.currentQuantity, 0);
      },
      
      getExpiredCount: () => {
        return get().medicines.filter(m => m.isExpired).length;
      },
      
      getLowStockCount: () => {
        const { medicines } = get();
        return medicines.filter(m => {
          const status = getMedicineStatus(m);
          return status === 'insufficient' || status === 'low';
        }).length;
      },
      
      addMedicine: (medicine) => {
        const newMedicine: Medicine = {
          ...medicine,
          id: generateId(),
          createdAt: new Date().toISOString(),
          isExpired: isExpired(medicine.expiryDate),
        };
        set(state => ({
          medicines: [...state.medicines, newMedicine],
        }));
      },
    }),
    {
      name: 'medicine-storage',
    }
  )
);
