import { create } from 'zustand';
import { db } from '@/db';
import type { Incident, IncidentType, IncidentSeverity, IncidentStatus } from '@/types';
import { generateId } from '@/utils/id';

interface IncidentFilters {
  type?: IncidentType;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  furnitureId?: string;
  reporterId?: string;
  startDate?: string;
  endDate?: string;
}

interface IncidentState {
  incidents: Incident[];
  filteredIncidents: Incident[];
  filters: IncidentFilters;
  loading: boolean;
  error: string | null;
}

interface IncidentActions {
  fetchIncidents: () => Promise<void>;
  reportIncident: (incident: Omit<Incident, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Incident>;
  updateIncidentStatus: (id: string, status: IncidentStatus, handlerId?: string, resolution?: string, repairCost?: number) => Promise<void>;
  updateIncident: (id: string, updates: Partial<Incident>) => Promise<void>;
  getIncidentById: (id: string) => Incident | undefined;
  getIncidentsByFurniture: (furnitureId: string) => Incident[];
  getIncidentsByDailyRecord: (dailyRecordId: string) => Promise<Incident[]>;
  setFilters: (filters: Partial<IncidentFilters>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  clearError: () => void;
}

export type IncidentStore = IncidentState & IncidentActions;

const defaultFilters: IncidentFilters = {
  type: undefined,
  severity: undefined,
  status: undefined,
  furnitureId: undefined,
  reporterId: undefined,
  startDate: undefined,
  endDate: undefined,
};

export const useIncidentStore = create<IncidentStore>((set, get) => ({
  incidents: [],
  filteredIncidents: [],
  filters: defaultFilters,
  loading: false,
  error: null,

  fetchIncidents: async () => {
    set({ loading: true, error: null });
    try {
      const incidents = await db.incidents.orderBy('createdAt').reverse().toArray();
      set({ incidents, filteredIncidents: incidents, loading: false });
      get().applyFilters();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取事件列表失败', loading: false });
    }
  },

  reportIncident: async (incidentData) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      const newIncident: Incident = {
        ...incidentData,
        id: generateId('incident'),
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };
      await db.incidents.add(newIncident);
      
      const incidents = await db.incidents.orderBy('createdAt').reverse().toArray();
      set({ incidents, loading: false });
      get().applyFilters();
      return newIncident;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '上报事件失败', loading: false });
      throw error;
    }
  },

  updateIncidentStatus: async (id, status, handlerId, resolution, repairCost) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      const updates: Partial<Incident> = {
        status,
        updatedAt: now,
      };
      
      if (handlerId !== undefined) {
        updates.handlerId = handlerId;
      }
      if (resolution !== undefined) {
        updates.resolution = resolution;
      }
      if (repairCost !== undefined) {
        updates.repairCost = repairCost;
      }
      if (status === 'resolved') {
        updates.resolutionTime = now;
      }
      
      await db.incidents.update(id, updates);
      
      const incidents = await db.incidents.orderBy('createdAt').reverse().toArray();
      set({ incidents, loading: false });
      get().applyFilters();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新事件状态失败', loading: false });
      throw error;
    }
  },

  updateIncident: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      await db.incidents.update(id, { ...updates, updatedAt: now });
      
      const incidents = await db.incidents.orderBy('createdAt').reverse().toArray();
      set({ incidents, loading: false });
      get().applyFilters();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新事件失败', loading: false });
      throw error;
    }
  },

  getIncidentById: (id) => {
    return get().incidents.find(i => i.id === id);
  },

  getIncidentsByFurniture: (furnitureId) => {
    return get().incidents.filter(i => i.furnitureId === furnitureId);
  },

  getIncidentsByDailyRecord: async (dailyRecordId) => {
    try {
      return await db.incidents.where('dailyRecordId').equals(dailyRecordId).toArray();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '查询事件失败' });
      throw error;
    }
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().applyFilters();
  },

  clearFilters: () => {
    set({ filters: defaultFilters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { incidents, filters } = get();
    let filtered = [...incidents];

    if (filters.type) {
      filtered = filtered.filter(i => i.type === filters.type);
    }
    if (filters.severity) {
      filtered = filtered.filter(i => i.severity === filters.severity);
    }
    if (filters.status) {
      filtered = filtered.filter(i => i.status === filters.status);
    }
    if (filters.furnitureId) {
      filtered = filtered.filter(i => i.furnitureId === filters.furnitureId);
    }
    if (filters.reporterId) {
      filtered = filtered.filter(i => i.reporterId === filters.reporterId);
    }
    if (filters.startDate) {
      filtered = filtered.filter(i => i.reportTime >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter(i => i.reportTime <= filters.endDate!);
    }

    set({ filteredIncidents: filtered });
  },

  clearError: () => {
    set({ error: null });
  },
}));
