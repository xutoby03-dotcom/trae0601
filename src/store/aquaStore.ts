import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tank, FilterMaterial, MaintenanceLog, WaterQuality, FilterMaterialType } from '@/types';
import { FILTER_MATERIAL_DEFAULTS } from '@/types';

interface AquaStore {
  tanks: Tank[];
  filterMaterials: FilterMaterial[];
  maintenanceLogs: MaintenanceLog[];
  waterQualities: WaterQuality[];
  activeTankId: string | null;

  setActiveTankId: (id: string) => void;
  addTank: (tank: Omit<Tank, 'id' | 'createdAt'>) => Tank;
  updateTank: (id: string, data: Partial<Tank>) => void;
  deleteTank: (id: string) => void;

  addFilterMaterial: (tankId: string, type: FilterMaterialType) => void;
  updateFilterMaterial: (id: string, data: Partial<FilterMaterial>) => void;
  replaceFilterMaterial: (id: string, note: string) => void;
  deleteFilterMaterial: (id: string) => void;
  initDefaultFilterMaterials: (tankId: string) => void;

  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id'>) => void;
  updateMaintenanceLog: (id: string, data: Partial<MaintenanceLog>) => void;
  deleteMaintenanceLog: (id: string) => void;

  addWaterQuality: (wq: Omit<WaterQuality, 'id'>) => void;
  updateWaterQuality: (id: string, data: Partial<WaterQuality>) => void;
  deleteWaterQuality: (id: string) => void;
}

const genId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

export const useAquaStore = create<AquaStore>()(
  persist(
    (set, get) => ({
      tanks: [],
      filterMaterials: [],
      maintenanceLogs: [],
      waterQualities: [],
      activeTankId: null,

      setActiveTankId: (id) => set({ activeTankId: id }),

      addTank: (tankData) => {
        const tank: Tank = {
          ...tankData,
          id: genId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => {
          const newTanks = [...s.tanks, tank];
          return { tanks: newTanks, activeTankId: newTanks.length === 1 ? tank.id : s.activeTankId };
        });
        get().initDefaultFilterMaterials(tank.id);
        return tank;
      },

      updateTank: (id, data) =>
        set((s) => ({
          tanks: s.tanks.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),

      deleteTank: (id) =>
        set((s) => ({
          tanks: s.tanks.filter((t) => t.id !== id),
          filterMaterials: s.filterMaterials.filter((f) => f.tankId !== id),
          maintenanceLogs: s.maintenanceLogs.filter((m) => m.tankId !== id),
          waterQualities: s.waterQualities.filter((w) => w.tankId !== id),
          activeTankId: s.activeTankId === id ? (s.tanks.find((t) => t.id !== id)?.id ?? null) : s.activeTankId,
        })),

      addFilterMaterial: (tankId, type) => {
        const defaults = FILTER_MATERIAL_DEFAULTS[type];
        const fm: FilterMaterial = {
          id: genId(),
          tankId,
          type,
          installDate: new Date().toISOString().split('T')[0],
          replaceCycleDays: defaults.replaceCycleDays,
          cleaningMethod: defaults.cleaningMethod,
          stock: 2,
          replaceHistory: [],
        };
        set((s) => ({ filterMaterials: [...s.filterMaterials, fm] }));
      },

      updateFilterMaterial: (id, data) =>
        set((s) => ({
          filterMaterials: s.filterMaterials.map((f) => (f.id === id ? { ...f, ...data } : f)),
        })),

      replaceFilterMaterial: (id, note) =>
        set((s) => ({
          filterMaterials: s.filterMaterials.map((f) =>
            f.id === id
              ? {
                  ...f,
                  installDate: new Date().toISOString().split('T')[0],
                  stock: Math.max(0, f.stock - 1),
                  replaceHistory: [
                    ...f.replaceHistory,
                    { id: genId(), date: new Date().toISOString().split('T')[0], note },
                  ],
                }
              : f
          ),
        })),

      deleteFilterMaterial: (id) =>
        set((s) => ({ filterMaterials: s.filterMaterials.filter((f) => f.id !== id) })),

      initDefaultFilterMaterials: (tankId) => {
        const types: FilterMaterialType[] = ['过滤棉', '生化棉', '陶瓷环', '活性炭', '除藻棉'];
        const newMaterials: FilterMaterial[] = types.map((type) => {
          const defaults = FILTER_MATERIAL_DEFAULTS[type];
          return {
            id: genId(),
            tankId,
            type,
            installDate: new Date().toISOString().split('T')[0],
            replaceCycleDays: defaults.replaceCycleDays,
            cleaningMethod: defaults.cleaningMethod,
            stock: 2,
            replaceHistory: [],
          };
        });
        set((s) => ({ filterMaterials: [...s.filterMaterials, ...newMaterials] }));
      },

      addMaintenanceLog: (logData) => {
        const log: MaintenanceLog = { ...logData, id: genId() };
        set((s) => ({ maintenanceLogs: [...s.maintenanceLogs, log] }));
      },

      updateMaintenanceLog: (id, data) =>
        set((s) => ({
          maintenanceLogs: s.maintenanceLogs.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),

      deleteMaintenanceLog: (id) =>
        set((s) => ({ maintenanceLogs: s.maintenanceLogs.filter((m) => m.id !== id) })),

      addWaterQuality: (wqData) => {
        const wq: WaterQuality = { ...wqData, id: genId() };
        set((s) => ({ waterQualities: [...s.waterQualities, wq] }));
      },

      updateWaterQuality: (id, data) =>
        set((s) => ({
          waterQualities: s.waterQualities.map((w) => (w.id === id ? { ...w, ...data } : w)),
        })),

      deleteWaterQuality: (id) =>
        set((s) => ({ waterQualities: s.waterQualities.filter((w) => w.id !== id) })),
    }),
    { name: 'aqua-filter-tracker' }
  )
);
