import { create } from 'zustand';
import type { TableData, ReservationData, StatsData } from '../../shared/types';

interface AppState {
  tables: TableData[];
  reservations: ReservationData[];
  stats: StatsData | null;
  selectedDate: string;
  isAdmin: boolean;
  loading: boolean;

  fetchTables: () => Promise<void>;
  fetchReservations: (date?: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  setSelectedDate: (date: string) => void;
  setIsAdmin: (isAdmin: boolean) => void;

  createTable: (data: any) => Promise<TableData | { error: string }>;
  updateTable: (id: number, data: any) => Promise<TableData | undefined>;
  deleteTable: (id: number) => Promise<boolean>;

  createReservation: (data: any) => Promise<ReservationData | { error: string }>;
  checkInReservation: (id: number) => Promise<void>;
  cancelReservation: (id: number) => Promise<void>;
}

const getTodayStr = () => new Date().toISOString().split('T')[0];

export const useStore = create<AppState>((set, get) => ({
  tables: [],
  reservations: [],
  stats: null,
  selectedDate: getTodayStr(),
  isAdmin: false,
  loading: false,

  fetchTables: async () => {
    const res = await fetch('/api/tables');
    const data = await res.json();
    set({ tables: data });
  },

  fetchReservations: async (date?: string) => {
    const targetDate = date || get().selectedDate;
    const res = await fetch(`/api/reservations?date=${targetDate}`);
    const data = await res.json();
    set({ reservations: data, selectedDate: targetDate });
  },

  fetchStats: async () => {
    const res = await fetch('/api/stats');
    const data = await res.json();
    set({ stats: data });
  },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().fetchReservations(date);
  },

  setIsAdmin: (isAdmin: boolean) => set({ isAdmin }),

  createTable: async (data) => {
    const res = await fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      get().fetchTables();
    }
    return result;
  },

  updateTable: async (id, data) => {
    const res = await fetch(`/api/tables/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      get().fetchTables();
    }
    return res.ok ? result : undefined;
  },

  deleteTable: async (id) => {
    const res = await fetch(`/api/tables/${id}`, { method: 'DELETE' });
    if (res.ok) {
      get().fetchTables();
    }
    return res.ok;
  },

  createReservation: async (data) => {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      get().fetchReservations();
    }
    return result;
  },

  checkInReservation: async (id) => {
    const res = await fetch(`/api/reservations/${id}/checkin`, { method: 'PUT' });
    if (res.ok) {
      get().fetchReservations();
      get().fetchStats();
    }
  },

  cancelReservation: async (id) => {
    const res = await fetch(`/api/reservations/${id}/cancel`, { method: 'PUT' });
    if (res.ok) {
      get().fetchReservations();
    }
  },
}));
