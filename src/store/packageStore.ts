import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { differenceInHours, startOfToday } from 'date-fns';
import type {
  PackageItem,
  DelayLevel,
  DashboardStats,
  HourlyData,
  CourierDelayData,
} from '@/types';
import { generateId, generatePickupCode, getSlotLabel, getDelayLevel } from '@/utils';
import { MOCK_PACKAGES } from '@/mock/data';
import { useShelfStore } from './shelfStore';

interface PackageState {
  packages: PackageItem[];
  registerPackage: (data: {
    shelfId: string;
    shelfSlotId: string;
    floor: number;
    slotNumber: number;
    recipientName: string;
    phoneLast4: string;
    courierCompany: string;
    packageSize: 'S' | 'M' | 'L';
    photoUrl: string;
  }) => PackageItem;
  pickupPackage: (packageId: string, pickupName: string) => void;
  markException: (packageId: string) => void;
  markTransferred: (packageId: string) => void;
  getStoredPackages: () => PackageItem[];
  getDelayedPackages: () => PackageItem[];
  getByDelayLevel: (level: DelayLevel) => PackageItem[];
  searchPackages: (keyword: string) => PackageItem[];
  getDashboardStats: () => DashboardStats;
  getHourlyData: () => HourlyData[];
  getCourierDelayData: () => CourierDelayData[];
  getTodayPickedCount: () => number;
}

function markSlotsFromPackages(packages: PackageItem[]) {
  const { slots, setSlotOccupied } = useShelfStore.getState();
  packages.forEach((pkg) => {
    if (pkg.status === 'stored') {
      const slot = slots.find((s) => s.id === pkg.shelfSlotId);
      if (slot && !slot.isOccupied) {
        setSlotOccupied(pkg.shelfSlotId, true);
      }
    }
  });
}

export const usePackageStore = create<PackageState>()(
  persist(
    (set, get) => {
      markSlotsFromPackages(MOCK_PACKAGES);

      return {
        packages: MOCK_PACKAGES,

        registerPackage: (data) => {
          const newPkg: PackageItem = {
            id: generateId(),
            shelfId: data.shelfId,
            shelfSlotId: data.shelfSlotId,
            slotLabel: getSlotLabel(data.floor, data.slotNumber),
            recipientName: data.recipientName,
            phoneLast4: data.phoneLast4,
            courierCompany: data.courierCompany,
            packageSize: data.packageSize,
            photoUrl: data.photoUrl,
            storedAt: new Date().toISOString(),
            status: 'stored',
            pickupCode: generatePickupCode(),
          };
          useShelfStore.getState().setSlotOccupied(data.shelfSlotId, true);
          set((state) => ({ packages: [newPkg, ...state.packages] }));
          return newPkg;
        },

        pickupPackage: (packageId, pickupName) => {
          const pkg = get().packages.find((p) => p.id === packageId);
          if (pkg) {
            useShelfStore.getState().setSlotOccupied(pkg.shelfSlotId, false);
          }
          set((state) => ({
            packages: state.packages.map((p) =>
              p.id === packageId
                ? { ...p, status: 'picked', pickedAt: new Date().toISOString(), pickupName }
                : p,
            ),
          }));
        },

        markException: (packageId) => {
          const pkg = get().packages.find((p) => p.id === packageId);
          if (pkg) {
            useShelfStore.getState().setSlotOccupied(pkg.shelfSlotId, false);
          }
          set((state) => ({
            packages: state.packages.map((p) =>
              p.id === packageId ? { ...p, status: 'exception' } : p,
            ),
          }));
        },

        markTransferred: (packageId) => {
          const pkg = get().packages.find((p) => p.id === packageId);
          if (pkg) {
            useShelfStore.getState().setSlotOccupied(pkg.shelfSlotId, false);
          }
          set((state) => ({
            packages: state.packages.map((p) =>
              p.id === packageId ? { ...p, status: 'transferred' } : p,
            ),
          }));
        },

        getStoredPackages: () => get().packages.filter((p) => p.status === 'stored'),

        getDelayedPackages: () =>
          get()
            .packages.filter((p) => p.status === 'stored')
            .filter((p) => getDelayLevel(p.storedAt) !== 'normal')
            .sort((a, b) => new Date(a.storedAt).getTime() - new Date(b.storedAt).getTime()),

        getByDelayLevel: (level) =>
          get()
            .packages.filter((p) => p.status === 'stored')
            .filter((p) => getDelayLevel(p.storedAt) === level),

        searchPackages: (keyword) => {
          const kw = keyword.toLowerCase().trim();
          if (!kw) return get().getStoredPackages();
          return get()
            .getStoredPackages()
            .filter(
              (p) =>
                p.recipientName.toLowerCase().includes(kw) ||
                p.phoneLast4.includes(kw) ||
                p.courierCompany.toLowerCase().includes(kw) ||
                p.slotLabel.toLowerCase().includes(kw) ||
                p.pickupCode.includes(kw),
            );
        },

        getDashboardStats: () => {
          const totalSlots = useShelfStore.getState().getTotalCapacity();
          const occupiedSlots = useShelfStore.getState().getOccupiedCount();
          const stored = get().packages.filter((p) => p.status === 'stored');
          const delayed24h = stored.filter((p) => {
            const h = differenceInHours(new Date(), new Date(p.storedAt));
            return h >= 24 && h < 72;
          }).length;
          const delayed72h = stored.filter(
            (p) => differenceInHours(new Date(), new Date(p.storedAt)) >= 72,
          ).length;
          return {
            totalSlots,
            occupiedSlots,
            occupancyRate: totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0,
            storedCount: stored.length,
            delayed24hCount: delayed24h,
            delayed72hCount: delayed72h,
            todayPickedCount: get().getTodayPickedCount(),
          };
        },

        getHourlyData: () => {
          const today = startOfToday().getTime();
          const data: HourlyData[] = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            stored: 0,
            picked: 0,
          }));
          get().packages.forEach((p) => {
            const storedTime = new Date(p.storedAt).getTime();
            if (storedTime >= today) {
              const h = new Date(p.storedAt).getHours();
              data[h].stored++;
            }
            if (p.pickedAt) {
              const pickedTime = new Date(p.pickedAt).getTime();
              if (pickedTime >= today) {
                const h = new Date(p.pickedAt).getHours();
                data[h].picked++;
              }
            }
          });
          return data;
        },

        getCourierDelayData: () => {
          const stored = get().packages.filter((p) => p.status === 'stored');
          const map = new Map<string, { total: number; delayed: number }>();
          stored.forEach((p) => {
            const entry = map.get(p.courierCompany) || { total: 0, delayed: 0 };
            entry.total++;
            if (differenceInHours(new Date(), new Date(p.storedAt)) >= 24) {
              entry.delayed++;
            }
            map.set(p.courierCompany, entry);
          });
          return Array.from(map.entries())
            .map(([name, v]) => ({
              name,
              total: v.total,
              delayed: v.delayed,
              rate: v.total > 0 ? Math.round((v.delayed / v.total) * 100) : 0,
            }))
            .sort((a, b) => b.rate - a.rate);
        },

        getTodayPickedCount: () => {
          const today = startOfToday().getTime();
          return get().packages.filter(
            (p) => p.status === 'picked' && p.pickedAt && new Date(p.pickedAt).getTime() >= today,
          ).length;
        },
      };
    },
    {
      name: 'package-storage',
    },
  ),
);
