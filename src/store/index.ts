import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Shoe, Run, ShoeWithStats, Surface } from '@/types';

interface ShoeStore {
  shoes: Shoe[];
  runs: Run[];
  addShoe: (shoe: Omit<Shoe, 'id' | 'createdAt'>) => void;
  updateShoe: (id: string, updates: Partial<Shoe>) => void;
  deleteShoe: (id: string) => void;
  toggleRaceLock: (id: string) => void;
  addRun: (run: Omit<Run, 'id' | 'createdAt'>) => void;
  deleteRun: (id: string) => void;
  getShoeById: (id: string) => Shoe | undefined;
  getShoesWithStats: () => ShoeWithStats[];
  getSortedShoes: () => ShoeWithStats[];
  getRunsByShoeId: (shoeId: string) => Run[];
  getTotalStats: () => {
    totalDistance: number;
    totalShoes: number;
    activeShoes: number;
    totalCost: number;
    avgCostPerKm: number;
    surfaceComparison: Record<Surface, {
      distance: number;
      count: number;
      lifeConsumed: number;
      wearNotesCount: number;
      wearScore: number;
    }>;
  };
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const MOCK_SHOES: Shoe[] = [
  {
    id: 'shoe1',
    brand: 'Nike',
    model: 'ZoomX Vaporfly Next% 2',
    purchasePrice: 1899,
    startDate: '2025-03-15',
    suitableSurfaces: ['asphalt', 'track'],
    maxKilometers: 600,
    isRaceLocked: true,
    createdAt: '2025-03-15T10:00:00Z',
  },
  {
    id: 'shoe2',
    brand: 'Hoka',
    model: 'Clifton 9',
    purchasePrice: 1099,
    startDate: '2025-01-20',
    suitableSurfaces: ['asphalt', 'concrete', 'treadmill'],
    maxKilometers: 800,
    isRaceLocked: false,
    createdAt: '2025-01-20T10:00:00Z',
  },
  {
    id: 'shoe3',
    brand: 'Adidas',
    model: 'Adizero Adios Pro 3',
    purchasePrice: 1699,
    startDate: '2025-04-01',
    suitableSurfaces: ['track', 'asphalt'],
    maxKilometers: 500,
    isRaceLocked: true,
    createdAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 'shoe4',
    brand: 'Brooks',
    model: 'Ghost 15',
    purchasePrice: 899,
    startDate: '2024-11-10',
    suitableSurfaces: ['asphalt', 'concrete'],
    maxKilometers: 700,
    isRaceLocked: false,
    createdAt: '2024-11-10T10:00:00Z',
  },
];

const MOCK_RUNS: Run[] = [
  { id: 'r1', shoeId: 'shoe2', date: '2026-06-10', kilometers: 8.5, surface: 'asphalt', weather: 'sunny', feelRating: 4, createdAt: '2026-06-10T07:00:00Z' },
  { id: 'r2', shoeId: 'shoe2', date: '2026-06-08', kilometers: 10.2, surface: 'concrete', weather: 'cloudy', feelRating: 3, wearNotes: '中底开始有些软', createdAt: '2026-06-08T07:00:00Z' },
  { id: 'r3', shoeId: 'shoe2', date: '2026-06-05', kilometers: 6.0, surface: 'treadmill', weather: 'hot', feelRating: 5, createdAt: '2026-06-05T18:00:00Z' },
  { id: 'r4', shoeId: 'shoe4', date: '2026-06-09', kilometers: 12.0, surface: 'asphalt', weather: 'sunny', feelRating: 3, wearNotes: '外底磨损明显', createdAt: '2026-06-09T06:30:00Z' },
  { id: 'r5', shoeId: 'shoe4', date: '2026-06-06', kilometers: 5.5, surface: 'concrete', weather: 'rainy', feelRating: 2, wearNotes: '抓地力下降', createdAt: '2026-06-06T07:00:00Z' },
  { id: 'r6', shoeId: 'shoe4', date: '2026-06-03', kilometers: 15.0, surface: 'asphalt', weather: 'cloudy', feelRating: 3, createdAt: '2026-06-03T06:00:00Z' },
  { id: 'r7', shoeId: 'shoe4', date: '2026-05-31', kilometers: 21.1, surface: 'track', weather: 'sunny', feelRating: 4, createdAt: '2026-05-31T06:00:00Z' },
  { id: 'r8', shoeId: 'shoe1', date: '2026-05-28', kilometers: 10.0, surface: 'track', weather: 'sunny', feelRating: 5, createdAt: '2026-05-28T18:00:00Z' },
  { id: 'r9', shoeId: 'shoe1', date: '2026-05-25', kilometers: 42.2, surface: 'asphalt', weather: 'cloudy', feelRating: 5, wearNotes: '全马比赛用鞋，状态完美', createdAt: '2026-05-25T06:00:00Z' },
  { id: 'r10', shoeId: 'shoe3', date: '2026-06-01', kilometers: 8.0, surface: 'track', weather: 'hot', feelRating: 5, createdAt: '2026-06-01T18:00:00Z' },
  { id: 'r11', shoeId: 'shoe2', date: '2026-05-20', kilometers: 7.5, surface: 'asphalt', weather: 'cold', feelRating: 4, createdAt: '2026-05-20T07:00:00Z' },
  { id: 'r12', shoeId: 'shoe2', date: '2026-05-15', kilometers: 9.0, surface: 'concrete', weather: 'sunny', feelRating: 4, createdAt: '2026-05-15T07:00:00Z' },
];

export const useShoeStore = create<ShoeStore>()(
  persist(
    (set, get) => ({
      shoes: MOCK_SHOES,
      runs: MOCK_RUNS,

      addShoe: (shoeData) => {
        const newShoe: Shoe = {
          ...shoeData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ shoes: [...state.shoes, newShoe] }));
      },

      updateShoe: (id, updates) => {
        set((state) => ({
          shoes: state.shoes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },

      deleteShoe: (id) => {
        set((state) => ({
          shoes: state.shoes.filter((s) => s.id !== id),
          runs: state.runs.filter((r) => r.shoeId !== id),
        }));
      },

      toggleRaceLock: (id) => {
        set((state) => ({
          shoes: state.shoes.map((s) =>
            s.id === id ? { ...s, isRaceLocked: !s.isRaceLocked } : s
          ),
        }));
      },

      addRun: (runData) => {
        const newRun: Run = {
          ...runData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ runs: [...state.runs, newRun] }));
      },

      deleteRun: (id) => {
        set((state) => ({ runs: state.runs.filter((r) => r.id !== id) }));
      },

      getShoeById: (id) => {
        return get().shoes.find((s) => s.id === id);
      },

      getShoesWithStats: () => {
        const { shoes, runs } = get();
        return shoes.map((shoe) => {
          const shoeRuns = runs.filter((r) => r.shoeId === shoe.id);
          const totalKilometers = shoeRuns.reduce((sum, r) => sum + r.kilometers, 0);
          const remainingKilometers = Math.max(0, shoe.maxKilometers - totalKilometers);
          const lifePercentage = Math.min(100, (totalKilometers / shoe.maxKilometers) * 100);
          const costPerKilometer = totalKilometers > 0 ? shoe.purchasePrice / totalKilometers : shoe.purchasePrice;
          return {
            ...shoe,
            totalKilometers,
            remainingKilometers,
            lifePercentage,
            costPerKilometer,
            runCount: shoeRuns.length,
          };
        });
      },

      getSortedShoes: () => {
        const shoes = get().getShoesWithStats();
        return shoes.sort((a, b) => b.lifePercentage - a.lifePercentage);
      },

      getRunsByShoeId: (shoeId) => {
        return get().runs
          .filter((r) => r.shoeId === shoeId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getTotalStats: () => {
        const { shoes, runs, getShoesWithStats } = get();
        const shoesWithStats = getShoesWithStats();
        const totalDistance = shoesWithStats.reduce((sum, s) => sum + s.totalKilometers, 0);
        const totalCost = shoes.reduce((sum, s) => sum + s.purchasePrice, 0);
        const avgCostPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;
        const activeShoes = shoesWithStats.filter((s) => s.lifePercentage < 100).length;

        const surfaceComparison = {} as Record<Surface, {
          distance: number;
          count: number;
          lifeConsumed: number;
          wearNotesCount: number;
          wearScore: number;
        }>;
        (['asphalt', 'concrete', 'track', 'trail', 'treadmill'] as Surface[]).forEach((s) => {
          surfaceComparison[s] = { distance: 0, count: 0, lifeConsumed: 0, wearNotesCount: 0, wearScore: 0 };
        });

        const shoeMap = new Map(shoesWithStats.map((s) => [s.id, s]));

        runs.forEach((r) => {
          const shoe = shoeMap.get(r.shoeId);
          if (!shoe) return;
          const lifeShare = shoe.maxKilometers > 0
            ? (r.kilometers / shoe.maxKilometers) * 100
            : 0;
          surfaceComparison[r.surface].distance += r.kilometers;
          surfaceComparison[r.surface].count += 1;
          surfaceComparison[r.surface].lifeConsumed += lifeShare;
          if (r.wearNotes && r.wearNotes.trim()) {
            surfaceComparison[r.surface].wearNotesCount += 1;
          }
        });

        Object.keys(surfaceComparison).forEach((key) => {
          const s = surfaceComparison[key as Surface];
          const km = s.distance;
          if (km === 0) {
            s.wearScore = 0;
          } else {
            const normalizedLife = s.lifeConsumed / km;
            const normalizedNotes = s.wearNotesCount / s.count;
            s.wearScore = normalizedLife * 0.6 + normalizedNotes * 40 * 0.4;
          }
        });

        return {
          totalDistance,
          totalShoes: shoes.length,
          activeShoes,
          totalCost,
          avgCostPerKm,
          surfaceComparison,
        };
      },
    }),
    {
      name: 'shoe-track-storage',
    }
  )
);
