import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Stroller, PatrolRecord, Filters, StrollerStatus, LocationStats } from '@/types';
import { mockStrollers, mockPatrolRecords } from '@/data/mockData';
import { generateId, isFireExitLocation, daysBetween, isInMonth } from '@/utils/helpers';
import { LONG_TERM_THRESHOLD_DAYS } from '@/utils/constants';

interface StrollerStore {
  strollers: Stroller[];
  patrolRecords: PatrolRecord[];
  filters: Filters;
  activePatrolStrollerId: string | null;
  activeFormStrollerId: string | null;
  activeDetailStrollerId: string | null;

  setFilters: (f: Partial<Filters>) => void;
  setActivePatrol: (id: string | null) => void;
  setActiveForm: (id: string | null) => void;
  setActiveDetail: (id: string | null) => void;

  addStroller: (data: Omit<Stroller, 'id' | 'createdAt' | 'updatedAt' | 'isFireExit'>) => void;
  updateStroller: (
    id: string,
    data: Partial<Omit<Stroller, 'id' | 'createdAt' | 'updatedAt' | 'isFireExit'>>
  ) => void;
  deleteStroller: (id: string) => void;

  addPatrolRecord: (
    data: Omit<PatrolRecord, 'id' | 'createdAt'> & { status: StrollerStatus }
  ) => void;

  getFilteredStrollers: () => Stroller[];
  getStrollerById: (id: string) => Stroller | undefined;
  getRecordsByStrollerId: (id: string) => PatrolRecord[];
  getTopBlockingLocations: (limit?: number, monthFilter?: { year: number; month: number }) => LocationStats[];
  getBlockingRecordCount: (monthFilter?: { year: number; month: number }) => number;
  getLongUnclaimedCars: () => Stroller[];
  getFireExitBlockingCount: () => number;
  getTotalStats: () => {
    total: number;
    blocking: number;
    pending: number;
    fireExit: number;
    unclaimed: number;
  };
}

export const useStrollerStore = create<StrollerStore>()(
  persist(
    (set, get) => ({
      strollers: mockStrollers,
      patrolRecords: mockPatrolRecords,
      filters: { building: 'all', location: 'all', status: 'all' } as Filters,
      activePatrolStrollerId: null,
      activeFormStrollerId: null,
      activeDetailStrollerId: null,

      setFilters: (f) => set((state) => ({ filters: { ...state.filters, ...f } })),
      setActivePatrol: (id) => set({ activePatrolStrollerId: id }),
      setActiveForm: (id) => set({ activeFormStrollerId: id }),
      setActiveDetail: (id) => set({ activeDetailStrollerId: id }),

      addStroller: (data) => {
        const now = new Date().toISOString();
        const newItem: Stroller = {
          ...data,
          id: generateId(),
          isFireExit: isFireExitLocation(data.location),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ strollers: [newItem, ...state.strollers] }));
      },

      updateStroller: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          strollers: state.strollers.map((s) =>
            s.id === id
              ? {
                  ...s,
                  ...data,
                  isFireExit: data.location ? isFireExitLocation(data.location) : s.isFireExit,
                  updatedAt: now,
                }
              : s
          ),
        }));
      },

      deleteStroller: (id) => {
        set((state) => ({
          strollers: state.strollers.filter((s) => s.id !== id),
          patrolRecords: state.patrolRecords.filter((r) => r.strollerId !== id),
        }));
      },

      addPatrolRecord: (data) => {
        const now = new Date().toISOString();
        const record: PatrolRecord = {
          ...data,
          id: generateId(),
          createdAt: now,
        };
        set((state) => ({
          patrolRecords: [record, ...state.patrolRecords],
          strollers: state.strollers.map((s) =>
            s.id === data.strollerId ? { ...s, status: data.status, updatedAt: now } : s
          ),
        }));
      },

      getFilteredStrollers: () => {
        const { strollers, filters } = get();
        return strollers.filter((s) => {
          if (filters.building !== 'all' && s.building !== filters.building) return false;
          if (filters.location !== 'all' && s.location !== filters.location) return false;
          if (filters.status !== 'all' && s.status !== filters.status) return false;
          return true;
        });
      },

      getStrollerById: (id) => get().strollers.find((s) => s.id === id),

      getRecordsByStrollerId: (id) =>
        get()
          .patrolRecords.filter((r) => r.strollerId === id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      getTopBlockingLocations: (limit = 10, monthFilter) => {
        const { patrolRecords, strollers } = get();
        const locationMap = new Map<string, number>();
        patrolRecords
          .filter((r) => r.status === 'blocking')
          .filter((r) => (monthFilter ? isInMonth(r.createdAt, monthFilter.year, monthFilter.month) : true))
          .forEach((r) => {
            const s = strollers.find((x) => x.id === r.strollerId);
            if (s) {
              locationMap.set(s.location, (locationMap.get(s.location) ?? 0) + 1);
            }
          });
        return Array.from(locationMap.entries())
          .map(([location, blockingCount]) => ({ location, blockingCount }))
          .sort((a, b) => b.blockingCount - a.blockingCount)
          .slice(0, limit);
      },

      getBlockingRecordCount: (monthFilter) => {
        const { patrolRecords } = get();
        return patrolRecords.filter(
          (r) =>
            r.status === 'blocking' &&
            (monthFilter ? isInMonth(r.createdAt, monthFilter.year, monthFilter.month) : true)
        ).length;
      },

      getLongUnclaimedCars: () =>
        get()
          .strollers.filter(
            (s) =>
              s.status !== 'moved' && daysBetween(s.updatedAt) > LONG_TERM_THRESHOLD_DAYS
          )
          .sort((a, b) => daysBetween(b.updatedAt) - daysBetween(a.updatedAt)),

      getFireExitBlockingCount: () =>
        get().strollers.filter((s) => s.isFireExit && s.status === 'blocking').length,

      getTotalStats: () => {
        const { strollers, getLongUnclaimedCars } = get();
        return {
          total: strollers.length,
          blocking: strollers.filter((s) => s.status === 'blocking').length,
          pending: strollers.filter((s) => s.status === 'pending').length,
          fireExit: strollers.filter((s) => s.isFireExit).length,
          unclaimed: getLongUnclaimedCars().length,
        };
      },
    }),
    {
      name: 'stroller-management-store',
      version: 1,
    }
  )
);
