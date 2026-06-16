import { create } from 'zustand';
import type { Elevator, Reservation, Inspection, CompletionRecord } from '../../shared/types';
import { elevatorApi, reservationApi, inspectionApi, completionApi } from '../lib/api';

interface AppState {
  elevators: Elevator[];
  reservations: Reservation[];
  todayReservations: Reservation[];
  pendingInspections: Inspection[];
  loading: boolean;
  error: string | null;
  
  fetchElevators: () => Promise<void>;
  fetchReservations: (params?: { date?: string; status?: string; elevatorId?: string }) => Promise<void>;
  fetchTodayReservations: () => Promise<void>;
  fetchPendingInspections: () => Promise<void>;
  
  createReservation: (data: Omit<Reservation, 'id' | 'createdAt' | 'elevator'>) => Promise<Reservation>;
  updateReservationStatus: (id: string, status: Reservation['status']) => Promise<void>;
  approveReservation: (id: string) => Promise<Reservation>;
  cancelReservation: (id: string) => Promise<Reservation>;
  
  createElevator: (data: Omit<Elevator, 'id' | 'createdAt' | 'maintenanceSchedule' | 'timeSlots'>) => Promise<Elevator>;
  updateElevator: (id: string, data: Partial<Elevator>) => Promise<Elevator>;
  deleteElevator: (id: string) => Promise<void>;
  
  createCompletionRecord: (data: Omit<CompletionRecord, 'id' | 'completedAt'>) => Promise<{ completion: CompletionRecord; inspection?: Inspection }>;
  
  updateInspection: (id: string, data: Partial<Inspection>) => Promise<void>;
  
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  elevators: [],
  reservations: [],
  todayReservations: [],
  pendingInspections: [],
  loading: false,
  error: null,

  fetchElevators: async () => {
    set({ loading: true, error: null });
    try {
      const data = await elevatorApi.getAll();
      set({ elevators: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchReservations: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await reservationApi.getAll(params);
      set({ reservations: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchTodayReservations: async () => {
    set({ loading: true, error: null });
    try {
      const data = await reservationApi.getToday();
      set({ todayReservations: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchPendingInspections: async () => {
    set({ loading: true, error: null });
    try {
      const data = await inspectionApi.getPending();
      set({ pendingInspections: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createReservation: async (data) => {
    set({ loading: true, error: null });
    try {
      const reservation = await reservationApi.create(data);
      set((state) => ({
        reservations: [...state.reservations, reservation],
      }));
      return reservation;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateReservationStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const updated = await reservationApi.updateStatus(id, status);
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? updated : r)),
        todayReservations: state.todayReservations.map((r) => (r.id === id ? updated : r)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  approveReservation: async (id) => {
    set({ loading: true, error: null });
    try {
      const updated = await reservationApi.approve(id);
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? updated : r)),
        todayReservations: state.todayReservations.map((r) => (r.id === id ? updated : r)),
      }));
      return updated;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  cancelReservation: async (id) => {
    set({ loading: true, error: null });
    try {
      const updated = await reservationApi.cancel(id);
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? updated : r)),
        todayReservations: state.todayReservations.map((r) => (r.id === id ? updated : r)),
      }));
      return updated;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createElevator: async (data) => {
    set({ loading: true, error: null });
    try {
      const elevator = await elevatorApi.create(data);
      set((state) => ({
        elevators: [...state.elevators, elevator],
      }));
      return elevator;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateElevator: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const elevator = await elevatorApi.update(id, data);
      set((state) => ({
        elevators: state.elevators.map((e) => (e.id === id ? elevator : e)),
      }));
      return elevator;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteElevator: async (id) => {
    set({ loading: true, error: null });
    try {
      await elevatorApi.delete(id);
      set((state) => ({
        elevators: state.elevators.filter((e) => e.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createCompletionRecord: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await completionApi.create(data);
      
      if (result.inspection) {
        set((state) => ({
          pendingInspections: [...state.pendingInspections, result.inspection!],
        }));
      }
      
      return result;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateInspection: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await inspectionApi.update(id, data);
      set((state) => ({
        pendingInspections: state.pendingInspections.filter((i) => i.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  setError: (error) => set({ error }),
}));
